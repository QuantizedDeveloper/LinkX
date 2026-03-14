import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaTimes, FaEllipsisV, FaPlay } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { SiRazorpay, SiPaypal } from "react-icons/si";
import Gig from "../components/Gig";
import { useNavigate } from "react-router-dom";
export default function PublicProfile() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetch(
      `https://Linkx1.pythonanywhere.com/freelancers/public-profile/${username}/`
    )
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [username]);

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://Linkx1.pythonanywhere.com${url}`;
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!profile) return <div style={{ padding: 20 }}>Profile not found</div>;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.headerWrapper}>
        <div
          style={{
            ...styles.banner,
            backgroundImage: profile.banner
              ? `url(${getFullUrl(profile.banner)})`
              : "none",
          }}
        >
          <FaEllipsisV style={styles.topLeftIcon} />
          <FaTimes
            style={styles.topRightIcon}
            onClick={() => window.history.back()}
          />
        </div>

        {/* AVATAR */}
        <div style={styles.avatarWrapper}>
          <div style={styles.avatar}>
            {profile.avatar && (
              <img
                src={getFullUrl(profile.avatar)}
                alt=""
                style={styles.avatarImg}
              />
            )}
          </div>

          {profile.portfolio_link && (
            <div
              style={styles.playBtn}
              onClick={() =>
                window.open(profile.portfolio_link, "_blank")
              }
            >
              <FaPlay size={11} color="#6C63FF" />
            </div>
          )}
        </div>

        {/* PAY BUTTON — RIGHT SIDE, ALIGNED WITH AVATAR */}
        <button
          style={styles.payBtn}
          onClick={() => setShowPayment(!showPayment)}
        >
          Pay
        </button>
      </div>

      {/* INFO */}
      <div style={styles.infoSection}>
        <div style={styles.nameRow}>
          <h2 style={{ margin: 0 }}>
            {profile.display_name || profile.username}
          </h2>

          {/* MAIL ICON */}
          <div style={styles.messageIcon}>
            <FiMail size={20} color="black" onClick={() => navigate(`/chat/${username}`)}
            
            />
            
            <span style={styles.redCornerTop}></span>
            <span style={styles.redCornerBottom}></span>
            
          </div>
          
        </div>

        <p style={styles.username}>@{profile.username}</p>
        <p style={{ marginTop: 15 }}>{profile.description}</p>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <span style={styles.activeTab}>gigs</span>
        <span style={styles.inactiveTab}>about</span>
      </div>

      {/* GIGS */}
      <div style={{ padding: 16 }}>
        {profile.gigs.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No gigs found</p>
        ) : (
          profile.gigs.map((gig) => (
            <Gig key={gig.id} gig={gig} />
          ))
        )}
      </div>

      {/* SIDE PAYMENT PANEL */}
      {showPayment && (
        <div style={styles.sidePayment}>
          {profile.upi_id && (
            <div
              style={styles.paymentItem}
              onClick={() =>
                window.open(`upi://pay?pa=${profile.upi_id}`, "_blank")
              }
            >
              UPI
            </div>
          )}

          {profile.razorpay_link && (
            <SiRazorpay
              size={20}
              style={styles.paymentIcon}
              onClick={() =>
                window.open(profile.razorpay_link, "_blank")
              }
            />
          )}

          {profile.paypal_link && (
            <SiPaypal
              size={20}
              style={styles.paymentIcon}
              onClick={() =>
                window.open(profile.paypal_link, "_blank")
              }
            />
          )}

          {profile.upi_qr && (
            <img
              src={getFullUrl(profile.upi_qr)}
              alt="QR"
              style={{ width: "100%", marginTop: 10 }}
            />
          )}
          <button
          onClick={() => setShowPayment(false)}
          className="absolute top-3 right-3 text-gray-50">✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#f5f5f5",
    minHeight: "100vh",
  },

  headerWrapper: {
    position: "relative",
  },

  banner: {
    height: 150,
    backgroundColor: "black",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  },

  topLeftIcon: {
    position: "absolute",
    top: 15,
    left: 15,
    color: "white",
    fontSize: 18,
    cursor: "pointer",
  },

  topRightIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    color: "white",
    fontSize: 20,
    cursor: "pointer",
  },

  avatarWrapper: {
    position: "absolute",
    bottom: -45,
    left: 20,
  },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: "50%",
    border: "6px solid white",
    overflow: "hidden",
    background: "black",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  playBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "black",
  },

  /* PAY BUTTON aligned with avatar */
  payBtn: {
    position: "absolute",
    right: 20,
    bottom: -45,
    background: "#5BE37D",
    border: "none",
    padding: "8px 24px",
    borderRadius: 20,
    cursor: "pointer",
  },

  infoSection: {
    padding: "60px 16px 16px 16px",
  },

  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  username: {
    opacity: 0.6,
    marginTop: 5,
  },

  messageIcon: {
    position: "relative",
    cursor: "pointer",
  },

  /* RED OUTLINE BOTH SIDES */
  redCornerTop: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderTop: "2px solid red",
    borderRight: "2px solid red",
  },

  redCornerBottom: {
    position: "absolute",
    bottom: 1,
    left: -2,
    width: 8,
    height: 12,
    borderBottom: "2px solid red",
    borderLeft: "2px solid red",
  },

  tabs: {
    display: "flex",
    gap: 20,
    paddingLeft: 16,
    borderBottom: "1px solid #ddd",
    marginTop: 10,
  },

  activeTab: {
    borderBottom: "2px solid black",
    paddingBottom: 6,
  },

  inactiveTab: {
    opacity: 0.6,
  },

  sidePayment: {
    position: "absolute",
    top: 160,
    right: 10,
    width: 150,
    background: "white",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },

  paymentIcon: {
    cursor: "pointer",
    marginBottom: 10,
  },

  paymentItem: {
    cursor: "pointer",
    marginBottom: 10,
    fontWeight: 500,
  },
};