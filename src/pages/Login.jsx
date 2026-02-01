import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE = "https://Linkx1.pythonanywhere.com"; // backend base URL

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/accounts/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.access) {
        setError(data?.message || "Invalid credentials");
        return;
      }

      // ⚡ Store tokens and user info FIRST
      localStorage.setItem("accessToken", data.access);
      if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("username", data.username || "unknown");
      localStorage.setItem("email", email);

      // ✅ Ensure tokens are available before navigating
      setTimeout(() => {
        navigate("/"); // safe now
      }, 50);

    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter email first");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/accounts/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "User does not exist");
        return;
      }

      sessionStorage.setItem("resetEmail", email);
      navigate("/forgot-password"); // make sure this matches App.jsx route

    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Login to continue using LinkX</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <div className="links">
          <span onClick={handleForgotPassword}>forgot password</span>
          <span onClick={() => navigate("/signup")}>
            i don't have an account signup
          </span>
        </div>

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>
      </div>
    </div>
  );
}
