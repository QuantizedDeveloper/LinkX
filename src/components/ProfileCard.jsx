export default function ProfileCard() {
  return (
    <div style={styles.card}>
      <div style={styles.avatar}></div>
      <div>
        <div style={styles.name}>freelancer</div>
        <div style={styles.subtext}>upload gig</div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    backgroundColor: "#ccc",
    marginRight: 12,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  subtext: { fontSize: 14, color: "#888" },
};
