import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUser, FiPlus } from "react-icons/fi";

export default function BottomNav() {
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
      <Link to="/upload">
        <div style={styles.plus}>
          <FiPlus
            size={28}
            color={location.pathname === "/upload" ? "#000" : "#aaa"}
          />
        </div>
      </Link>

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
