import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Ably from "ably";
import { useQuery } from "@tanstack/react-query";
import { FaSpinner } from "react-icons/fa";
import "./Chat.css";
import { showToast } from "../utils/toast";
import { fetchWithAuth } from "../utils/api";

const base_url = "https://linkx-backend-api-linkx-backend.hf.space";

const fixUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://")) url = url.replace("http://", "https://");
  if (url.startsWith("http")) return url;
  return base_url + url;
};

//////////////////// PAYMENT MODAL ////////////////////
function PaymentModal({ paymentInfo, onClose }) {
  const [showQR, setShowQR] = useState(null);

  if (!paymentInfo) return null;

  const copyUPI = (upi) => {
    navigator.clipboard.writeText(upi);
    showToast("UPI copied");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Payment Methods</h3>

        <button className="close-btn" onClick={onClose}>✕</button>

        {paymentInfo.razorpay_link && (
          <a href={paymentInfo.razorpay_link} target="_blank" rel="noreferrer">
            Pay with Razorpay
          </a>
        )}

        {paymentInfo.paypal_link && (
          <a href={paymentInfo.paypal_link} target="_blank" rel="noreferrer">
            Pay with PayPal
          </a>
        )}

        {paymentInfo.upi_id && (
          <button onClick={() => copyUPI(paymentInfo.upi_id)}>
            Copy UPI ID
          </button>
        )}

        {paymentInfo.upi_qr && (
          <button onClick={() => setShowQR(paymentInfo.upi_qr)}>
            Show QR
          </button>
        )}

        {showQR && (
          <div className="qr-modal">
            <img src={fixUrl(showQR)} alt="QR" />
            <button onClick={() => setShowQR(null)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

//////////////////// MAIN CHAT ////////////////////


export default function Chat() {
  const navigate = useNavigate();
  const { username: otherUsername } = useParams();
  const username = localStorage.getItem("username");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const [sending, setSending] = useState(false);

  const ablyRef = useRef(null);
  const channelRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const scrollBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ---------------- CONVERSATION ----------------
  const { data: conversationData } = useQuery({
    queryKey: ["conversation", otherUsername],
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/messaging/conversation/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: otherUsername }),
      });
      return res.json();
    },
    enabled: !!otherUsername,
  });

  const conversationId = conversationData?.conversation_id;
  const otherUser = conversationData?.other_user;

  // ---------------- MESSAGES ----------------
  const { data: messagesData = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `/api/messaging/messages/${conversationId}/`
      );
      const data = await res.json();

      // mark read
      await fetchWithAuth(`/api/messaging/message/read/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      return data;
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    setMessages(messagesData);
    scrollBottom();
  }, [messagesData]);

  // ---------------- ABLY ----------------
  useEffect(() => {
    if (!conversationId) return;

    let mounted = true;

    ablyRef.current = new Ably.Realtime({
      authCallback: async (_, cb) => {
        try {
          const res = await fetchWithAuth(`/api/messaging/ably-token/`);
          const token = await res.json();
          cb(null, token);
        } catch {
          cb("error", null);
        }
      },
    });

    const channel = ablyRef.current.channels.get(`chat_${conversationId}`);
    channelRef.current = channel;

    // PRESENCE
    channel.presence.enter({ username });

    channel.presence.subscribe("enter", (m) => {
      if (m.data.username === otherUsername) setOnline(true);
    });

    channel.presence.subscribe("leave", (m) => {
      if (m.data.username === otherUsername) setOnline(false);
    });

    // NEW MESSAGE
    channel.subscribe("new_message", async (msg) => {
      if (!mounted) return;

      const incoming = msg.data;

      setMessages((prev) => {
        if (prev.some((m) => String(m.id) === String(incoming.id))) {
          return prev;
        }
        return [...prev, incoming];
      });

      scrollBottom();

      // mark delivered
      try {
        await fetchWithAuth(`/api/messaging/message/delivered/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message_id: incoming.id,
          }),
        });
      } catch {}
    });

    // DELIVERED
    channel.subscribe("message_delivered", (msg) => {
      if (!mounted) return;

      const message_id = msg.data.message_id || msg.data.id;

      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(message_id)
            ? { ...m, status: "delivered" }
            : m
        )
      );
    });

    // READ
    channel.subscribe("message_read", (msg) => {
      if (!mounted) return;

      const ids =
        msg.data.message_ids ||
        [msg.data.message_id || msg.data.id];

      setMessages((prev) =>
        prev.map((m) =>
          ids.includes(m.id)
            ? { ...m, status: "read" }
            : m
        )
      );
    });

    // TYPING
    channel.subscribe("typing", (msg) => {
      if (msg.data.username !== username) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1000);
      }
    });

    return () => {
      mounted = false;

      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current.presence.leave();
      }

      if (ablyRef.current) {
        ablyRef.current.close();
      }
    };
  }, [conversationId]);

  // ---------------- SEND ----------------
  const sendMessage = async () => {
    if (!text.trim() || sending) return;

    const tempId = Date.now();

    const tempMessage = {
      id: tempId,
      text,
      sender_username: username,
      status: "sending",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setText("");
    scrollBottom();
    setSending(true);

    try {
      const res = await fetchWithAuth(
        `/api/messaging/messages/send/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation: conversationId,
            text,
          }),
        }
      );

      const realMessage = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...realMessage, status: "sent" }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, status: "failed" }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const sendTyping = () => {
    if (!channelRef.current || typingTimeout.current) return;

    channelRef.current.publish("typing", { username });

    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;
    }, 1000);
  };

  // ---------------- UI ----------------
  if (!otherUser) return <div>Loading...</div>;

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <button onClick={() => navigate(-1)}>✕</button>
        <div>
          {otherUser.username}
          {online && <span className="online-dot" />}
        </div>
      </div>

      <div className="chat">
        {typing && <div>{otherUser.username} typing...</div>}

        <div className="messages">
          {messages.map((msg) => {
            const mine = msg.sender_username === username;

            return (
              <div key={msg.id} className={mine ? "mine" : ""}>
                <div className="bubble">
                  {msg.text}

                  <div className="meta">
                    {msg.created_at &&
                      new Date(msg.created_at).toLocaleTimeString()}

                    {mine && (
                      <span className="ticks">
                        {msg.status === "failed" && "❌"}
                        {msg.status === "sending" && "⏳"}
                        {msg.status === "sent" && "✓"}
                        {msg.status === "delivered" && "✓✓"}
                        {msg.status === "read" && (
                          <span className="blue">✓✓</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}></div>
        </div>

        <div className="input">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              sendTyping();
            }}
            placeholder="Type message..."
          />
          <button onClick={sendMessage} disabled={sending}>
            ▲
          </button>
        </div>
      </div>
    </div>
  );
}