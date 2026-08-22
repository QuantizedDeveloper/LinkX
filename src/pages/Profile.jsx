import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { showToast } from "../utils/toast";
import Gigs from "../components/Gigs";
import { fetchWithAuth } from "../utils/api";

const API_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

// =========================
// Helpers
// =========================
const fixUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://")) url = url.replace("http://", "https://");
  if (url.startsWith("http")) return url;
  return API_BASE + url;
};

const fixCloudinaryUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://res.cloudinary.com/dd04focej/${url}`;
};

export default function Profile() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("gigs");
  const [agree, setAgree] = useState(false);

  const username = localStorage.getItem("username") || "user";
  const token = localStorage.getItem("accessToken");

  // =========================
  // Protect route
  // =========================
  useEffect(() => {
    if (!token) navigate("/login");
  }, [navigate, token]);

  // =========================
  // Freelancer status
  // =========================
  const { data: statusData } = useQuery({
    queryKey: ["freelancerStatus"],
    queryFn: async () => {
      const res = await fetchWithAuth(`/freelancers/status/`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    onError: (err) =>
      showToast("Error fetching freelancer status: " + err.message),
  });

  const isFreelancer = statusData?.is_freelancer ?? false;

  // =========================
  // Profile
  // =========================
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetchWithAuth(`/freelancers/me/`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    onError: (err) =>
      showToast("Error fetching profile: " + err.message),
  });

  const profile = profileData || {};
  
  const { data: aboutData } = useQuery({
  queryKey: ["about-profile", username],
  queryFn: async () => {
    const res = await fetchWithAuth(
      `/freelancers/${username}/about/`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch about");
    }

    return res.json();
  },
  enabled: !!username,
});
  
  // =========================
  // Gigs
  // =========================
  const { data: gigsData } = useQuery({
    queryKey: ["myGigs"],
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/gigs/gigs/my/`);
      if (!res.ok) throw new Error("Failed to fetch gigs");
      const data = await res.json();

      return data.map((g) => ({
        ...g,
        username: g.username || g.user || "freelancer",
        user_avatar: fixUrl(g.user_avatar || g.avatar || null),
        images: [g.image1, g.image2, g.image3]
          .filter(Boolean)
          .map(fixCloudinaryUrl),
      }));
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    onError: (err) =>
      showToast("Error fetching gigs: " + err.message),
  });

  const safeGigs = gigsData || [];

  // =========================
  // Rating (FIXED)
  // =========================
  const { data: ratingData } = useQuery({
    queryKey: ["rating", username],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `/api/gigs/api/users/${username}/profile-rating/`
      );
      return res.json();
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    keepPreviousData: true,
  });

  // =========================
  // Start freelancing
  // =========================
  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`/freelancers/start/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["freelancerStatus"]);
      showToast("You are now a freelancer 🚀");
    },
    onError: (err) =>
      showToast("Start freelancing failed: " + err.message),
  });

  const startFreelancing = () => {
    if (!agree) {
      showToast("Accept freelancer agreement");
      return;
    }
    startMutation.mutate();
  };

  // =========================
  // Not freelancer UI
  // =========================
  if (!isFreelancer) {
    return (
      <div style={styles.startContainer}>
        <button
          style={styles.startBtn}
          onClick={startFreelancing}
        >
          {startMutation.isLoading ? "Starting..." : "Start freelancing"}
        </button>

        <label style={styles.agreeRow}>
  <input
    type="checkbox"
    checked={agree}
    onChange={() => setAgree(!agree)}
  />
  <span style={{ marginLeft: 8 }}>
    I have read and agree to the{" "}
    <Link
      to="/freelancer-agreement"
      style={{
        color: "#b200ff",
        textDecoration: "underline",
      }}
    >
      LinkX Freelancer Agreement
    </Link>
    .
  </span>
</label>
      </div>
    );
  }

  // =========================
  // MAIN UI (NO BLOCKING)
  // =========================
  return (
    <div style={styles.container}>
      {/* Cover */}
      <div
        style={{
          ...styles.cover,
          backgroundImage: profile.banner
            ? `url(${fixUrl(profile.banner)})`
            : undefined,
        }}
      />

      {/* Profile */}
      <div style={styles.profileSection}>
        <div
          style={{
            ...styles.avatar,
            backgroundImage: profile.avatar
              ? `url(${fixUrl(profile.avatar)})`
              : undefined,
          }}
        />

        <div style={styles.buttons}>
          <button
            style={styles.editBtn}
            onClick={() => navigate("/edit-profile")}
          >
            Edit profile
          </button>

          <button style={styles.subBtn}>Subscribe</button>
        </div>

        <div style={styles.text}>
          <div style={styles.name}>
            {profile.display_name || "freelancer"}
          </div>

          <div style={styles.handle}>
            @{username}
            {ratingData?.total_reviews > 0 ? (
              <> ⭐{ratingData.avg_rating}({ratingData.total_reviews})</>
            ) : (
              <> ⭐New</>
            )}
          </div>
        </div>
      </div>

      <p style={styles.bio}>
        {profile.description || "No description yet"}
      </p>

      {/* Tabs */}
      <div style={styles.tabs}>
  <div
    style={tab === "gigs" ? styles.activeTab : styles.inactiveTab}
    onClick={() => setTab("gigs")}
  >
    services
  </div>

  <div
    style={tab === "about" ? styles.activeTab : styles.inactiveTab}
    onClick={() => setTab("about")}
  >
    about
  </div>

  <div
    style={{
      marginLeft: "auto",
      fontWeight: "600",
      color: profile.View_by_linkx ? "#27c93f" : "#ff3b30",
    }}
  >
    {profile.View_by_linkx
      ? "verified by linkx"
      : "not verified by linkx"}
  </div>
</div>

      {/* Gigs */}
      {tab === "gigs" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {!gigsData && <p>Loading gigs...</p>}
          <Gigs gigs={safeGigs} />
        </div>
      )}

      {/* About */}
      {tab === "about" && (
  <div style={styles.about}>
    

    <p>
      <strong>Experience:</strong>{" "}
      {aboutData?.experience ?? "-"}
    </p>

    <p>
      <strong>Region:</strong>{" "}
      {aboutData?.location ?? "-"}
    </p>

    <p>
      <strong>Total services:</strong>{" "}
      {aboutData?.total_gigs ?? 0}
    </p>

    <p>
      <strong>Total Reviews:</strong>{" "}
      {aboutData?.total_reviews ?? 0}
    </p>

    <p>
      <strong>Avg Rating:</strong>{" "}
      {aboutData?.avg_rating ?? 0}
    </p>
    <p>
  <strong>Joined:</strong>{" "}
  {aboutData?.created_at
    ? new Date(aboutData.created_at).toLocaleDateString()
    : "-"}
</p>
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
    background: "#000",
    backgroundSize: "cover",
    backgroundPosition: "center top",
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
    border: "4px solid white",
    backgroundSize: "cover",
    backgroundPosition: "center top",
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
    lineHeight: 1.5,
    display:"hidden"
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
