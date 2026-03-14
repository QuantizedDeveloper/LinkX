import React, { useEffect, useState, useRef } from "react";
import Ably from "ably";
import { useNavigate } from "react-router-dom";
import "./Inbox.css";
const API = "https://Linkx1.pythonanywhere.com";

export default function Inbox({ username }) { // <-- username instead of userId
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");

  const clientRef = useRef(null);

  // Fetch inbox
  const loadInbox = async () => {
    const res = await fetch(`${API}/api/messaging/inbox/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setConversations(data);
  };

  useEffect(() => {
    loadInbox();
  }, []);

  // Setup Ably once
  useEffect(() => {
    clientRef.current = new Ably.Realtime({
      authUrl: `${API}/api/messaging/ably-token/`,
      authHeaders: { Authorization: `Bearer ${token}` },
    });

    const client = clientRef.current;

    client.connection.on("connected", () => {
      // Use username for channel
      const channel = client.channels.get(`notifications_${username}`);

      channel.subscribe("notification", (msg) => {
        const payload = msg.data;

        if (payload.type === "new_message") {
          setConversations((prev) => {
            const existing = prev.find((c) => c.id === payload.conversation_id);
            if (existing) {
              return prev.map((c) =>
                c.id === payload.conversation_id
                  ? { ...c, preview: payload.preview, updated: new Date().toISOString() }
                  : c
              );
            }
            return [
              {
                id: payload.conversation_id,
                username: payload.sender_username || "New user",
                preview: payload.preview,
                updated: new Date().toISOString(),
              },
              ...prev,
            ];
          });
        }
      });
    });

    return () => {
      if (clientRef.current) clientRef.current.close();
    };
  }, [username]); // re-run if username changes

  const filtered = conversations.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <h2>Inbox</h2>
        <button className="close-btn">×</button>
      </div>

      <input
        className="search"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="tabs">
        <button className="tab active">Contacts</button>
        <button className="tab">Requests</button>
      </div>

      <div className="conversation-list">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="conversation"
            onClick={() => navigate(`/chat/${c.username}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="avatar">{c.username?.charAt(0).toUpperCase()}</div>
            <div className="info">
              <div className="username">{c.username}</div>
              <div className="preview">{c.preview}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}