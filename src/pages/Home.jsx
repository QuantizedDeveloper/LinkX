import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import SideMenu from "../components/SideMenu";
import Gig from "../components/Gig";
import { showToast } from "../utils/toast";
import { fetchWithAuth } from "../utils/api";
import Chatbot from "../pages/Chatbot";
import {enablePushNotifications} from "../utils/push";
const base_url = "https://linkx-backend-api-linkx-backend.hf.space";
const isDesktop = window.innerWidth >= 975;
export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const username = localStorage.getItem("username");
  const [checkedAuth, setCheckedAuth] = useState(false);
  useEffect(() => {
    const username = localStorage.getItem("username");
    const timer = setTimeout(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    }
    setCheckedAuth(true);
  }, 100);

  return () => clearTimeout(timer);
}, [navigate]);
useEffect(() => {
  enablePushNotifications();
}, []);
  
  const fetchMe = async () => {
    const res = await fetchWithAuth("/freelancers/me/");
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
    
  };
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnMount: "always",
  });
  const fetchGigs = async ({ pageParam = 1 }) => {
    const res = await fetchWithAuth(`/api/gigs/?page=${pageParam}`);
    const data = await res.json();
    return {
      gigs: data.results || [],
      nextPage: data.next ? pageParam + 1: undefined,
    };
  };
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["gigs"],
    queryFn: fetchGigs,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const gigs = data?.pages?.flatMap((page) => page.gigs) ?? [];
  if (!checkedAuth) {
    return null;
    }
  return (
    
    <>
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

         {!isDesktop && (<div
          style={styles.uploadRow}
          onClick={() => {
            if (profile?.is_freelancer) {
              navigate("/upload");
            } else {
              showToast("Only freelancers can create services");
            }
          }}
        >
          {profile?.avatar ? (
            <img src={profile.avatar} style={styles.avatar} alt="" />
          ) : (
            <div style={styles.avatarFallback}>
              {username ? username.charAt(0).toUpperCase() : "?"}
            </div>
          )}

          <div>
            <div style={styles.name}>{username}</div>
            <div style={styles.uploadText}>create service </div>
          </div>
        </div>)}

        <div style={styles.divider}></div>
        {isDesktop ? (
  <div style={styles.desktopLayout}>
    
   <div style={styles.linkbotSidebar}>
     <div style={{ width: "35%", height: "100%", position:"fixed" }}>
        <Chatbot />
      </div>
    </div>

    <div style={styles.desktopFeed}>
      {gigs.length === 0 && isLoading && <p>Loading...</p>}

      {gigs.map((gig) => (
        <div
  key={gig.id}
  style={{
    breakInside: "avoid",
    marginBottom: "20px"
  }}
>
  <Gig gig={gig} />
</div>
      ))}

      {isFetchingNextPage && <p>Loading...</p>}
      {hasNextPage && !isFetchingNextPage && (
        <button onClick={() => fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  </div>
) : (
  <div style={styles.feed}>
    <div>
      {gigs.length === 0 && isLoading && <p>Loading...</p>}

      {gigs.map((gig) => (
        <Gig key={gig.id} gig={gig} />
      ))}
      {isFetchingNextPage && <p>Loading...</p>}
      {hasNextPage && !isFetchingNextPage && (
        <button onClick={() => fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  </div>
)}
        
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "#000",
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
    width: 19,
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
  feed: {
    display: "flex",
    justifyContent: "center",
    width: "85%",
    position: "relative",
    left: 13,
    fontFamily: "Inter, sans-serif"
  },
  loadmore: {
    display:"flex",
    flexDirection:"column",
    alignItems: "center",
    marginTop: "20px"
  },
  desktopLayout: {
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  gap: "40px"
},
linkbotSidebar: {
  width: "30%",
  minWidth: "350px",
  position: "sticky",
  top: "70px",
  height: "calc(150dvh - 10px)",
  overflow: "hidden",  
},
desktopFeed: {
  columnCount: 2,
  columnGap: "20px",
  width: "100%",
  marginLeft: "30%",
}
};


