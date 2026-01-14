import "./gig.css";
import { FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import blackImg from "../assets/black.jpg";

export default function Gig({ gig }) {
  const navigate = useNavigate();

  const price =
    typeof gig?.price === "number" ? `₹${gig.price}` : "Price not set";

  const deliveryTime =
    typeof gig?.delivery_days === "number"
      ? `${gig.delivery_days} days`
      : "Delivery time not set";

  const images =
    Array.isArray(gig?.images) && gig.images.length > 0
      ? gig.images
      : [blackImg, blackImg];

  return (
    <div className="gig-post">
      <div className="gig-post-header">
        <div className="gig-user">
          <img
            src={gig?.user_avatar || blackImg}
            alt="user"
            className="gig-avatar"
          />

          <span className="gig-username">
            {gig?.username || "freelancer"}
          </span>

          <FiMail
            className="gig-dm-icon"
            onClick={() => navigate("/chat/1")}
          />
        </div>

        <span className="gig-menu">⋯</span>
      </div>

      <div className="gig-title">
        {gig?.title || "Untitled gig"}
      </div>

      <div className="gig-media">
        {images.map((img, i) => (
          <div className="gig-media-item" key={i}>
            <img src={img} alt="gig" />
          </div>
        ))}
      </div>

      <div className="gig-footer">
        <div>
          <div className="label">Price</div>
          <div className="value">{price}</div>
        </div>

        <div>
          <div className="label">Delivery time</div>
          <div className="value">{deliveryTime}</div>
        </div>

        <div className="gig-rating">⭐ 0</div>
      </div>
    </div>
  );
}
