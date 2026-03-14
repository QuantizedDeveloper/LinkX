import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "../components/SideMenu";
import Gig from "../components/Gig"; // ✅ correct import

export default function Home() {
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    window.location.href = "/login";
  };

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // REAL DATA STATE
  const [gigs, setGigs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem("username")

  // Protect route
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) navigate("/login");
  }, [navigate]);

  // Initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line
  }, []);

  // Fetch gigs from backend
  const loadMore = async () => {
  if (loading || !hasMore) return;
  setLoading(true);

  try {
    const res = await fetch(
      `https://Linkx1.pythonanywhere.com/api/gigs/?page=${page}`
    );

    const data = await res.json();

    // 👇 FIXED: use data.results
    if (!data.results || data.results.length === 0) {
      setHasMore(false);
    } else {
      setGigs((prev) => [...prev, ...data.results]);
      setPage((prev) => prev + 1);
    }
  } catch (err) {
    console.error("Gig fetch error:", err);
  }

  setLoading(false);
};

  return (
    <>
      <button onClick={handleLogout}>Logout</button>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={styles.menu} onClick={() => setMenuOpen(true)}>
            <div style={styles.line}></div>
            <div style={styles.line}></div>
            <div style={styles.line}></div>
          </div>

          <div style={styles.search} onClick={() => navigate("/search")}>
            <div style={styles.searchCircle}></div>
            <div style={styles.searchHandle}></div>
          </div>
        </div>

        <div style={styles.uploadRow} onClick={() => navigate("/upload")}>
          <div style={styles.avatar}></div>

          <div>
            <div style={styles.name}>{username}</div>
            <div style={styles.uploadText}>upload gig</div>
          </div>
        </div>

        <div style={styles.divider}></div>
        <div style={styles.feed}>
          <div style={{ }}>{gigs.map((gig) => (
          <Gig key ={gig.id} gig={gig} />
          ))}
        </div>
          
          {loading && <p>Loading...</p>}
          {hasMore && !loading && (
          <button onClick={loadMore}>Load More</button>
        )}
      </div>
        
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
    padding: "12px 14px",
    position: "sticky",
    top: 0,
    zIndex: 2000,
    background: "#fff"
  },

  menu: { cursor: "pointer" },

  line: {
    width: 22,
    height: 2,
    background: "black",
    marginBottom: 4
  },

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
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    maxWidth: "490px",   // 👈 controls gig size
    margin: "0 auto"
  }
};
