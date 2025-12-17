import { useNavigate } from "react-router-dom";

export default function Notification() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.back} onClick={() => navigate(-1)}>
          &#8249;
        </div>
        <div style={styles.title}>Inbox</div>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <div style={styles.tabInactive}>Notifications</div>
        <div style={styles.tabInactive}>Chats</div>
      </div>

      {/* CONTENT (BLANK SKELETON) */}
      <div style={styles.body}>
        {/* future notification cards */}
      </div>

    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#fff",
    display: "flex",
    flexDirection: "column"
  },

  header: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    borderBottom: "1px solid #ddd"
  },

  back: {
    fontSize: 26,
    marginRight: 10,
    cursor: "pointer"
  },

  title: {
    fontSize: 22,
    fontWeight: "600"
  },

  tabs: {
    display: "flex",
    borderBottom: "1px solid #eee"
  },

  tabInactive: {
    flex: 1,
    textAlign: "center",
    padding: "12px 0",
    fontSize: 16,
    color: "#aaa"
  },

  body: {
    flex: 1,
    background: "#f1f1f1"
  }
};

