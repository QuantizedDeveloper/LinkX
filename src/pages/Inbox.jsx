import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Inbox() {
  const [tab, setTab] = useState("chats");
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>Inbox</h2>
        <div style={styles.back} onClick={() => navigate("/")}>
          &gt;
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <span
          style={tab === "notifications" ? styles.active : styles.inactive}
          onClick={() => setTab("notifications")}
        >
          Notifications
        </span>
        <span
          style={tab === "chats" ? styles.active : styles.inactive}
          onClick={() => setTab("chats")}
        >
          Chats
        </span>
      </div>

      {/* CONTENT */}
      {tab === "chats" ? (
        <div>
          <ChatItem
            name="client_1"
            msg="What copy pasting"
            time="12:37 PM"
            onClick={() => navigate("/chat/client_1")}
          />
          <ChatItem
            name="client_2"
            msg="Portfolio link"
            time="yesterday"
            onClick={() => navigate("/chat/client_2")}
          />
        </div>
      ) : (
        <div style={{ height: "60vh", background: "#eee" }} />
      )}
    </div>
  );
}

function ChatItem({ name, msg, time, onClick }) {
  return (
    <div style={styles.chatItem} onClick={onClick}>
      <div style={styles.avatar} />
      <div style={{ flex: 1 }}>
        <div style={styles.name}>{name}</div>
        <div style={styles.msg}>You: {msg}</div>
      </div>
      <div style={styles.time}>{time}</div>
    </div>
  );
}

const styles = {
  page: { background: "#fff", minHeight: "100vh" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottom: "1px solid #ddd"
  },

  back: { fontSize: 24, cursor: "pointer" },

  tabs: {
    display: "flex",
    gap: 20,
    padding: "10px 12px",
    borderBottom: "1px solid #ddd"
  },

  active: {
    fontWeight: "bold",
    borderBottom: "2px solid black",
    cursor: "pointer"
  },

  inactive: { color: "#aaa", cursor: "pointer" },

  chatItem: {
    display: "flex",
    alignItems: "center",
    padding: 12,
    borderBottom: "1px solid #eee",
    cursor: "pointer"
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#ccc",
    marginRight: 10
  },

  name: { fontWeight: "bold" },
  msg: { color: "#777", fontSize: 14 },
  time: { fontSize: 12, color: "#999" }
};
