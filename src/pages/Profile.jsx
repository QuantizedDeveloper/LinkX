import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      {/* cover */}
      <div style={styles.cover}></div>

      {/* profile section */}
      <div style={styles.profileSection}>
        <div style={styles.avatar}></div>

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
          <div style={styles.name}>freelancer</div>
          <div style={styles.handle}>@freelancerX11</div>
        </div>
      </div>

      {/* bio */}
      <p style={styles.bio}>
        i'm fullstack developer i help solo devs startup founders and agencies
        increase productivity and time for them to rest Thank you!
      </p>

      {/* tabs */}
      <div style={styles.tabs}>
        <div style={styles.activeTab}>gigs</div>
        <div style={styles.inactiveTab}>about</div>
      </div>

      {/* gigs */}
      <GigCard
        title="i will build landing page"
        price="₹1500-3000"
      />

      <GigCard
        title="i will debug your python code"
        price="₹500-3000"
      />
    </div>
  );
}

function GigCard({ title, price }) {
  return (
    <div style={styles.gig}>
      <div style={styles.gigAvatar}></div>

      <div style={{ flex: 1 }}>
        <div style={styles.gigName}>freelancer</div>
        <div>{title}</div>
        <div style={styles.price}>{price}</div>
      </div>

      <div style={styles.inbox}>✉</div>
    </div>
  );
}



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
    paddingBottom: 6
  },

  inactiveTab: {
    color: "#999",
    paddingBottom: 6
  },

  gig: {
    display: "flex",
    padding: 16,
    borderBottom: "1px solid #eee",
    alignItems: "center"
  },

  gigAvatar: {
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
  },

  inbox: {
    fontSize: 22
  }
};
