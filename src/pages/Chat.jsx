import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useParams,
  useNavigate,
  useLocation
} from "react-router-dom";
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
import Gig from "../components/Gig";
import { useQuery } from "@tanstack/react-query";


export default function Chat() {
  const queryClient = useQueryClient();
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [showGigModal, setShowGigModal] = useState(false);
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
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGig, setSelectedGig] =
  useState(
    location.state?.gig || null
  );
  
  const { username: otherUsername } = useParams();
  
  
  const username = localStorage.getItem("username");

  const [messages, setMessages] = useState([]);


  //const [loadingMessages, setLoadingMessages] =
  useState(true);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);
  //const [conversationId, setConversationId] = useState(null);
  
  const [conversationId, setConversationId] =
  useState(() =>
    localStorage.getItem(
      `chat_${otherUsername}`
    )
  );
  //const [otherUser, setOtherUser] = useState(null);
  const [otherUser, setOtherUser] = useState(() => {
  const cached = localStorage.getItem(
    `chat_header_${otherUsername}`
  );

  return cached ? JSON.parse(cached) : null;
});
  const displayUser = otherUser || {
  username: otherUsername,
  avatar: null,
  is_freelancer: false,};
  const containerRef = useRef(null);
  const typingTimer = useRef(null);
  const conversationIdRef = useRef(null);
  const channelRef = useRef(null);

  // scroll control
  const firstLoadRef = useRef(true);
  const isPaginatingRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);
  const [showPayment, setShowPayment] = useState(false);
  useEffect(() => {
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = "auto";
  };
    
  }, []);
  // ---------------- INIT ----------------
  useEffect(() => {
  if (!conversationId) return;

  const cached = localStorage.getItem(
    `messages_${conversationId}`
  );

  if (cached) {
    try {
      setMessages(JSON.parse(cached));
    } catch (error) {
      console.error("Failed to load cached messages", error);
    }
  }
}, [conversationId]);

