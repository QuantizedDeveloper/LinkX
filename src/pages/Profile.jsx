import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../utils/toast";
import Gigs from "../components/Gigs";

const API_BASE = "https://Linkx1.pythonanywhere.com";

const fixUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://")) url = url.replace("http://", "https://");
  if (url.startsWith("http")) return url;
  return API_BASE + url;
};

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("gigs");
  const [agree, setAgree] = useState(false);

  const username = localStorage.getItem("username") || "user";
  const token = localStorage.getItem("accessToken");
  const [ratingData, setRatingData] = useState({
    avg_rating: 0,
    total_reviews: 0,
  });

  useEffect(() => {
    if (!token) navigate("/login");
  }, [navigate, token]);

  // =========================
  // Fetch freelancer status
  // =========================
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["freelancerStatus"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/freelancers/status/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch freelancer status");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 0,
    onError: (err) => showToast("Error fetching freelancer status: " + err.message),
  });

  const isFreelancer = statusData?.is_freelancer ?? false;

  // =========================
  // Fetch profile
  // =========================
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/freelancers/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 0,
    onError: (err) => showToast("Error fetching profile: " + err.message),
  });

  const profile = profileData || {};

  // =========================
  // Fetch gigs
  // =========================
  const { data: gigsData, isLoading: gigsLoading } = useQuery({
    queryKey: ["myGigs"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/gigs/gigs/my/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch gigs");
      const data = await res.json();
      return data.map((g) => ({
        ...g,
        username: g.username || g.user || "freelancer",
        user_avatar: fixUrl(g.user_avatar || g.avatar || null),
        images: [g.image1, g.image2, g.image3].filter(Boolean).map(fixUrl),
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 0,
    onError: (err) => showToast("Error fetching gigs: " + err.message),
  });

  const safeGigs = gigsData || [];

  // =========================
  // Start freelancing mutation
  // =========================
  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/freelancers/start/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start freelancing");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["freelancerStatus"]);
      showToast("You are now a freelancer 🚀");
    },
    onError: (err) => showToast("Start freelancing failed: " + err.message),
  });

  const startFreelancing = () => {
    if (!agree) {
      showToast("Accept freelancer agreement");
      return;
    }
    startMutation.mutate();
  };
  useEffect(() => {
    const fetchRating = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/gigs/api/users/${username}/profile-rating/`);
      const data = await res.json();
      setRatingData(data);
    } catch (err) {
      console.error("Failed to fetch rating", err);
    }
   };
   if (username) {
     fetchRating();
   }
  }, [username]);

  // =========================
  // Loading states
  // =========================
  if (statusLoading || (isFreelancer && profileLoading) || gigsLoading) {
    return <div>Loading...</div>;
  }

  // =========================
  // Not a freelancer yet
  // =========================
  if (!isFreelancer) {
    return (
      <div style={styles.startContainer}>
        <button
          style={styles.startBtn}
          onClick={startFreelancing}
          disabled={startMutation.isLoading}
        >
          {startMutation.isLoading ? "Starting..." : "Start freelancing"}
        </button>
        <label style={styles.agreeRow}>
          <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
          <span style={{ marginLeft: 8, color: "#b200ff" }}>linkX freelancer agreement</span>
        </label>
      </div>
    );
  }

  // =========================
  // Freelancer profile render
  // =========================
  return (
    <div style={styles.container}>
      {/* Cover banner */}
      <div
        style={{
          ...styles.cover,
          backgroundImage: profile.banner ? `url(${fixUrl(profile.banner)})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Profile section */}
      <div style={styles.profileSection}>
        <div
          style={{
            ...styles.avatar,
            backgroundImage: profile.avatar ? `url(${fixUrl(profile.avatar)})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div style={styles.buttons}>
          <button style={styles.editBtn} onClick={() => navigate("/edit-profile")}>
            Edit profile
          </button>
          {/* ========================= */}
          {/* Pay/Subscribe button */}
          <button style={styles.subBtn}>Subscribe</button>
          {/* Three dots menu 
          <button style={styles.menuBtn}>⋮</button>*/}
        </div>

        <div style={styles.text}>
          <div style={styles.name}>{profile.display_name || "freelancer"}</div>
          <div style={styles.handle}>@{username}
         {ratingData.total_reviews > 0 ? (
        <> ⭐{ratingData.avg_rating}({ratingData.total_reviews})</>
        ) : (
        <>⭐ New</>
        )}</div>
        </div>
      </div>

      <p style={styles.bio}>{profile.description || "No description yet"}</p>

      {/* Tabs */}
      <div style={styles.tabs}>
        <div
          style={tab === "gigs" ? styles.activeTab : styles.inactiveTab}
          onClick={() => setTab("gigs")}
        >
          gigs
        </div>
        <div
          style={tab === "about" ? styles.activeTab : styles.inactiveTab}
          onClick={() => setTab("about")}
        >
          about
        </div>
      </div>

      {tab === "gigs" && (
        <div style={{ display: "flex", justifyContent: "center", width: "100%", position: "relative", left: -13 }}>
          <Gigs gigs={safeGigs} />
        </div>
      )}

      {tab === "about" && (
        <div style={styles.about}>
          <p>{profile.about || "No additional info yet"}</p>
        </div>
      )}
    </div>
  );
}
/*function GigCard({ title, price }) {
  return (
    <div style={styles.gig}>
      <div style={styles.gigAvatar}></div>

      <div style={{ flex: 1 }}>
        <div style={styles.gigName}>{username}</div>
        <div>{title}</div>
        <div style={styles.price}>{price}</div>
      </div>

      <div style={styles.inbox}>✉</div>
    </div>
  );
}*/


const styles = {
  container: {
    paddingBottom: 90,
    fontFamily: "sans-serif"
  },

  cover: {
    height: 150,
    background: "#000"
  },

  profileSection: {
    padding: "0 16px",
    marginTop: -40
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "#ddd",
    border: "4px solid white"
  },

  buttons: {
    display: "flex",
    gap: 10,
    marginTop: 10
  },

  editBtn: {
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #ccc",
    background: "white"
  },

  subBtn: {
    padding: "6px 14px",
    borderRadius: 20,
    border: "none",
    background: "black",
    color: "white"
  },

  text: {
    marginTop: 10
  },

  name: {
    fontSize: 18,
    fontWeight: "bold"
  },

  handle: {
    color: "#777"
  },

  bio: {
    padding: "14px 16px",
    lineHeight: 1.4
  },

  tabs: {
    display: "flex",
    gap: 20,
    padding: "0 16px",
    borderBottom: "1px solid #eee"
  },

  activeTab: {
    fontWeight: "bold",
    borderBottom: "2px solid black",
    paddingBottom: 6,
    cursor: "pointer"
  },

  inactiveTab: {
    color: "#999",
    paddingBottom: 6,
    cursor: "pointer"
  },

  /*gig: {
    display: "flex",
    padding: 16,
    borderBottom: "1px solid #eee",
    alignItems: "center",
    position:"relative",
    left:-13
  },

  /*gigAvatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "#ddd",
    marginRight: 12
  },

  gigName: {
    fontWeight: "bold"
  },

  price: {
    marginTop: 4
  },*/

  inbox: {
    fontSize: 22
  },

  about: {
    padding: 16,
    lineHeight: 1.5
  },
  startContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20
  },
  startBtn: {
    padding: "14px 40px",
    borderRadius: 30,
    border: "none",
    background: "black",
    color: "white",
    fontSize: 16
    
  },
  agreeRow: {
    display: "flex",
    alignItems: "center",
    fontSize: 14
  },

};
