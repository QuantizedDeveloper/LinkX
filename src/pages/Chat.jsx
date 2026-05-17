import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Ably from "ably";
import { fetchWithAuth } from "../utils/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import "./Chat.css";

import PaymentModal from "./PaymentModal";
import {
  FiPlus,
  FiDownload,
  FiEye,
  FiX,
} from "react-icons/fi";

import { IoSend } from "react-icons/io5";


export default function Chat() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fixCloudinaryUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://res.cloudinary.com/dd04focej/${url}`;
  };
  // new
  const [mediaModal, setMediaModal] =
  useState(null);
  const fileInputRef = useRef(null);
  
  const { username: otherUsername } = useParams();
  const navigate = useNavigate();

  const username = localStorage.getItem("username");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  const containerRef = useRef(null);
  const typingTimer = useRef(null);
  const conversationIdRef = useRef(null);
  const channelRef = useRef(null);

  // scroll control
  const firstLoadRef = useRef(true);
  const isPaginatingRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);
  const [showPayment, setShowPayment] = useState(false);

  // ---------------- INIT ----------------
  useEffect(() => {
    fetchNotifications();
  }, []);
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchWithAuth(
          `/api/messaging/conversation/create/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: otherUsername,
            }),
          }
        );

        const data = await res.json();

        setConversationId(data.conversation_id);
        setOtherUser(data.other_user);

        conversationIdRef.current = data.conversation_id;

        // reset when switching chats
        firstLoadRef.current = true;
      } catch (err) {
        console.error(err);
      }
    };

    if (otherUsername) {
      init();
    }
  }, [otherUsername]);
  const uploadToCloudinary = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "upload_preset",
    "chat_uploads"
  );

  const resourceType = file.type.startsWith("video")
    ? "video"
    : "image";

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dd04focej/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  return res.json();
};
  // ---------------- QUERY ----------------
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", conversationId],

    enabled: !!conversationId,

    queryFn: async ({ pageParam = null }) => {
      let url =
    pageParam ||
    `/api/messaging/messages/${conversationId}/`;
    // convert full backend URL -> relative URL
    if (url.startsWith("http")) {
      const parsed = new URL(url);
      url = parsed.pathname + parsed.search;
    }
    const res = await fetchWithAuth(url);
    return res.json();
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      //console.log(lastPage.next);
      //alert(JSON.stringify(lastPage.next));
      return lastPage.next;
    },

    //staleTime: 1000 * 60 * 5,
    staleTime: 0,
    refetchOnMount: true,
    
  });

  // ---------------- LOAD MESSAGES ----------------
  const fetchNotifications = async () => {
    try {

        const res = await fetchWithAuth("api/messaging/notifications/");

        if (!res.ok) {
            throw new Error("Failed to fetch notifications");
        }

        const data = await res.json();

        setNotifications(data);

    } catch (err) {
        console.error(err);
    }
};
  {/*useEffect(() => {
    if (!data) return;

    const allMessages = data.pages.flatMap(
      (page) => page.results ?? []
    );

    setMessages((prev) => {
      const map = new Map();

      prev.forEach((m) => {
        map.set(m.id || m.client_id, m);
      });

      allMessages.forEach((m) => {
        map.set(m.id || m.client_id, m);
      });

      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(a.created_at) - new Date(b.created_at)
      );
    });
  }, [data]);*/}
  {/*useEffect(() => {
    if (!data) return;
    const allMessages = data.pages.flatMap(
    (page) => page.results ?? []
  );

  const unique = new Map();

  allMessages.forEach((m) => {
    unique.set(m.id, m);
  });

  const sorted = Array.from(unique.values()).sort(
    (a, b) =>
      new Date(a.created_at) -
      new Date(b.created_at)
  );

  setMessages(sorted);
}, [data]);*/}
  useEffect(() => {
  if (!data) return;

  const fetched = data.pages.flatMap(
    (page) => page.results ?? []
  );

  setMessages((prev) => {
    // first load
    if (prev.length === 0) {
      return fetched.sort(
        (a, b) =>
          new Date(a.created_at) -
          new Date(b.created_at)
      );
    }

    const existingIds = new Set(
      prev.map((m) => m.id)
    );

    // ONLY add older missing messages
    const missing = fetched.filter(
      (m) => !existingIds.has(m.id)
    );

    return [...missing, ...prev].sort(
      (a, b) =>
        new Date(a.created_at) -
        new Date(b.created_at)
    );
  });
}, [data]);

  // ---------------- SMART AUTO SCROLL ----------------
  useEffect(() => {
    const el = containerRef.current;

    if (!el || !messages.length) return;

    // first load only
    if (firstLoadRef.current) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });

      firstLoadRef.current = false;
      return;
    }

    // don't auto scroll during pagination
    if (isPaginatingRef.current) {
      isPaginatingRef.current = false;
      return;
    }

    // only auto scroll if already near bottom
    if (shouldAutoScrollRef.current) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages]);

  // ---------------- PAGINATION + SCROLL ----------------
  const handleScroll = async () => {
    const el = containerRef.current;

    if (!el) return;

    // distance from bottom
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    // user near bottom?
    shouldAutoScrollRef.current =
      distanceFromBottom < 120;

    // fetch old messages
    if (
      el.scrollTop < 100 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      isPaginatingRef.current = true;

      const prevHeight = el.scrollHeight;

      await fetchNextPage();

      requestAnimationFrame(() => {
        const newHeight = el.scrollHeight;

        // preserve scroll position
        el.scrollTop =
          newHeight - prevHeight + el.scrollTop;
      });
    }
  };

  // ---------------- ABLY ----------------
  useEffect(() => {
    if (!conversationId) return;

    const ably = new Ably.Realtime({
      authCallback: async (_, cb) => {
        try {
          const res = await fetchWithAuth(
            "/api/messaging/ably-token/"
          );

          const data = await res.json();

          cb(null, data);
        } catch (err) {
          cb(err, null);
        }
      },
    });

    const channel = ably.channels.get(
      `chat_${conversationId}`
    );

    channelRef.current = channel;

    channel.presence.enter({
      username,
    });
    channel.subscribe("new_message", async (msg) => {
      const incoming = msg.data;
      if (
        incoming.conversation !== conversationIdRef.current) {
          return;
        }
        setMessages((prev) => {
          // remove temp version if exists
          const filtered = prev.filter((m) => m.client_id !== incoming.client_id && String(m.id) !== String(incoming.id));
          return [...filtered, incoming].sort((a, b) =>
        new Date(a.created_at) -
        new Date(b.created_at)
        );
        });
        try {
          await fetchWithAuth(
      `/api/messaging/message/delivered/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message_id: incoming.id,
        }),
      }
    );
  } catch {}
      
    });

    // NEW MESSAGE
    {/*channel.subscribe("new_message", async (msg) => {
      const incoming = msg.data;

      if (
        incoming.conversation !==
        conversationIdRef.current
      ) {
        return;
      }

      setMessages((prev) => {
        // replace optimistic temp message
        if (incoming.client_id) {
          const idx = prev.findIndex(
            (m) => m.client_id === incoming.client_id
          );

          if (idx !== -1) {
            const copy = [...prev];

            {/*copy[idx] = {
              ...copy[idx],
              ...incoming,
              status: "sent",
            };
            copy[idx] = {
              ...incoming,
              status: incoming.status || "sent",
            };

            return copy;
          }
        }

        // prevent duplicates
        if (
          prev.some(
            (m) => String(m.id) === String(incoming.id)
          )
        ) {
          return prev;
        }

        return [...prev, incoming];
      });

      // mark delivered
      try {
        await fetchWithAuth(
          `/api/messaging/message/delivered/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message_id: incoming.id,
            }),
          }
        );
      } catch {}
    })*/};

    // DELIVERED
    channel.subscribe("message_delivered", (msg) => {
      const id = msg.data.id || msg.data.message_id;

      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(id)
            ? {
                ...m,
                status: "delivered",
              }
            : m
        )
      );
    });

    // READ
    channel.subscribe("message_read", (msg) => {
      const ids =
        msg.data.message_ids || [msg.data.message_id];

      setMessages((prev) =>
        prev.map((m) =>
          ids.includes(m.id)
            ? {
                ...m,
                status: "read",
              }
            : m
        )
      );
    });

    // TYPING
    channel.subscribe("typing", (msg) => {
      if (msg.data.username !== username) {
        setTyping(true);

        clearTimeout(typingTimer.current);

        typingTimer.current = setTimeout(() => {
          setTyping(false);
        }, 1000);
      }
    });
    channel.subscribe("notification", (msg) => {
    setNotifications(prev => [msg.data, ...prev]);
    });

    return () => {
      channel.unsubscribe();
      channel.presence.leave();
      ably.close();
    };
  }, [conversationId]);
  //new
  const handleFilePick = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setSelectedFile(file);
  };
  // ---------------- SEND ----------------
  const sendMessage = async () => {
  if (!text.trim() && !selectedFile) return;

  const clientId = crypto.randomUUID();

  let imageUrl = null;
  let videoUrl = null;
  let thumbnailUrl = null;

  try {
    setUploading(true);

    // Upload media first
    if (selectedFile) {
      const uploaded = await uploadToCloudinary(
        selectedFile
      );

      if (
        selectedFile.type.startsWith("image")
      ) {
        imageUrl = uploaded.secure_url;
      }

      if (
        selectedFile.type.startsWith("video")
      ) {
        videoUrl = uploaded.secure_url;

        thumbnailUrl =
          uploaded.secure_url.replace(
            ".mp4",
            ".jpg"
          );
      }
    }

    // Optimistic message
    const tempMessage = {
      id: `temp-${clientId}`,
      client_id: clientId,
      text,
      image_url: imageUrl,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      sender_username: username,
      status: "sending",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [
      ...prev,
      tempMessage,
    ]);

    const messageText = text;

    setText("");
    setSelectedFile(null);

    await fetchWithAuth(
      `/api/messaging/messages/send/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: conversationId,
          text: messageText,
          client_id: clientId,
          image_url: imageUrl,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
        }),
      }
    );
  } catch {
    setMessages((prev) =>
      prev.map((m) =>
        m.client_id === clientId
          ? {
              ...m,
              status: "failed",
            }
          : m
      )
    );
  } finally {
    setUploading(false);
  }
};

  // ---------------- UI ----------------
  if (!otherUser) return null;

  
return (
  <div className="chat-wrapper">

    {/* HEADER */}
    <div className="chat-header">

      <div className="header-left">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <FiX />
        </button>

        <div className="header-user">

          {otherUser.avatar ? (
            <img
              src={otherUser.avatar}
              className="avatar"
              onClick={() =>
                navigate(
                  `/public-profile/${otherUser.username}`
                )
              }
            />
          ) : (
            <div
              className="avatar-fallback"
              onClick={() =>
                navigate(
                  `/public-profile/${otherUser.username}`
                )
              }
            >
              {otherUser.username[0].toUpperCase()}
            </div>
          )}

          <div className="header-meta">

            <span className="header-name">
              {otherUser.username}
            </span>

            {typing && (
              <span className="typing-text">
                typing...
              </span>
            )}

          </div>
        </div>
      </div>

      {otherUser.is_freelancer && (
        <button
          className="pay-btn"
          onClick={() =>
            setShowPayment(true)
          }
        >
          Pay
        </button>
      )}
    </div>

    {/* CHAT BODY */}
    <div
      className="chat-body"
      ref={containerRef}
      onScroll={handleScroll}
    >

      <div className="messages">

        {isFetchingNextPage && (
          <div className="loading-more">
            Loading older messages...
          </div>
        )}

        {messages.map((msg) => {

          const mine =
            msg.sender_username === username;

          return (
            <div
              key={msg.client_id || msg.id}
              className={`message-row ${
                mine ? "mine" : "other"
              }`}
            >

              <div className="bubble">

                {/* IMAGE */}
                {msg.image_url && (
                  <div className="media-card">

                    <img
                      src={msg.image_url}
                      className="media-preview"
                      alt="shared"
                    />

                    <div className="media-overlay">

                      <button
                        className="view-btn"
                        onClick={() =>
                          setMediaModal({
                            type: "image",
                            url: msg.image_url,
                          })
                        }
                      >
                        <FiEye />
                        <span>View</span>
                      </button>

                      <a
                        href={msg.image_url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="download-btn"
                      >
                        <FiDownload />
                      </a>

                    </div>
                  </div>
                )}

                {/* VIDEO */}
                {msg.video_url && (
                  <div className="media-card">

                    <video
                      className="media-preview"
                      poster={msg.thumbnail_url}
                    >
                      <source
                        src={msg.video_url}
                        type="video/mp4"
                      />
                    </video>

                    <div className="media-overlay">

                      <button
                        className="view-btn"
                        onClick={() =>
                          setMediaModal({
                            type: "video",
                            url: msg.video_url,
                          })
                        }
                      >
                        <FiEye />
                        <span>View</span>
                      </button>

                      <a
                        href={msg.video_url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="download-btn"
                      >
                        <FiDownload />
                      </a>

                    </div>
                  </div>
                )}

                {/* TEXT */}
                {msg.text && (
                  <div className="message-text">
                    {msg.text}
                  </div>
                )}

                {/* META */}
                <div className="meta">

                  {new Date(
                    msg.created_at
                  ).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}

                  {mine && (
                    <span className="status">

                      {msg.status ===
                        "sending" && "⏳"}

                      {msg.status ===
                        "sent" && "✓"}

                      {msg.status ===
                        "delivered" && "✓✓"}

                      {msg.status ===
                        "read" && "✓✓"}

                      {msg.status ===
                        "failed" && "❌"}

                    </span>
                  )}

                </div>

              </div>
            </div>
          );
        })}

        {typing && (
          <div className="typing">
            {otherUser.username} typing...
          </div>
        )}

      </div>
    </div>




{/* INPUT */}
<div className="chat-composer">

  {/* PREVIEW */}
  {selectedFile && (
    <div className="composer-preview-large">

      {selectedFile.type.startsWith(
        "image"
      ) ? (
        <img
          src={URL.createObjectURL(
            selectedFile
          )}
          alt=""
        />
      ) : (
        <video
          src={URL.createObjectURL(
            selectedFile
          )}
        />
      )}

      <button
        className="remove-preview"
        onClick={() =>
          setSelectedFile(null)
        }
      >
        <FiX />
      </button>

    </div>
  )}

  {/* TEXTAREA */}
  <textarea
    value={text}
    rows={1}
    className="composer-textarea"
    placeholder="Message..."
    onChange={(e) => {

      setText(e.target.value);

      channelRef.current?.publish(
        "typing",
        {
          username,
        }
      );

      // auto grow
      e.target.style.height = "auto";

      e.target.style.height =
        Math.min(
          e.target.scrollHeight,
          160
        ) + "px";
    }}
  />

  {/* BOTTOM BAR */}
  <div className="composer-bottom">

    {/* PLUS */}
    <button
      className="composer-plus"
      onClick={() =>
        fileInputRef.current.click()
      }
    >
      <FiPlus />
    </button>

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*,video/*"
      style={{ display: "none" }}
      onChange={(e) => {

        const file =
          e.target.files[0];

        if (!file) return;

        setSelectedFile(file);
      }}
    />

    {/* SEND */}
    <button
      className="composer-send"
      onClick={sendMessage}
      disabled={uploading}
    >
      <IoSend />
    </button>

  </div>

</div>




    {/* MEDIA MODAL */}
    {mediaModal && (
      <div className="media-modal">

        <button
          className="close-modal"
          onClick={() =>
            setMediaModal(null)
          }
        >
          <FiX />
        </button>

        {mediaModal.type ===
        "image" ? (

          <img
            src={mediaModal.url}
            className="modal-media"
            alt=""
          />

        ) : (

          <video
            controls
            autoPlay
            className="modal-media"
          >
            <source
              src={mediaModal.url}
              type="video/mp4"
            />
          </video>

        )}

      </div>
    )}

    {/* PAYMENT */}
    {showPayment && (
      <PaymentModal
        paymentInfo={otherUser.payment_info}
        onClose={() =>
          setShowPayment(false)
        }
      />
    )}

  </div>
);


}