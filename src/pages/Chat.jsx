import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Ably from "ably";
import "./Chat.css";

export default function Chat() {

  const { username: otherUsername } = useParams();

  const [conversationId, setConversationId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  const ablyRef = useRef(null);
  const channelRef = useRef(null);
  const bottomRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const username = localStorage.getItem("username");

  const base_url = "https://Linkx1.pythonanywhere.com";

  const scrollBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };



  // 1️⃣ Create / get conversation
  useEffect(() => {

    const createConversation = async () => {

      try {

        const res = await fetch(`${base_url}/api/messaging/conversation/create/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            username: otherUsername
          })
        });

        const data = await res.json();

        setConversationId(data.conversation_id);
        setOtherUser(data.other_user);

      } catch {
        setError("Failed to create conversation");
      }

    };

    if (otherUsername) {
      createConversation();
    }

  }, [otherUsername]);



  // 2️⃣ Load messages
  useEffect(() => {

    if (!conversationId) return;

    const loadMessages = async () => {

      try {

        const res = await fetch(
          `${base_url}/api/messaging/messages/${conversationId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();
        setMessages(data);

        scrollBottom();

        // mark read
        fetch(`${base_url}/api/messaging/message/read/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            conversation_id: conversationId
          })
        });

      } catch {
        setError("Failed to load messages");
      }

    };

    loadMessages();

  }, [conversationId]);



  // 3️⃣ Connect Ably realtime
  useEffect(() => {

    if (!conversationId) return;

    try {

      ablyRef.current = new Ably.Realtime({
        authCallback: async (tokenParams, callback) => {
          try {
            const res = await fetch(        `${base_url}/api/messaging/ably-token/`,
            {
              headers: {
                Authorization: `Bearer ${token}`
                }
              }
            );
            const tokenRequest = await res.json();
            callback(null, tokenRequest);

    } catch (err) {
      callback(err, null);
    }
  }
});

      const channel = ablyRef.current.channels.get(`chat_${conversationId}`);
      channelRef.current = channel;

      channel.subscribe("new_message", (msg) => {

        if (!msg?.data) return;

        setMessages((prev) => [...prev, msg.data]);
        scrollBottom();

        // mark delivered
        fetch(`${base_url}/api/messaging/message/delivered/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message_id: msg.data.id
          })
        });

      });

    } catch {
      setError("Realtime connection failed");
    }

    return () => {
      channelRef.current?.unsubscribe();
      ablyRef.current?.close();
    };

  }, [conversationId]);



  // 4️⃣ Send message
  const sendMessage = async () => {

    if (!text.trim()) return;

    try {

      await fetch(`${base_url}/api/messaging/messages/send/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation: conversationId,
          text: text
        })
      });

      setText("");

    } catch {
      setError("Send message failed");
    }

  };



  const avatar = (msg) => {

    if (msg?.sender_avatar) {
      return <img src={msg.sender_avatar} className="avatar" alt="" />;
    }

    const letter = msg?.sender_username?.charAt(0)?.toUpperCase() || "?";

    return <div className="avatar-letter">{letter}</div>;
  };



  if (error) {
    return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  }



  if (!otherUser) {
    return <div style={{ padding: 20, color: "white" }}>Loading chat...</div>;
  }



  return (

    <div className="chat">

      <div className="chat-header">

        <div className="user">

          {otherUser?.avatar ?

            <img src={otherUser.avatar} className="avatar" alt="" />

            :

            <div className="avatar-letter">
              {otherUser.username.charAt(0).toUpperCase()}
            </div>

          }

          <div className="username">{otherUser.username}</div>

        </div>

      </div>



      <div className="messages">

        {messages.map((msg) => {

          const mine = msg.sender_username === username;

          return (

            <div key={msg.id} className={`message ${mine ? "mine" : ""}`}>

              {!mine && avatar(msg)}

              <div className="bubble">

                <div>{msg.text}</div>

                <div className="meta">
                  {msg.created_at
                    ? new Date(msg.created_at).toLocaleTimeString()
                    : ""}
                </div>

              </div>

            </div>

          );

        })}

        <div ref={bottomRef}></div>

      </div>



      <div className="input">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
        />

        <button onClick={sendMessage}>Send</button>

      </div>

    </div>

  );
}