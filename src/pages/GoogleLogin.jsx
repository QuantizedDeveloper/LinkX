// GoogleLogin.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { Link } from "react-router-dom";
import "../firebase";
import "./GoogleLogin.css";

import { FcGoogle } from "react-icons/fc";
import { FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { showToast } from "../utils/toast";
export default function GoogleLogin() {
  const [checked, setChecked] = useState(false);
  
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const handleGoogleLogin = async () => {
    if (!agreed) {
      showToast("Please accept LinkX terms first");
      return;
    }

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();

      const res = await fetch(
        "https://linkx-backend-api-linkx-backend.hf.space/api/accounts/google-login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_token: idToken }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Login failed");
        return;
      }

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      if (data.needs_username) {
        navigate("/username");
      } else if (data.needs_face) {
        navigate("/faceVerification");
      } else {
        localStorage.setItem("username", data.username);
        navigate("/");
      }
    } catch (err) {
      console.error("FULL ERROR:", err);

      showToast(err.message || err.code || "Google login failed");
    }
  };

  const handleUnavailable = () => {
    showToast("This login method is not available right now");
  };

  return (
    <div className="login-container">
      <div className="login-content">

        <h1 className="signup-title">signup with</h1>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          className="social-btn google-circle"
        >
          <FcGoogle className="social-icon google-icon" />
        </button>

        {/* LINKEDIN */}
        <button
          onClick={handleUnavailable}
          className="social-btn linkedin-circle"
        >
          <FaLinkedinIn className="social-icon linkedin-icon" />
        </button>

        {/* X */}
        <button
          onClick={handleUnavailable}
          className="social-btn x-circle"
        >
          <FaXTwitter className="social-icon x-icon" />
        </button>

        <div className="terms-container">
          <label>
  <input
    type="checkbox"
    checked={agreed}
    onChange={(e) => setAgreed(e.target.checked)}
  />
  I have read and agree to the{" "}
  <Link to="/terms">Terms & Conditions</Link>.
</label>
        </div>

        

      </div>
    </div>
  );
}