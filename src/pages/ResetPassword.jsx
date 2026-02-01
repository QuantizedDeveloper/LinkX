import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const API_BASE = "https://Linkx1.pythonanywhere.com";

export default function ResetPassword() {
  const navigate = useNavigate();

  const username = sessionStorage.getItem("resetUsername");
  const resetToken = sessionStorage.getItem("resetToken");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resetToken || !username) {
      navigate("/login");
    }
  }, [navigate, resetToken, username]);

  const handleReset = async () => {
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/accounts/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Reset failed");
        return;
      }

      // cleanup
      sessionStorage.removeItem("resetToken");
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetUsername");

      navigate("/login");
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-card">
        <h2>{username}</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleReset} disabled={loading}>
          {loading ? "Please wait..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}