useEffect(() => {
  if (!conversationId || messages.length === 0) return;

  localStorage.setItem(
    `messages_${conversationId}`,
    JSON.stringify(messages)
  );
}, [messages, conversationId]);
  
  useEffect(() => {
  if (!conversationId) return;

  if (!messages.length) return;

  const unread = messages.filter(
    (m) =>
      m.sender_username !== username &&
      m.status !== "read"
  );

  if (!unread.length) return;

  fetchWithAuth(
    `/api/messaging/message/read/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
      }),
    }
  ).catch(console.error);

}, [messages, conversationId]);

  useEffect(() => {
    //fetchNotifications();
  }, []);
  useEffect(() => {
  let mounted = true;

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
      localStorage.setItem(
  `chat_header_${otherUsername}`,
  JSON.stringify(data.other_user)
);
      const cachedId = localStorage.getItem(
  `chat_${otherUsername}`
);

if (cachedId) {
  setConversationId(cachedId);
}
      localStorage.setItem(
  `chat_${otherUsername}`,
  data.conversation_id
);
      if (!mounted) return;

      setConversationId(data.conversation_id);

      setOtherUser(data.other_user);

      conversationIdRef.current =
        data.conversation_id;

      firstLoadRef.current = true;

    } catch (err) {
      console.error(err);
    }
  };

  if (otherUsername) {
    init();
  }

  return () => {
    mounted = false;
  };

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
    isLoading,
    refetch,
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


    //refetchOnMount: "always",
    //refetchOnWindowFocus: true,
    staleTime: 60 * 1000, // 1 minute
  cacheTime: 30 * 60 * 1000,   // 30 minutes (Holds old data)
  refetchOnWindowFocus: true,  // Fixes the offline gap background sync
  
  // CHANGE THIS TO TRUE:
  refetchOnMount: true,
    
  });
  useEffect(() => {
  if (conversationId) {
    refetch();
  }
}, [conversationId, refetch]);
  const cachedMessages =
  data?.pages?.flatMap(
    (page) => page.results ?? []
  ) || [];

useEffect(() => {
  if (!data?.pages) return;

  const allMessages = data.pages.flatMap(
    (page) => page.results || []
  );

  setMessages(allMessages);
}, [data]);
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

  /*useEffect(() => {

  if (
    messages.length === 0 &&
    cachedMessages.length > 0
  ) {
    setMessages(
      cachedMessages.sort(
        (a, b) =>
          new Date(a.created_at) -
          new Date(b.created_at)
      )
    );
  }

}, [cachedMessages]);*/

  useEffect(() => {
  if (!data?.pages) return;

  const fetched = data.pages.flatMap(
    (page) => page.results ?? []
  );

  setMessages((prev) => {
    const map = new Map();

    prev.forEach((m) => {
      map.set(String(m.id), m);
    });

    fetched.forEach((m) => {
      map.set(String(m.id), {
        ...map.get(String(m.id)),
        ...m,
      });
    });

    return [...map.values()].sort(
      (a, b) =>
        new Date(a.created_at) -
        new Date(b.created_at)
    );
  });
}, [data]);

const { data: viewedGig } = useQuery({
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
  {/*useEffect(() => {
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

  // Enter presence
  channel.presence.enter({
    username,
  });

  // NEW MESSAGE
  const handleNewMessage = async (msg) => {
    const incoming = msg.data;

    if (
      String(incoming.conversation) !==
      String(conversationIdRef.current)
    ) {
      return;
    }

    // Update local/cache state
    updateMessagesCache(incoming);

    setMessages((prev) => {
      // If this is the server version of an optimistic message,
      // replace the optimistic message.
      if (incoming.client_id) {
        const index = prev.findIndex(
          (m) => m.client_id === incoming.client_id
        );

        if (index !== -1) {
          const copy = [...prev];

          copy[index] = {
            ...copy[index],
            ...incoming,
            status: incoming.status || "sent",
          };

          return copy.sort(
            (a, b) =>
              new Date(a.created_at) -
              new Date(b.created_at)
          );
        }
      }

      // Prevent duplicate messages
      if (
        prev.some(
          (m) =>
            String(m.id) === String(incoming.id)
        )
      ) {
        return prev;
      }

      return [...prev, incoming].sort(
        (a, b) =>
          new Date(a.created_at) -
          new Date(b.created_at)
      );
    });

    // Mark message as delivered
    try {
      await fetchWithAuth(
        "/api/messaging/message/delivered/",
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
    } catch (err) {
      console.error(
        "Failed to mark message as delivered:",
        err
      );
    }
  };

  channel.subscribe(
    "new_message",
    handleNewMessage
  );

  return () => {
    channel.unsubscribe(
      "new_message",
      handleNewMessage
    );

    try {
      channel.presence.leave();
    } catch (err) {
      console.log(
        "Presence leave error:",
        err
      );
    }

    channelRef.current = null;

    ably.close();
  };
}, [conversationId, username]) */}

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

  // PRESENCE
  channel.presence.enter({
    username,
  });

  // NEW MESSAGE
  const handleNewMessage = async (msg) => {
    const incoming = msg.data;

    if (
      String(incoming.conversation) !==
      String(conversationIdRef.current)
    ) {
      return;
    }

    updateMessagesCache(incoming);

    setMessages((prev) => {
      // Replace optimistic message
      if (incoming.client_id) {
        const index = prev.findIndex(
          (m) => m.client_id === incoming.client_id
        );

        if (index !== -1) {
          const copy = [...prev];

          copy[index] = {
            ...copy[index],
            ...incoming,
            status: incoming.status || "sent",
          };

          return copy.sort(
            (a, b) =>
              new Date(a.created_at) -
              new Date(b.created_at)
          );
        }
      }

      // Prevent duplicates
      if (
        prev.some(
          (m) =>
            String(m.id) === String(incoming.id)
        )
      ) {
        return prev;
      }

      return [...prev, incoming].sort(
        (a, b) =>
          new Date(a.created_at) -
          new Date(b.created_at)
      );
    });

    // Mark delivered
    try {
      await fetchWithAuth(
        "/api/messaging/message/delivered/",
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
    } catch (err) {
      console.error(
        "Failed to mark message as delivered:",
        err
      );
    }
  };

  channel.subscribe(
    "new_message",
    handleNewMessage
  );

  // MESSAGE DELIVERED
  // MESSAGE DELIVERED
const handleMessageDelivered = (msg) => {
  const id =
    msg.data.id || msg.data.message_id;

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

  queryClient.setQueryData(
    ["messages", conversationId],
    (oldData) => {
      if (!oldData?.pages) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          results: (page.results || []).map((m) =>
            String(m.id) === String(id)
              ? {
                  ...m,
                  status: "delivered",
                }
              : m
          ),
        })),
      };
    }
  );
};

channel.subscribe(
  "message_delivered",
  handleMessageDelivered
);

// MESSAGE READ
const handleMessageRead = (msg) => {
  const ids = (
    msg.data.message_ids || []
  ).map(String);

  setMessages((prev) =>
    prev.map((m) =>
      ids.includes(String(m.id))
        ? {
            ...m,
            status: "read",
          }
        : m
    )
  );

  queryClient.setQueryData(
    ["messages", conversationId],
    (oldData) => {
      if (!oldData?.pages) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          results: (page.results || []).map((m) =>
            ids.includes(String(m.id))
              ? {
                  ...m,
                  status: "read",
                }
              : m
          ),
        })),
      };
    }
  );
};

channel.subscribe(
  "message_read",
  handleMessageRead
);

// TYPING
const handleTyping = (msg) => {
  if (msg.data.username !== username) {
    setTyping(true);

    clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      setTyping(false);
    }, 1000);
  }
};

channel.subscribe(
  "typing",
  handleTyping
);

  // NOTIFICATION
  const handleNotification = (msg) => {
    setNotifications((prev) => [
      msg.data,
      ...prev,
    ]);
  };

  channel.subscribe(
    "notification",
    handleNotification
  );

  // CLEANUP
  return () => {
    channel.unsubscribe(
      "new_message",
      handleNewMessage
    );

    channel.unsubscribe(
      "message_delivered",
      handleMessageDelivered
    );

    channel.unsubscribe(
      "message_read",
      handleMessageRead
    );

    channel.unsubscribe(
      "typing",
      handleTyping
    );

    channel.unsubscribe(
      "notification",
      handleNotification
    );

    clearTimeout(typingTimer.current);

    try {
      channel.presence.leave();
    } catch (err) {
      console.log(
        "Presence leave error:",
        err
      );
    }

    channelRef.current = null;

    ably.close();
  };
}, [conversationId, username]);
    /*channel.subscribe("message_delivered", (msg) => {
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
    (msg.data.message_ids || [])
      .map(String);

  setMessages((prev) =>
    prev.map((m) =>
      ids.includes(String(m.id))
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
  }, [conversationId]);*/
  //new
  const handleFilePick = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setSelectedFile(file);
    
  };
  const messageStatusRank = {
  sending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
};

const mergeMessageStatus = (oldStatus, newStatus) => {
  const oldRank =
    messageStatusRank[oldStatus] ?? 0;

  const newRank =
    messageStatusRank[newStatus] ?? 0;

  return newRank >= oldRank
    ? newStatus
    : oldStatus;
};
  const updateMessageStatusInCache = (
  messageId,
  newStatus
) => {
  queryClient.setQueryData(
    ["messages", conversationId],
    (oldData) => {
      if (!oldData?.pages) {
        return oldData;
      }

      return {
        ...oldData,

        pages: oldData.pages.map(
          (page) => ({
            ...page,

            results: (
              page.results || []
            ).map((message) =>
              String(message.id) ===
              String(messageId)
                ? {
                    ...message,
                    status:
                      mergeMessageStatus(
                        message.status,
                        newStatus
                      ),
                  }
                : message
            ),
          })
        ),
      };
    }
  );
};
  const updateMessagesCache = (newMessage) => {
  queryClient.setQueryData(
    ["messages", conversationId],
    (oldData) => {
      if (!oldData?.pages?.length) {
        return oldData;
      }

      const pages = [...oldData.pages];
      const firstPage = pages[0];

      const existing = firstPage.results || [];

      const existingMessage = existing.find(
        (m) =>
          String(m.id) === String(newMessage.id) ||
          (
            newMessage.client_id &&
            m.client_id &&
            String(m.client_id) ===
              String(newMessage.client_id)
          )
      );

      const mergedMessage = existingMessage
        ? {
            ...existingMessage,
            ...newMessage,
            status: mergeMessageStatus(
              existingMessage.status,
              newMessage.status
            ),
          }
        : newMessage;

      const filtered = existing.filter(
        (m) =>
          String(m.id) !==
            String(newMessage.id) &&
          !(
            newMessage.client_id &&
            m.client_id &&
            String(m.client_id) ===
              String(newMessage.client_id)
          )
      );

      pages[0] = {
        ...firstPage,
        results: [
          ...filtered,
          mergedMessage,
        ],
      };

      return {
        ...oldData,
        pages,
      };
    }
  );
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
  attached_gig: selectedGig,

  text,
  image_url: imageUrl,
  video_url: videoUrl,
  thumbnail_url: thumbnailUrl,
  sender_username: username,
  status: "sending",
  created_at: new Date().toISOString(),
};

// Put it in React Query immediately
updateMessagesCache(tempMessage);

// Put it in local UI immediately
setMessages((prev) => {
  const updated = [...prev, tempMessage];

  localStorage.setItem(
    `messages_${conversationId}`,
    JSON.stringify(updated)
  );

  return updated;
});
    

    const messageText = text;

    setText("");
    setSelectedFile(null);
    setSelectedGig(null);
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
          attached_gig: selectedGig,
        }),
      }
    );
    //await refetch();
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
const { data: userStatus } = useQuery({
  queryKey: ["current-user-status", displayUser.username],
  queryFn: async () => {
    const res = await fetchWithAuth(
      `/api/accounts/users/${encodeURIComponent(displayUser.username)}/`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch user status");
    }

    return await res.json();
  },
  enabled: !!displayUser.username,
});
  // ---------------- UI ----------------
  

  
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

          <div className="chat-avatar-wrapper">

  {displayUser.avatar ? (
    <img
      src={displayUser.avatar}
      className="avatar"
      onClick={() =>
        navigate(
          `/public-profile/${displayUser.username}`
        )
      }
    />
  ) : (
    <div
      className="avatar-fallback"
      onClick={() =>
        navigate(
          `/public-profile/${displayUser.username}`
        )
      }
    >
      {displayUser.username[0].toUpperCase()}
    </div>
  )}

  {userStatus?.is_linkx_partner ? (
    <div className="chat-partner-badge">
      <img
        src={`${process.env.PUBLIC_URL}/Linkx.jpg`}
        alt="LinkX Partner"
        className="chat-partner-badge-image"
      />
    </div>
  ) : userStatus?.is_verified ? (
    <div className="chat-verified-badge">
      ✓
    </div>
  ) : null}

</div>

          <div className="header-meta">

            <span
  className="header-name"
  style={{
    color: userStatus?.is_linkx_partner
      ? "#FFD700"
      : "#000000",
  }}
>
  {displayUser.username}
</span>

            {typing && (
              <span className="typing-text">
                typing...
              </span>
            )}

          </div>
        </div>
  </div>

      {displayUser.is_freelancer && (
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
       {isLoading && !data && (
  <>
    <div className="message-row other">
      <div className="bubble skeleton-bubble" />
    </div>

    <div className="message-row mine">
      <div className="bubble skeleton-bubble" />
    </div>

    <div className="message-row other">
      <div className="bubble skeleton-bubble" />
    </div>
  </>
)}
{/*{!isLoading &&
  messages.length === 0 && (
    <div className="empty-chat">
      Initializing conversation ~
    </div>
)}*/}

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
                {msg.attached_gig && (
  <div className="chat-gig-card">

    <img
      src={msg.attached_gig.thumbnail}
      alt=""
      className="chat-gig-image"
    />

    <div className="chat-gig-info">

      <div className="chat-gig-title">
        {msg.attached_gig.title}
      </div>
      {msg.attached_gig?.id && (
                  <button
                    className="view-gig-btn"
                    onClick={() => {
                    setSelectedGigId(msg.attached_gig?.id);
                    setShowGigModal(true);
                      
                    }}
                  >
                    View service
                  </button>
                )}
                
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
                    <span className={`status ${msg.status}`}>
  {msg.status === "sending" && "⏳"}
  {msg.status === "sent" && "✓"}

  {(msg.status === "delivered" ||
    msg.status === "read") &&
    "✓✓"}

  {msg.status === "failed" && "❌"}
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
  {selectedGig && (
  <div className="gig-preview">

    <img
      src={selectedGig.thumbnail}
      alt=""
      className="gig-preview-image"
    />

    <div className="gig-preview-info">
      <div>{selectedGig.title}</div>
      <div>{selectedGig.price}</div>
      <div>{selectedGig.deliverytime}</div>
    </div>

    <button
      onClick={() =>
        setSelectedGig(null)
      }
    >
      <FiX />
    </button>

  </div>
)}

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

      {viewedGig ? (
        <Gig gig={viewedGig} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  </div>
)}
  </div>
);

}