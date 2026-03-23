import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Ably from "ably";
import { useQuery } from "@tanstack/react-query";
import { SiRazorpay } from "react-icons/si";
import { FaPaypal, FaQrcode, FaSpinner } from "react-icons/fa";
import "./Chat.css";
import { showToast } from "../utils/toast";
const base_url = "https://Linkx1.pythonanywhere.com";

const fixUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://")) url = url.replace("http://", "https://");
  if (url.startsWith("http")) return url;
  return base_url + url;
};

// ---------------- PAYMENT MODAL ----------------
function PaymentModal({ paymentInfo, onClose }) {
  const [showQR, setShowQR] = React.useState(null);

  if (!paymentInfo) return null;

  const copyUPI = (upi) => {
    navigator.clipboard.writeText(upi);
    showToast("UPI ID copied");
  };

  const items = [
    paymentInfo.razorpay_link && {
      name: "Razorpay",
      type: "link",
      link: paymentInfo.razorpay_link,
    },
    paymentInfo.paypal_link && {
      name: "PayPal",
      type: "link",
      link: paymentInfo.paypal_link,
    },
    (paymentInfo.upi_id || paymentInfo.upi_qr) && {
      name: "UPI",
      type: "upi",
      upi_id: paymentInfo.upi_id,
      qr: paymentInfo.upi_qr,
    },
  ].filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Payment Methods</h3>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <ul className="payment-list">
          {items.map((item, idx) => (
            <li key={idx} className="payment-item">
              <div className="payment-name">{item.name}</div>

              {/* LINK PAYMENTS */}
              {item.type === "link" && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="pay-btn-link"
                >
                  Pay
                </a>
              )}

              {/* UPI */}
              {item.type === "upi" && (
                <div className="upi-actions">
                  {item.qr && (
                    <button
                      className="upi-btn"
                      onClick={() => setShowQR(item.qr)}
                    >
                      Scan QR
                    </button>
                  )}

                  {item.upi_id && (
                    <button
                      className="upi-btn"
                      onClick={() => copyUPI(item.upi_id)}
                    >
                      Copy UPI ID
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* QR POPUP */}
        {showQR && (
          <div
            className="qr-modal-overlay"
            onClick={() => setShowQR(null)}
          >
            <div
              className="qr-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={fixUrl(showQR)} alt="UPI QR" className="qr-image" />
              <button onClick={() => setShowQR(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- MAIN CHAT ----------------
export default function Chat() {
  const navigate = useNavigate();
  const { username: otherUsername } = useParams();

  const token = localStorage.getItem("accessToken");
  const username = localStorage.getItem("username");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const ablyRef = useRef(null);
  const channelRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const inputRef = useRef(null);

  const scrollBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ---------------- CONVERSATION ----------------
  const {
    data: conversationData,
    isLoading: convoLoading,
    error: convoError,
  } = useQuery({
    queryKey: ["conversation", otherUsername],
    queryFn: async () => {
      const res = await fetch(`${base_url}/api/messaging/conversation/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: otherUsername }),
      });

      if (!res.ok) throw new Error("Conversation failed");

      return res.json();
    },
    enabled: !!otherUsername,
  });

  const conversationId = conversationData?.conversation_id;
  const otherUser = conversationData?.other_user;

  // ---------------- MESSAGES ----------------
  const {
    data: messagesData = [],
    error: msgError,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await fetch(`${base_url}/api/messaging/messages/${conversationId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Messages failed");

      const data = await res.json();

      // mark read
      fetch(`${base_url}/api/messaging/message/read/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      return data;
    },
    enabled: !!conversationId,
  });

  // sync messages
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
      scrollBottom();
    }
  }, [messagesData]);

  // ---------------- PAYMENT ----------------
  const {
    data: paymentInfo,
    isLoading: paymentLoading,
  } = useQuery({
    queryKey: ["paymentInfo", otherUsername],
    queryFn: async () => {
      const res = await fetch(`${base_url}/freelancers/payment-info/${otherUsername}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Not freelancer");

      return res.json();
    },
    enabled: !!otherUsername,
  });

  // ---------------- ABLY ----------------
  useEffect(() => {
    if (!conversationId) return;

    try {
      ablyRef.current = new Ably.Realtime({
        authCallback: async (_, cb) => {
          const res = await fetch(`${base_url}/api/messaging/ably-token/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tokenRequest = await res.json();
          cb(null, tokenRequest);
        },
      });

      const channel = ablyRef.current.channels.get(`chat_${conversationId}`);
      channelRef.current = channel;

      channel.presence.enter({ username });

      channel.presence.get((err, members) => {
        if (members.find(m => m.data.username === otherUsername)) setOnline(true);
      });

      channel.presence.subscribe("enter", m => {
        if (m.data.username === otherUsername) setOnline(true);
      });

      channel.presence.subscribe("leave", m => {
        if (m.data.username === otherUsername) setOnline(false);
      });

      // new message
      channel.subscribe("new_message", msg => {
        if (!msg?.data) return;

        setMessages(prev => {
          if (prev.find(m => m.id === msg.data.id)) return prev;
          return [...prev, msg.data];
        });

        scrollBottom();

        fetch(`${base_url}/api/messaging/message/delivered/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message_id: msg.data.id }),
        });
      });

      // typing
      channel.subscribe("typing", msg => {
        if (msg.data.username !== username) {
          setTyping(true);
          setTimeout(() => setTyping(false), 2000);
        }
      });

      // read
      channel.subscribe("message_read", msg => {
        setMessages(prev =>
          prev.map(m =>
            m.id === msg.data.message_id ? { ...m, status: "read" } : m
          )
        );
      });

    } catch (e) {
      console.error("Ably error", e);
    }

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current?.presence.leave();
      ablyRef.current?.close();
    };
  }, [conversationId]);

  // ---------------- SEND ----------------
  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await fetch(`${base_url}/api/messaging/messages/send/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversation: conversationId,
        text,
      }),
    });

    const message = await res.json();

    setText("");
    inputRef.current?.focus();

    channelRef.current.publish("new_message", message);
  };

  const sendTyping = () => {
    if (!channelRef.current || typingTimeout.current) return;

    channelRef.current.publish("typing", { username });

    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;
    }, 1000);
  };

  const leaveChat = () => navigate(-1);

  // ---------------- UI STATES ----------------
  if (convoError || msgError) {
    return <div style={{ color: "red", padding: 20 }}>Something went wrong</div>;
  }

  if (convoLoading || !otherUser) {
    return <div style={{ color: "white", padding: 20 }}>Loading chat...</div>;
  }

  // ---------------- UI ----------------
  return (
  <div className="chat-wrapper">

    {/* ✅ MOVED OUT — SAME CODE */}
    <div className="chat-header">
      <button className="cancel-btn" onClick={leaveChat}>✕</button>

      <div className="user">
        <div className="avatar-wrapper">
          {otherUser?.avatar ? (
            <img
              src={fixUrl(otherUser.avatar)}
              className="avatar"
              alt=""
              onClick={() => navigate(`/public-profile/${otherUser.username}`)}
            />
          ) : (
            <div className="avatar-letter">
              {otherUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          {online && <div className="online-dot"></div>}
        </div>

        <div className="username">{otherUser.username}</div>
      </div>

      {paymentLoading ? (
        <FaSpinner className="spin" />
      ) : paymentInfo ? (
        <button className="pay-btn" onClick={() => setShowPaymentModal(true)}>
          Pay
        </button>
      ) : null}

      
    </div>

    {/* ✅ SCROLL AREA */}
    <div className="chat">

      {typing && (
        <div className="typing-indicator">
          {otherUser.username} typing...
        </div>
      )}

      <div className="messages">
        {messages.map(msg => {
          const mine = msg.sender_username === username;

          return (
            <div key={msg.id} className={`message ${mine ? "mine" : ""}`}>
              <div className="bubble">
                <div>{msg.text}</div>

                <div className="meta">
                  {msg.created_at
                    ? new Date(msg.created_at).toLocaleTimeString()
                    : ""}

                  {mine && (
                    <span className="tick">
                      {msg.status === "read"
                        ? "✓✓"
                        : msg.status === "delivered"
                        ? "✓✓"
                        : "✓"}
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
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendTyping();
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          autoComplete="off"
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>▲</button>
      </div>
    </div>

    {showPaymentModal && (
      <PaymentModal
        paymentInfo={paymentInfo}
        onClose={() => setShowPaymentModal(false)}
      />
    )}
  </div>
  );
}