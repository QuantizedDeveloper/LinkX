import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

import SideMenu from "../components/SideMenu";
import Gig from "../components/Gig";
import { showToast } from "../utils/toast";

const base_url = "https://Linkx1.pythonanywhere.com";

const fixUrl = (url) => {
  if (!url) return null;

  if (url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }

  if (url.startsWith("http")) return url;

  return base_url + url;
};

export default function Home() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const username = localStorage.getItem("username");

  // ✅ Logout (unchanged)
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    window.location.href = "/login";
  };

  // ✅ Protect route (unchanged)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login");
  }, [navigate]);

  // =========================
  // ✅ FETCH ME (React Query)
  // =========================
  const fetchMe = async () => {
    const res = await fetch(`${base_url}/freelancers/me/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch user");

    return res.json();
  };

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
  });

  // =========================
  // ✅ FETCH GIGS (Infinite)
  // =========================
  const fetchGigs = async ({ pageParam = 1 }) => {
    const res = await fetch(
      `${base_url}/api/gigs/?page=${pageParam}`
    );

    const data = await res.json();

    return {
      gigs: data.results || [],
      nextPage: data.next ? pageParam + 1 : undefined,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["gigs"],
    queryFn: fetchGigs,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
  });

  // flatten pages
  const gigs = data?.pages.flatMap((page) => page.gigs) || [];

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

        {/* Upload Row */}
        <div
          style={styles.uploadRow}
          onClick={() => {
            if (profile?.is_freelancer) {
              navigate("/upload");
            } else {
              showToast("Only freelancers can upload gigs");
            }
          }}
        >
          {profile?.avatar ? (
            <img src={fixUrl(profile.avatar)} style={styles.avatar} alt="" />
          ) : (
            <div style={styles.avatarFallback}>
              {username ? username.charAt(0).toUpperCase() : "?"}
            </div>
          )}

          <div>
            <div style={styles.name}>{username}</div>
            <div style={styles.uploadText}>upload gig</div>
          </div>
        </div>

        <div style={styles.divider}></div>

        {/* Feed */}
        <div style={styles.feed}>
          <div>
            {gigs.map((gig) => (
              <Gig key={gig.id} gig={gig} />
            ))}
          </div>

          {isFetchingNextPage && <p>Loading...</p>}

          {hasNextPage && !isFetchingNextPage && (
            <button onClick={() => fetchNextPage()}>
              Load More
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  avatarFallback: {
    width:44,
    height: 44,
    borderRadius: "50%",
    marginRight: 10,
    background: "#f4f4f4",
    // ✅ center text
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // ✅ text style
    fontWeight: "bold",
    fontSize: 18,
    color: "#000",
    // ✅ black outline
    boxShadow: "0 0 0 2px black",
    fontFamily: "Inter, sans-serif"
  },
  
  
  
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
    cursor: "pointer",
    fontFamily: "Inter, sans-serif"
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    //background: "black",
    marginRight: 10,
    objectFit: "cover"
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

  /*feed: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    maxWidth: "490px",   // 👈 controls gig size
    margin: "0 auto"
  }*/
  feed: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    left: -13,
    fontFamily: "Inter, sans-serif"
  }
};


