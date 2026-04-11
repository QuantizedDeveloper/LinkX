import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUser, FiPlus } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
//const base_url = "https://Linkx1.pythonanywhere.com";

const base_url = "https://linkx-backend-api-linkx-backend.hf.space";

export default function BottomNav() {
  useEffect(() => {
    const fetchMe = async () => {
    try {
      const res = await fetch(`${base_url}/freelancers/me/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await res.json();
      setMe(data);
    } catch (err) {
      console.error("Failed to fetch user");
    }
  };

  fetchMe();
  }, []);
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const location = useLocation(); // get current path

  return (
    <div style={styles.nav}>
      {/* Home */}
      <Link to="/">
        <FiHome
          size={24}
          color={location.pathname === "/" ? "#000" : "#aaa"}
        />
      </Link>

      {/* Add / Upload */}
      <div style={styles.plus} onClick={() => {
      if (!me) return;
      if (me.is_freelancer) {
      navigate("/upload");
    } else {
      showToast("Only freelancers can upload gigs");
    }
  }}>
        
  <FiPlus
    size={28}
    color={location.pathname === "/upload" ? "#000" : "#aaa"}
  />
</div>

      {/* Profile */}
      <Link to="/profile">
        <FiUser
          size={24}
          color={location.pathname === "/profile" ? "#000" : "#aaa"}
        />
      </Link>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid #ddd",
    position: "fixed",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
  },
  plus: {
    backgroundColor: "#eee",
    borderRadius: "50%",
    padding: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
  },
};
