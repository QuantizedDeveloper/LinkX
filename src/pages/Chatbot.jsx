import { useNavigate } from "react-router-dom";

export default function Chatbot() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.back}
        onClick={() => navigate("/")}
      > 
        <svg 
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </div>

        

        <div style={styles.title}>LinkBot</div>
        <div style={styles.avatar}></div>
      </div>

      {/* Scrollable messages only */}
      <div style={styles.messages}>
        {/* chat messages later */}
      </div>

      {/* FIXED input (never scrolls) */}
      <div style={styles.inputBar}>
        <input
          placeholder="start finding"
          style={styles.input}
        />
        <div style={styles.send}>^</div>
      </div>

    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#fff"
  },

  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    borderBottom: "1px solid #eee",
    background: "#fff",
    zIndex: 10
  },

  back: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
  cursor: "pointer"
  },



  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold"
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#000"
  },

  messages: {
    position: "absolute",
    top: 56,
    bottom: 60,
    left: 0,
    right: 0,
    overflowY: "auto",
    padding: 14
  },

  inputBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    borderTop: "1px solid #eee",
    background: "#fff"
  },

  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    border: "1px solid #ddd",
    padding: "0 14px",
    fontSize: 16,
    outline: "none"
  },

  send: {
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};
