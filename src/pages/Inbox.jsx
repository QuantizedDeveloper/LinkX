import React, { useEffect, useRef, useState } from "react";
import Ably from "ably";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBell, FiMessageSquare } from "react-icons/fi";
import "./Inbox.css";
import { fetchWithAuth } from "../utils/api";
import { ArrowUpRight } from 'lucide-react';
import Gig from "../components/Gig";
const API = "https://linkx-backend-api-linkx-backend.hf.space";

export default function Inbox({ username }) {
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [showGigModal, setShowGigModal] = useState(false);

  const clientRef = useRef(null);

  // =========================
  // CHAT FETCH
  // =========================
  const { data: conversations = [] } = useQuery({
    queryKey: ["inbox"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/messaging/inbox/");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },

    //staleTime: 10 * 60 * 1000,
    //cacheTime: 30 * 60 * 1000,
    //refetchOnWindowFocus: false,
    //refetchOnMount: false,
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    
  });

  // =========================
  // NOTIFICATIONS FETCH
  // =========================
  const {
  data: notifications = [],
  refetch: refetchNotifications
} = useQuery({
  queryKey: ["notifications"],

  queryFn: async () => {
    const res = await fetchWithAuth(
      "/api/linkbot/notifications/"
    );

    if (!res.ok) throw new Error("Failed");

    return res.json();
  },

  staleTime: 0,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
});
const { data: selectedGig } = useQuery({
  queryKey: ["gig", selectedGigId],

  queryFn: async () => {

    if (!selectedGigId) return null;

    const res = await fetchWithAuth(
      `/api/gigs/gigs/${selectedGigId}/`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch gig");
    }

    return res.json();
  },

  enabled: !!selectedGigId,
});


  // =========================
  // REALTIME
  // =========================
  useEffect(() => {
    const client = new Ably.Realtime({
      authUrl: `${API}/api/messaging/ably-token/`,
      authHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    clientRef.current = client;

    client.connection.on("connected", async () => {

      // =========================
      // CHAT REALTIME
      // =========================
      const notifChannel = client.channels.get(
        `notifications_${username}`
      );

      notifChannel.subscribe("notification", (msg) => {
        const payload = msg.data;

        queryClient.setQueryData(["inbox"], (old = []) => {

          if (payload.type === "new_message") {

            const existing = old.find(
              (c) => c.id === payload.conversation_id
            );

            const updated = {
              id: payload.conversation_id,
              username: payload.sender_username,
              preview: payload.preview,
              updated: payload.timestamp,
              last_message_sender: payload.sender_username,
              last_message_status: "delivered",
              unread_count:
                (existing?.unread_count || 0) + 1,
            };

            if (existing) {
              return [
                updated,
                ...old.filter(
                  (c) => c.id !== payload.conversation_id
                ),
              ];
            }

            return [updated, ...old];
          }

          if (payload.type === "read_receipt") {
            return old.map((c) =>
              c.id === payload.conversation_id
                ? {
                    ...c,
                    last_message_status: "read",
                    unread_count: 0,
                  }
                : c
            );
          }

          return old;
        });

        // =========================
        // LINKBOT NOTIFICATION
        // =========================
        if (payload.type === "linkbot_notification") {

          queryClient.setQueryData(
            ["notifications"],
            (old = []) => [payload.notification, ...old]
          );
        }
      });

      // =========================
      // PRESENCE
      // =========================
      const presenceChannel =
        client.channels.get("global_presence");

      await presenceChannel.presence.enter(username);

      presenceChannel.presence.subscribe((member) => {

        setOnlineUsers((prev) => {

          if (member.action === "enter") {
            return [...new Set([
              ...prev,
              member.clientId
            ])];
          }

          if (member.action === "leave") {
            return prev.filter(
              (u) => u !== member.clientId
            );
          }

          return prev;
        });
      });
    });

    return () => {
      client.close();
    };
  }, [username, queryClient]);

  // =========================
  // FILTER
  // =========================
  const filtered = conversations.filter((c) =>
    c.username?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // =========================
  // HELPERS
  // =========================
  const formatTime = (time) => {
    if (!time) return "";

    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTicks = (status) => {
    if (status === "read") return "✓✓";
    if (status === "delivered") return "✓✓";
    return "✓";
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="inbox-container">

      {/* HEADER */}
      <div className="inbox-header">
        <h2>Inbox</h2>

        <button
          className="close-btn"
          onClick={() => navigate(-1)}
        >
          ✕
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="search"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABS */}
      <div className="tabs">

        <button
          className={
            activeTab === "notifications"
              ? "tab active-tab"
              : "tab"
          }
          onClick={() => {
          setActiveTab("notifications");
          refetchNotifications();
          }}
        >
          
          Notifications
        </button>

        <button
          className={
            activeTab === "chats"
              ? "tab active-tab"
              : "tab"
          }
          onClick={() => setActiveTab("chats")}
        >
  
          Chats
        </button>

      </div>

      {/* ========================= */}
      {/* NOTIFICATIONS */}
      {/* ========================= */}
      {activeTab === "notifications" && (
        <div className="notification-list">

          {notifications.length === 0 && (
            <div className="empty">
              No notifications yet
            </div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className="notification-card"
            >

              <div className="notification-icon">
                <ArrowUpRight color="white" size={50} />
              </div>

              <div className="notif-content">

                <div className="notif-title">
                  {n.title}
                </div>

                <div className="notif-text">
                  {n.message}
                </div>

                <div className="notif-time">
                  {formatTime(n.created_at)}
                </div>

                {n.gig_id && (
                  <button
                    className="view-gig-btn"
                    onClick={() => {
                    setSelectedGigId(n.gig_id);
                    setShowGigModal(true);
                      
                    }}
                  >
                    View Gig
                  </button>
                )}

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ========================= */}
      {/* CHATS */}
      {/* ========================= */}
      {activeTab === "chats" && (
        <div className="conversation-list">

          {filtered.map((c) => {

            const isOnline =
              onlineUsers.includes(c.username);

            return (
              <div
                key={c.id}
                className="conversation"
                onClick={() =>
                  navigate(`/chat/${c.username}`)
                }
              >

                <div className="avatar-wrapper">

                  <div className="avatar">
                    {c.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  {isOnline && (
                    <div className="online-dot"></div>
                  )}

                </div>

                <div className="info">

                  <div className="top-row">

                    <span className="username">
                      {c.username}
                    </span>

                    <span className="time">
                      {formatTime(c.updated)}
                    </span>

                  </div>

                  <div className="bottom-row">

                    <span
                      className={`preview ${
                        c.unread_count > 0
                          ? "unread"
                          : ""
                      }`}
                    >
                      {c.last_message_sender === username
                        ? "You: "
                        : ""}

                      {c.preview}
                    </span>

                    <div className="meta">

                      {c.last_message_sender === username && (
                        <span className="ticks">
                          {renderTicks(
                            c.last_message_status
                          )}
                        </span>
                      )}

                      {c.unread_count > 0 && (
                        <span className="badge">
                          {c.unread_count}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}
       {showGigModal && (
  <div
    className="gig-modal-overlay"
    onClick={() => setShowGigModal(false)}
  >

    <div
      className="gig-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="close-modal-btn"
        onClick={() => setShowGigModal(false)}
      >
        ✕
      </button>

      {selectedGig ? (
        <Gig gig={selectedGig} />
      ) : (
        <div>Loading...</div>
      )}

    </div>

  </div>
)}
    </div>
   
  );
}