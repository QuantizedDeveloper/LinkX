import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FiMail } from "react-icons/fi";
import blackImg from "../assets/black.jpg";
import "./gig.css";
import { showToast } from "../utils/toast";
import ReviewSection from "./ReviewSection";



const API_BASE = "https://Linkx1.pythonanywhere.com";

// Fix Django media URL
const fixUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return API_BASE + url;
};

export default function Gig({ gig }) {
  const navigate = useNavigate();
  const menuRef = useRef();

  // ---------------- DATA ----------------
  const username = gig?.username || gig?.user || "freelancer";
  const avatar = fixUrl(gig?.user_avatar || gig?.avatar) || blackImg;
  const title = gig?.title || "Untitled gig";
  const description = gig?.description || "No description yet";
  const price = gig?.price || "Price not set";
  const deliveryTime = gig?.delivery_days || "Delivery time not set";
  const created_at = gig?.created_at ? gig.created_at.split("T")[0] : "time undefined";
  const imagesArray = Array.isArray(gig?.images)
    ? gig.images
    : [gig?.image1, gig?.image2, gig?.image3];

  const images = imagesArray.filter(Boolean).map(fixUrl);
  const finalImages = images.length > 0 ? images : [];

  // ---------------- OWNER CHECK ----------------
  const loggedUser = localStorage.getItem("username");
  const token = localStorage.getItem("accessToken");
  const isOwner = loggedUser === username;

  // ---------------- UI STATE ----------------
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [deleted, setDeleted] = useState(false);

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
  const deleteGig = async () => {
    if (!window.confirm("Delete this gig?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/gigs/gigs/delete/${gig.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
          <img
            src={avatar}
            alt="user"
            className="gig-avatar"
            onClick={() => navigate(`/public-profile/${username}`)}
          />

          <span
            className="gig-username">
            {username}
          </span>

          <FiMail className="gig-dm-icon" onClick={() => {
          if (loggedUser === username) {
          showToast("You can't message yourself.");
          return;
          }
          navigate(`/chat/${username}`);
          }}/>
        </div>

        {/* THREE DOTS */}
        <span className="gig-menu" onClick={() => setMenuOpen(!menuOpen)}>
          ⋯
        </span>

        {/* MENU */}
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
      <div className="gig-media">
        {finalImages.map((img, i) => (
          <div className="gig-media-item" key={i}>
            <img src={img} alt="gig" />
          </div>
        ))}
      </div>
      {/* create at*/}
      <div className = "create-at">{created_at}</div>
      
      {/* FOOTER */}
      <div className="gig-footer">
        <div>
          <div className="label">Price</div>
          <div className="value">{price}</div>
        </div>

        <div>
          <div className="label">Delivery</div>
          <div className="value">{deliveryTime}</div>
          <ReviewSection gigId={gig.id} />
        </div>
      </div>

      {/* DESCRIPTION POPUP */}
      {showDesc && (
        <div className="gig-desc-popup">
          <div className="gig-desc-box">
            <span className="gig-desc-close" onClick={() => setShowDesc(false)}>
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