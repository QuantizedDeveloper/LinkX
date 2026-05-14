import React, { useEffect, useRef, useState } from "react";
import Ably from "ably";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "./Inbox.css";
import { fetchWithAuth } from "../utils/api";

const API = "https://linkx-backend-api-linkx-backend.hf.space";

export default function Inbox({ username }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const clientRef = useRef(null);

  // ✅ React Query fetch
  const { data: conversations = [] } = useQuery({
    queryKey: ["inbox"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/messaging/inbox/");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },

    staleTime: 10 * 60 * 1000, // 10 min
    cacheTime: 30 * 60 * 1000, // keep cache 30 min
    refetchOnWindowFocus: false,
    refetchOnMount: false, // IMPORTANT
    keepPreviousData: true,
  });

  // ✅ Ably realtime updates → update cache directly
  useEffect(() => {
    const client = new Ably.Realtime({
      authUrl: `${API}/api/messaging/ably-token/`,
      authHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    clientRef.current = client;

    client.connection.on("connected", async () => {
      const notifChannel = client.channels.get(`notifications_${username}`);

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
              unread_count: (existing?.unread_count || 0) + 1,
            };

            if (existing) {
              return [
                updated,
                ...old.filter((c) => c.id !== payload.conversation_id),
              ];
            }

            return [updated, ...old];
          }

          if (payload.type === "read_receipt") {
            return old.map((c) =>
              c.id === payload.conversation_id
                ? { ...c, last_message_status: "read", unread_count: 0 }
                : c
            );
          }

          return old;
        });
      });

      // ✅ Presence
      const presenceChannel = client.channels.get("global_presence");

      await presenceChannel.presence.enter(username);

      presenceChannel.presence.subscribe((member) => {
        setOnlineUsers((prev) => {
          if (member.action === "enter") {
            return [...new Set([...prev, member.clientId])];
          }
          if (member.action === "leave") {
            return prev.filter((u) => u !== member.clientId);
          }
          return prev;
        });
      });
    });

    return () => {
      client.close();
    };
  }, [username, queryClient]);

  // 🔍 filter
  const filtered = conversations.filter((c) =>
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <h2>Inbox</h2>
        <button className="close-btn" onClick={() => navigate(-1)}>✕</button>
      </div>

      <input
        className="search"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="conversation-list">
        {filtered.map((c) => {
          const isOnline = onlineUsers.includes(c.username);

          return (
            <div
              key={c.id}
              className="conversation"
              onClick={() => navigate(`/chat/${c.username}`)}
            >
              <div className="avatar-wrapper">
                <div className="avatar">
                  {c.username?.charAt(0).toUpperCase()}
                </div>
                {isOnline && <div className="online-dot"></div>}
              </div>

              <div className="info">
                <div className="top-row">
                  <span className="username">{c.username}</span>
                  <span className="time">{formatTime(c.updated)}</span>
                </div>

                <div className="bottom-row">
                  <span className={`preview ${c.unread_count > 0 ? "unread" : ""}`}>
                    {c.last_message_sender === username ? "You: " : ""}
                    {c.preview}
                  </span>

                  <div className="meta">
                    {c.last_message_sender === username && (
                      <span className="ticks">
                        {renderTicks(c.last_message_status)}
                      </span>
                    )}

                    {c.unread_count > 0 && (
                      <span className="badge">{c.unread_count}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}