import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, memo } from "react";
import { FiMail } from "react-icons/fi";
import blackImg from "../assets/black.jpg";
import "./gig.css";
import { showToast } from "../utils/toast";
import ReviewSection from "./ReviewSection";

import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";

import { fetchWithAuth } from "../utils/api";
const API_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

// Fix Django media URL
const fixUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return API_BASE + url;
};

function Gig({ gig }) {
  const navigate = useNavigate();
  const menuRef = useRef();
  const user_name = localStorage.getItem("username");
  // ---------------- DATA ----------------
  const username = gig?.username || gig?.user || "freelancer";
  const avatar = fixUrl(gig?.user_avatar || gig?.avatar) || blackImg;
  const title = gig?.title || "Untitled gig";
  const description = gig?.description || "No description yet";
  const price = gig?.price || "Price not set";
  const deliveryTime = gig?.delivery_days || "Delivery time not set";
  const created_at = gig?.created_at
    ? gig.created_at.split("T")[0]
    : "time undefined";

  const imagesArray = Array.isArray(gig?.images)
    ? gig.images
    : [gig?.image1, gig?.image2, gig?.image3];

  const images = imagesArray.filter(Boolean);
  const finalImages = images.length > 0 ? images : [];

  // ---------------- OWNER CHECK ----------------
  const loggedUser = localStorage.getItem("username");
  const token = localStorage.getItem("accessToken");
  const isOwner = loggedUser === username;

  // ---------------- UI STATE ----------------
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // ---------------- CLOUDINARY OPTIMIZATION ----------------
  const fixCloudinaryUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;

    // 🔥 THIS IS THE BIGGEST SPEED BOOST
    return `https://res.cloudinary.com/dd04focej/image/upload/w_400,q_auto,f_auto/${url}`;
  };

  // ---------------- CLICK OUTSIDE CLOSE ----------------
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---------------- DELETE FUNCTION ----------------
  const { data: userStatus } = useQuery({
  queryKey: ["current-user-status", username],
  queryFn: async () => {
    const res = await fetchWithAuth(
      `/api/accounts/users/${encodeURIComponent(username)}/`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch user status");
    }

    return await res.json();
  },
  enabled: !!username,
});
  const deleteGig = async () => {
    if (!window.confirm("Delete this gig?")) return;

    try {
      const res = await fetchWithAuth(
        `/api/gigs/gigs/delete/${gig.id}/`,
        {
          method: "DELETE",
          }
        )
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Delete failed");
        return;
      }

      showToast("Gig deleted");
      setDeleted(true);
    } catch (err) {
      console.error(err);
      showToast("Server error");
    }
  };

  if (deleted) return null;
  

  return (
    <div className="gig-post">
      {/* HEADER */}
      <div className="gig-post-header">
        <div className="gig-user">
          <div className="gig-avatar-wrapper">

  <img
    src={avatar}
    alt="user"
    className="gig-avatar"
    loading="lazy"
    onClick={() => {
      if (user_name === username) {
        navigate("/profile");
        return;
      }

      navigate(`/public-profile/${username}`);
    }}
  />

  {userStatus?.is_linkx_partner ? (
    <div className="gig-partner-badge">
      <img
        src={`${process.env.PUBLIC_URL}/Linkx.jpg`}
        alt="LinkX Partner"
        className="gig-partner-badge-image"
      />
    </div>
  ) : userStatus?.is_verified ? (
    <div className="gig-verified-badge">
      ✓
    </div>
  ) : null}

</div>

          <span
  className="gig-username"
  style={{
    color: userStatus?.is_linkx_partner
      ? "#FFD700"
      : "#000000",
  }}
>
  {username}
</span>

          <FiMail
            className="gig-dm-icon"
            onClick={() => {
              if (loggedUser === username) {
                showToast("You can't message yourself.");
                return;
              }
              navigate(`/chat/${username}`);
            }}
          />
        </div>

        <span className="gig-menu" onClick={() => setMenuOpen(!menuOpen)}>
          ⋯
        </span>

        {menuOpen && (
          <div className="gig-menu-dropdown" ref={menuRef}>
            <div className="gig-menu-close" onClick={() => setMenuOpen(false)}>
              ✕ Close
            </div>

            <div
              onClick={() => {
                setShowDesc(true);
                setMenuOpen(false);
              }}
            >
              Description
            </div>

            <div>Report</div>
            <div>Portfolio</div>

            {isOwner && (
              <div className="gig-delete" onClick={deleteGig}>
                Delete
              </div>
            )}
          </div>
        )}
      </div>

      {/* TITLE */}
      <div className="gig-title">{title}</div>

      {/* IMAGES */}
      {finalImages.length > 0 && (
        <div className="gig-media">
          {finalImages.map((img, i) => (
            <div className="gig-media-item" key={i}>
              <img
                src={fixCloudinaryUrl(img)}
                alt="gig"
                loading="lazy"   // 🔥 HUGE impact
              />
            </div>
          ))}
        </div>
      )}

      {/* DATE */}
      <div className="create-at">{created_at}</div>

      {/* FOOTER */}
      <div className="gig-footer">
        <div className="left-section">
          <ReviewSection gigId={gig.id} />
        </div>
        <div className="right-section">
          <div className="price-box">
            <div className="label">Price</div>
            <div className="value">{price}</div>
          </div>
          <div className="delivery-box">
            <div className="label">Delivery</div>
            <div className="value">{deliveryTime}</div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION POPUP */}
      {showDesc && (
        <div className="gig-desc-popup">
          <div className="gig-desc-box">
            <span
              className="gig-desc-close"
              onClick={() => setShowDesc(false)}
            >
              ×
            </span>
            <h4>Description</h4>
            <p>{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// 🔥 Prevent unnecessary re-renders
export default memo(Gig);