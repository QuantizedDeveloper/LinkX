import { useNavigate } from "react-router-dom";

export default function SideMenu({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.menu} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>LinkX</div>

          {/* cancel button (||| style as you drew) */}
          <div style={styles.cancel} onClick={onClose}>
            |||
          </div>
        </div>

        {/* menu items */}
        <div
          style={styles.menuItem}
          onClick={() => {
            navigate("/inbox");
            onClose();
          }}
        >
          inbox
        </div>

        <div
          style={styles.menuItem}
          onClick={() => {
            navigate("/top-gigs");
            onClose();
          }}
        >
          top gigs
        </div>

        <div
          style={styles.menuItem}
          onClick={() => {
            navigate("/chatbot");
            onClose();
          }}
        >
          chatbot
        </div>

        <div
          style={styles.menuItem}
          onClick={() => {
            navigate("/dashboard");
            onClose();
          }}
        >
          dashboard
        </div>

        {/* footer */}
        <div style={styles.footer}>⚙</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.15)",
    zIndex: 1000
  },

  menu: {
    width: "75%",
    height: "100%",
    background: "#fff",
    paddingTop: 10
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderBottom: "1px solid #eee"
  },

  logo: {
    fontSize: 22,
    fontWeight: "bold"
  },

  cancel: {
    fontSize: 22,
    fontWeight: "bold",
    cursor: "pointer"
  },

  menuItem: {
    padding: "16px 14px",
    borderBottom: "1px solid #eee",
    fontSize: 16,
    cursor: "pointer"
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 14,
    fontSize: 20
  }
};
