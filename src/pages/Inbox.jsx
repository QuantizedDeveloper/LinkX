import React, { useEffect, useState, useRef } from "react";
import Ably from "ably";
import { useNavigate } from "react-router-dom";
import "./Inbox.css";
import { fetchWithAuth } from "../utils/api";
//const API = "https://Linkx1.pythonanywhere.com";
const API = "https://linkx-backend-api-linkx-backend.hf.space"
export default function Inbox({ username }) {
  const leaveChat = () => {
    navigate(-1); // go back
  };
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const clientRef = useRef(null);

  // ✅ Load inbox
  const loadInbox = async () => {
  const res = await fetchWithAuth("/api/messaging/inbox/");
  if (!res.ok) throw new Error("Failed to fetch inbox");
  const data = await res.json();
  setConversations(data);
};

useEffect(() => {
  loadInbox();
}, []);

  // ✅ Ably setup
  useEffect(() => {
    const client = new Ably.Realtime({
      authUrl: `${API}/api/messaging/ably-token/`,
      authHeaders: () => ({
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      }),
    });
    

    clientRef.current = client;

    client.connection.on("connected", async () => {
      // 🔔 Notification channel
      const notifChannel = client.channels.get(`notifications_${username}`);

      notifChannel.subscribe("notification", (msg) => {
        const payload = msg.data;

        // 🟢 New message
        if (payload.type === "new_message") {
          setConversations((prev) => {
            const existing = prev.find(
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
                ...prev.filter((c) => c.id !== payload.conversation_id),
              ];
            }

            return [updated, ...prev];
          });
        }

        // ✔ Read receipt
        if (payload.type === "read_receipt") {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === payload.conversation_id
                ? { ...c, last_message_status: "read", unread_count: 0 }
                : c
            )
          );
        }
      });

      // 🟢 Presence (online/offline)
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
      if (clientRef.current) clientRef.current.close();
    };
  }, [username]);

  // 🔍 Search filter
  const filtered = conversations.filter((c) =>
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  // ⏱ Format time
  const formatTime = (time) => {
    if (!time) return "";
    const d = new Date(time);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ✔ Tick UI
  const renderTicks = (status) => {
    if (status === "read") return "✓✓";
    if (status === "delivered") return "✓✓";
    return "✓";
  };

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <h2>Inbox</h2>
        <button className="close-btn" onClick={leaveChat}>✕
          </button>
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
              {/* Avatar + Online */}
              <div className="avatar-wrapper">
                <div className="avatar">
                  {c.username?.charAt(0).toUpperCase()}
                </div>
                {isOnline && <div className="online-dot"></div>}
              </div>

              {/* Info */}
              <div className="info">
                <div className="top-row">
                  <span className="username">{c.username}</span>
                  <span className="time">{formatTime(c.updated)}</span>
                </div>

                <div className="bottom-row">
                  <span
                    className={`preview ${
                      c.unread_count > 0 ? "unread" : ""
                    }`}
                  >
                    {c.last_message_sender === username ? "You: " : ""}
                    {c.preview}
                  </span>

                  <div className="meta">
                    {/* ✔ ticks (only if YOU sent last message) */}
                    {c.last_message_sender === username && (
                      <span className="ticks">
                        {renderTicks(c.last_message_status)}
                      </span>
                    )}

                    {/* 🔴 unread badge */}
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