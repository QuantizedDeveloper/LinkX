import { FiMenu, FiSearch } from "react-icons/fi";

export default function Navbar() {
  return (
    <div style={styles.navbar}>
      <FiMenu size={24} />
      <FiSearch size={24} />
    </div>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    borderBottom: "1px solid #ddd",
    position: "sticky",
    top: 0,              // 🔑 REQUIRED
    zIndex: 1000,        // 🔑 stay above feed
    background: "#fff", // 🔑 prevent overlap
  }

