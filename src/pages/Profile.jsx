
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Gig from "../components/Gig";
import Gigs from "../components/Gigs"; // OPTIONAL

const API_BASE = "https://Linkx1.pythonanywhere.com";

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("gigs");

  const [isFreelancer, setIsFreelancer] = useState(null);
  const [agree, setAgree] = useState(false);
  const [starting, setStarting] = useState(false);
  const token = localStorage.getItem("accessToken");
  //const [myGigs, setMyGigs] = useState([]);
  
  // ✅ NEW PROFILE STATE
  const [profile, setProfile] = useState(null);
  const [myGigs, setMyGigs] = useState([]);
  
  const username = localStorage.getItem("username");

  // ✅ Check freelancer status
  useEffect(() => {
    if (!token) return navigate("/login");

    fetch(`${API_BASE}/freelancers/status/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setIsFreelancer(data.is_freelancer);
      })
      .catch(() => setIsFreelancer(false));
  }, []);

  // ✅ Load real profile data
  useEffect(() => {
    if (!token || !isFreelancer) return;

    fetch(`${API_BASE}/freelancers/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log("PROFILE DATA:", data);
        setProfile(data);
        //localStorage.setItem(data.)
      });
  }, [isFreelancer]);
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/gigs/gigs/my/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      console.log("RAW GIGS:", data);

      const fixed = data.map(g => ({
        ...g,
        username: g.username || g.user || "freelancer",
        user_avatar: g.user_avatar || g.avatar || null,
        images: [g.image1, g.image2, g.image3].filter(Boolean)
      }));

      console.log("FIXED GIGS:", fixed);
      setMyGigs(fixed);
    })
    .catch(err => console.error("Gig fetch error", err));
  }, []);


  // ✅ Start freelancing
  const startFreelancing = async () => {
    if (!agree) return alert("Accept freelancer agreement");
    if (starting) return;

    setStarting(true);

    const res = await fetch(`${API_BASE}/freelancers/start/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (res.ok) {
      setIsFreelancer(true);
      alert("You are now a freelancer 🚀");
    } else {
      alert(data.error || "Error");
    }

    setStarting(false);
  };

  // ⏳ Loading state
  if (isFreelancer === null) return <div>Loading...</div>;

  // =========================================================
  // 🚫 NOT FREELANCER SCREEN
  // =========================================================
  if (!isFreelancer) {
    return (
      <div style={styles.startContainer}>
        <button
          style={styles.startBtn}
          onClick={startFreelancing}
          disabled={starting}
        >
          {starting ? "Starting..." : "Start freelancing"}
        </button>

        <label style={styles.agreeRow}>
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
          />
          <span style={{ marginLeft: 8, color: "#b200ff" }}>
            linkX freelancer agreement
          </span>
        </label>
      </div>
    );
  }

  // =========================================================
  // ✅ FREELANCER PROFILE SCREEN
  // =========================================================

  return (
    <div style={styles.container}>
      {/* ✅ BANNER */}
      <div
        style={{
          ...styles.cover,
          backgroundImage: profile?.banner ? `url(${profile.banner})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      <div style={styles.profileSection}>
        {/* ✅ AVATAR */}
        <div
          style={{
            ...styles.avatar,
            backgroundImage: profile?.avatar ? `url(${profile.avatar})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div style={styles.buttons}>
          <button
            style={styles.editBtn}
            onClick={() => navigate("/edit-profile")}
          >
            Edit profile
          </button>

          <button style={styles.subBtn}>subscribe</button>
        </div>

        <div style={styles.text}>
          {/* ✅ DISPLAY NAME */}
          <div style={styles.name}>
            {profile?.display_name || "freelancer"}
          </div>

          {/* ✅ USERNAME FROM LOCALSTORAGE */}
          <div style={styles.handle}>@{username}</div>
        </div>
      </div>

      {/* ✅ DESCRIPTION */}
      <p style={styles.bio}>
        {profile?.description || "No description yet"}
      </p>

      {/* TABS */}
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

      {/* STATIC GIGS */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%", position:"relative", left:-13, }}>
        {tab === "gigs" && <Gigs gigs={myGigs} />}
      </div>
      





      {/* ABOUT TAB (STATIC FOR NOW) */}
      {tab === "about" && (
        <div style={styles.about}>
          <p>
            Full-stack developer focused on building clean, scalable products
            for startups, solo founders, and agencies.
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
