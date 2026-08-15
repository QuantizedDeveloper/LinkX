
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "../utils/api";

const isDesktop = window.innerWidth >= 975;

export default function SideMenu({ open, onClose }) {
  const username = localStorage.getItem("username") || "User";
  const avatarLetter = username.charAt(0).toLowerCase();

  const fetchActiveFreelancers = async () => {
    try {
      const res = await fetchWithAuth(
        "/freelancers/active-count/"
      );

      return await res.json();
    } catch (error) {
      return null;
    }
  };
  const { data: unreadChats = [] } = useQuery({
  queryKey: ["sidebar-unread"],
  queryFn: async () => {
    const res = await fetchWithAuth(
      "/api/messaging/sidebar-unread/"
    );

    if (!res.ok) {
      throw new Error("Failed to fetch unread chats");
    }

    return await res.json();
  },
  refetchInterval: 10000,
    
  });

  useEffect(() => {
    const ping = async () => {
      try {
        await fetchWithAuth("/freelancers/ping/", {
          method: "POST",
        });
      } catch (error) {
        // Ignore errors (e.g. user is not a freelancer)
      }
    };

    // Ping immediately
    ping();

    // Ping every 30 seconds
    const interval = setInterval(ping, 30000);

    return () => clearInterval(interval);
  }, []);

  const { data } = useQuery({
    queryKey: ["active-freelancers"],
    queryFn: fetchActiveFreelancers,
    refetchInterval: 30000,
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.clear();
    queryClient.clear();
  };
  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.menu} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
  <div style={styles.userRow}>
    <div style={styles.avatar}>
      {avatarLetter}
    </div>

    <div style={styles.username}>
      {username}
    </div>
  </div>

  <div style={styles.active}>
    <span style={{ color: "lightgreen" }}>active</span>
    {" "} freelancers{" "}
    {data?.active_freelancers ?? 0}
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

          {!isDesktop && (
          <div style={styles.bigButton}
          onClick={() => {
          navigate("/chatbot");
          onClose();
          }}>
            Linkbot
            </div>
            )}
          {isDesktop && (
           <div style = {styles.bigButton}
           onClick = {()=> {
    
             navigate("/upload")
           }}
           >
             Upload Gig
           </div>
          )}

          <div
  style={styles.bigButton}
  onClick={() => {
    window.open(
      "https://mail.google.com/mail/?view=cm&fs=1&to=linkx.llm@gmail.com",
      "_blank"
    );
    onClose();
  }}
>
  Support
</div>

        </div>
        {unreadChats.length > 0 && (
  <div style={styles.unreadContainer}>
    {unreadChats.map((chat) => (
      <div
        key={chat.otherUser}
        style={styles.unreadCard}
        onClick={() => {
          navigate(`/chat/${chat.otherUser}`);
          onClose();
        }}
      >
        <div style={styles.chatAvatar}>
          {chat.otherUser.charAt(0).toUpperCase()}
        </div>

        <div>
          <div style={styles.chatUsername}>
            {chat.otherUser}
          </div>

          <div style={styles.chatSubtitle}>
            You have a new message
            <span style={styles.redDot}>•</span>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
        {/* FOOTER */}
        <div style={styles.footer}>
          <button onClick={handleLogout}>Logout</button>
          
        </div>
      </div>
    </div>
  );
}

const styles = {
  userRow: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
},

avatar: {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  fontWeight: "600",
  textTransform: "uppercase",
  color: "#333",
  fontFamily: "Inter, sans-serif",
  
},

username: {
  fontSize: "18px",
  fontWeight: "500",
  fontFamily: "Inter, sans-serif"
},
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.2)",
    zIndex: 5000,
  },

  menu: {
  width: isDesktop ? "30%" : "75%",
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
  unreadContainer: {
  padding: "0 0 12px 0",
},

unreadCard: {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  cursor: "pointer",
  borderTop: "1px solid #ddd",
  borderBottom: "1px solid #ddd",
},

chatAvatar: {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  border: "1px solid black",
  background: "#eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
  fontWeight: "500",
  color: "#000",
},

chatUsername: {
  fontSize: "18px",
  fontWeight: "500",
},

chatSubtitle: {
  fontSize: "15px",
  marginTop: "4px",
},

redDot: {
  color: "red",
  marginLeft: "6px",
},
};