import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
export default function SideMenu({ open, onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    //window.location.href = "/login";
    localStorage.clear()
    queryClient.clear()
  };
  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.menu} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.logo}>LinkX</div>
            <div style={styles.active}>
              <span style={{ color: "green" }}>active</span> freelancers 0
            </div>
          </div>

          <div style={styles.close} onClick={onClose}>
            ✕
          </div>
        </div>

        {/* BUTTONS */}
        <div style={styles.buttonsContainer}>

          <div
            style={styles.bigButton}
            onClick={() => {
              navigate("/inbox");
              onClose();
            }}
          >
            Inbox
          </div>

          <div
            style={styles.bigButton}
            onClick={() => {
              navigate("/chatbot");
              onClose();
            }}
          >
            Linkbot
          </div>

          <div
            style={styles.bigButton}
            onClick={() => {
              // placeholder
              onClose();
            }}
          >
            Support
          </div>

        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <button onClick={handleLogout}>Logout</button>
          
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.2)",
    zIndex: 5000,
  },

  menu: {
    width: "75%",
    height: "100%",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px",
    borderBottom: "1px solid #ddd",
  },

  logo: {
    fontSize: 26,
    fontWeight: "bold",
  },

  active: {
    fontSize: 14,
    marginTop: 4,
  },

  close: {
    fontSize: 22,
    cursor: "pointer",
  },

  buttonsContainer: {
    padding: "20px 10px",
  },

  bigButton: {
  background: "#ffffff",
  padding: "16px",
  marginBottom: "14px",
  fontSize: "18px",
  textAlign: "left",
  fontWeight: "600",
  borderRadius: "14px",
  cursor: "pointer",

  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },

  footer: {
    marginTop: "auto",
    padding: "14px",
    fontSize: 20,
    color:"red",
    border:"none",
    background:"#ccc by"
  },
};