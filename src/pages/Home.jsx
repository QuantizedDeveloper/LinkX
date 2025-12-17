import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "../components/SideMenu";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Side menu */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div style={styles.container}>

        {/* Top bar */}
        <div style={styles.topBar}>
          <div
            style={styles.menu}
            onClick={() => setMenuOpen(true)}
          >
            <div style={styles.line}></div>
            <div style={styles.line}></div>
            <div style={styles.line}></div>
          </div>

          {/* 🔍 Search icon (CLICKABLE NOW) */}
          <div
            style={styles.search}
            onClick={() => navigate("/search")}
          >
            <div style={styles.searchCircle}></div>
            <div style={styles.searchHandle}></div>
          </div>
        </div>

        {/* Upload box */}
        <div
          style={styles.uploadRow}
          onClick={() => navigate("/upload")}
        >
          {/* Avatar */}
          <div
            style={styles.avatar}
            onClick={(e) => {
              e.stopPropagation();
            }}
          ></div>

          <div>
            <div
              style={styles.name}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              freelancer
            </div>

            <div style={styles.uploadText}>
              upload gig
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider}></div>

        {/* Empty feed */}
        <div style={styles.feed}></div>

      </div>
    </>
  );
}

const styles = {
  container: {
    paddingBottom: 90
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px"
  },

  menu: { cursor: "pointer" },

  line: {
    width: 22,
    height: 2,
    background: "black",
    marginBottom: 4
  },

  /* Search icon */
  search: {
    position: "relative",
    width: 18,
    height: 18,
    cursor: "pointer"
  },

  searchCircle: {
    width: 12,
    height: 12,
    border: "2px solid black",
    borderRadius: "50%",
    position: "absolute",
    top: 0,
    left: 0
  },

  searchHandle: {
    width: 2,
    height: 6,
    background: "black",
    position: "absolute",
    bottom: 0,
    right: 0,
    transform: "rotate(45deg)"
  },

  uploadRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    cursor: "pointer"
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "black",
    marginRight: 10
  },

  name: {
    fontWeight: "600",
    fontSize: 15
  },

  uploadText: {
    fontSize: 14,
    color: "#bbb"
  },

  divider: {
    height: 1,
    background: "#eee",
    marginTop: 6
  },

  feed: {
    height: "100vh"
  }
};
