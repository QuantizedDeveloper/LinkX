import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaTimes, FaEllipsisV, FaPlay } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import Gig from "../components/Gig";
import "./Chat.css";
import { showToast } from "../utils/toast";
import { useEffect } from "react";
// ================= PAYMENT MODAL =================
function PaymentModal({ paymentInfo, onClose }) {
  const [showQR, setShowQR] = useState(null);

  if (!paymentInfo) return null;

  const copyUPI = (upi) => {
    navigator.clipboard.writeText(upi);
    showToast("UPI ID copied");
  };

  const items = [
    paymentInfo.razorpay_link && {
      name: "Razorpay",
      type: "link",
      link: paymentInfo.razorpay_link,
    },
    paymentInfo.paypal_link && {
      name: "PayPal",
      type: "link",
      link: paymentInfo.paypal_link,
    },
    (paymentInfo.upi_id || paymentInfo.upi_qr) && {
      name: "UPI",
      type: "upi",
      upi_id: paymentInfo.upi_id,
      qr: paymentInfo.upi_qr,
    },
  ].filter(Boolean);

  const fixUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://Linkx1.pythonanywhere.com${url}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Payment Methods</h3>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <ul className="payment-list">
          {items.map((item, idx) => (
            <li key={idx} className="payment-item">
              <div className="payment-name">{item.name}</div>

              {item.type === "link" && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="pay-btn-link"
                >
                  Pay
                </a>
              )}

              {item.type === "upi" && (
                <div className="upi-actions">
                  {item.qr && (
                    <button
                      className="upi-btn"
                      onClick={() => setShowQR(item.qr)}
                    >
                      Scan QR
                    </button>
                  )}

                  {item.upi_id && (
                    <button
                      className="upi-btn"
                      onClick={() => copyUPI(item.upi_id)}
                    >
                      Copy UPI ID
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        {showQR && (
          <div
            className="qr-modal-overlay"
            onClick={() => setShowQR(null)}
          >
            <div
              className="qr-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={fixUrl(showQR)} alt="UPI QR" className="qr-image" />
              <button onClick={() => setShowQR(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================= MAIN COMPONENT =================
export default function PublicProfile() {
  const navigate = useNavigate();
  const { username } = useParams();

  const [showPayment, setShowPayment] = useState(false);

  const base_url = "https://Linkx1.pythonanywhere.com";
  const token = localStorage.getItem("accessToken");
  const [ratingData, setRatingData] = useState({
    avg_rating: 0,
    total_reviews: 0,
  });
  // ✅ PROFILE QUERY (CACHED)
  const { data: profile, isLoading } = useQuery({
    queryKey: ["publicProfile", username],
    queryFn: async () => {
      const res = await fetch(
        `${base_url}/freelancers/public-profile/${username}/`
      );
      if (!res.ok) throw new Error("Profile error");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    cacheTime: 1000 * 60 * 10, // stays in memory
  });

  // ✅ PAYMENT QUERY (CACHED)
  const { data: paymentInfo } = useQuery({
    queryKey: ["paymentInfo", username],
    queryFn: async () => {
      const res = await fetch(
        `${base_url}/freelancers/payment-info/${username}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Payment error");
      return res.json();
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${base_url}${url}`;
  };
  useEffect(() => {
    const fetchRating = async () => {
    try {
      const res = await fetch(`${base_url}/api/gigs/api/users/${username}/profile-rating/`);
      const data = await res.json();
      setRatingData(data);
    } catch (err) {
      console.error("Failed to fetch rating", err);
    }
   };
   if (username) {
     fetchRating();
   }
  }, [username]);
  
  
  
  

  if (isLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!profile) return <div style={{ padding: 20 }}>Profile not found</div>;

  return (
    <div style={styles.page}>
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
              onClick={() => window.open(profile.portfolio_link, "_blank")}
            >
              <FaPlay size={11} color="#6C63FF" />
            </div>
          )}
        </div>

        <button
          style={styles.payBtn}
          onClick={() => setShowPayment(true)}
        >
          Pay
        </button>
      </div>

      <div style={styles.infoSection}>
        <div style={styles.nameRow}>
          <h2 style={{ margin: 0,
          fontFamily: "Inter, sans-serif"}}>
            {profile.display_name || profile.username}
          </h2>
          

          <div style={styles.messageIcon}>
            <FiMail
              size={20}
              color="black"
              onClick={() => navigate(`/chat/${username}`)}
            />

            <span style={styles.redCornerTop}></span>
            <span style={styles.redCornerBottom}></span>
          </div>
        </div>
        <p styles = {styles.username}>
            @{profile.username} {ratingData.total_reviews > 0 ? (
            <> ⭐{ratingData.avg_rating}({ratingData.total_reviews})</>
        ) : (
        <>⭐ New</>
        )}
        </p>
        <p style={{ marginTop: 15 }}>{profile.description}</p>
      </div>

      <div style={styles.tabs}>
        <span style={styles.activeTab}>gigs</span>
        <span style={styles.inactiveTab}>about</span>
      </div>

      <div style={styles.feed}>
        {profile.gigs.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No gigs found</p>
        ) : (
          profile.gigs.map((gig) => <Gig key={gig.id} gig={gig} />)
        )}
      </div>

      {showPayment && (
        <PaymentModal
          paymentInfo={paymentInfo}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}



/* ================= STYLES ================= */

const styles = {
  page: {
    background: "white",
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
    border: "1px solid black",
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
    fontFamily: "Inter, sans-serif"
  },

  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "Inter, sans-serif"
  },

  username: {
    opacity: 0.6,
    marginTop: 5,
    fontFamily: "Inter, sans-serif"
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
    fontFamily: "Inter, sans-serif"
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
  feed: {
    display: "flex",
    justifyContent: "center",
    width: "80%",
    position: "relative",
    left: 18,
    flexDirection: "column",
    fontFamily: "Inter, sans-serif"
  }
};


{/*<p style={styles.username}>@{profile.username}</p>*/}