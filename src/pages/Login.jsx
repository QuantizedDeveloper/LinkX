import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

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
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      // ✅ THIS WAS MISSING
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("username", data.username);

      navigate("/home");
    } catch {
      setError("Server error. Try again.");
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter email first");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "User does not exist");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("resetEmail", email);
      navigate("/forgot-password");
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
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
