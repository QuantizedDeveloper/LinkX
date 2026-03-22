import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Gig from "../components/Gig";

export default function Search() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (!query.trim()) return;

      setLoading(true);

      try {
        const res = await fetch(
          `https://Linkx1.pythonanywhere.com/api/gigs/search/?q=${query}`
        );

        const data = await res.json();
        setGigs(data);
      } catch (err) {
        console.error("Search error:", err);
      }

      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.back} onClick={() => navigate(-1)}>
          ✕
        </span>
        <h2 style={styles.title}>Search</h2>
      </div>

      {/* SEARCH INPUT */}
      <div style={styles.searchBox}>
        <span style={styles.icon}>🔍</span>
        <input
          placeholder="Search gigs"
          style={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* RESULTS */}
      <div style={{ marginTop: 20 }}>
        {loading && <p>Searching...</p>}

        {!loading && gigs.length === 0 && query && (
          <p style={{ opacity: 0.6 }}>No gigs found</p>
        )}

        {gigs.map((gig) => (
          <Gig key={gig.id} gig={gig} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 16,
    fontFamily: "sans-serif",
    background: "#fff",
    minHeight: "100vh"
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14
  },

  back: {
    fontSize: 22,
    cursor: "pointer"
  },

  title: {
    margin: 0,
    fontSize: 22
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#f2f2f2",
    padding: "12px 14px",
    borderRadius: 20
  },

  icon: {
    fontSize: 16,
    opacity: 0.6
  },

  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 16
  }
};

