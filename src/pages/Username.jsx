import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Username.css";

const Username = () => {
  const [username, setUsername] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username || !agreed) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const res = await fetch("https://linkx-backend-api-linkx-backend.hf.space/api/accounts/set-username/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/faceVerification");
      } else {
        alert(data.error || "Error");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="username-container">
      <div className="username-box">
        <h2>
          <strong>enter username</strong> to start using LinkX
        </h2>

        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="terms">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
          />
          <span className="link">linkX user agreement</span>
        </div>

        <button
          className={`continue-btn ${
            !username || !agreed ? "disabled" : ""
          }`}
          onClick={handleSubmit}
          disabled={!username || !agreed || loading}
        >
          {loading ? "..." : "continue"}
        </button>
      </div>
    </div>
  );
};

export default Username;