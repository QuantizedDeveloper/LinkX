// GoogleLogin.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import "../firebase";
import "./GoogleLogin.css";

import { FcGoogle } from "react-icons/fc";
import { showToast } from "../utils/toast";

export default function GoogleLogin() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleGoogleLogin = async () => {
    /*if (!agreed) {
      showToast("Please accept LinkX terms first");
      return;
    }*/

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

  return (
    <div className="login-container">
      <div className="login-content">

        {/* TITLE */}
        <h1 className="welcome-title">
          Welcome to linkX
        </h1>

        {/* SUBTITLE */}
        <p className="welcome-subtitle">
          <span>Find</span>{" "}
          <span>right</span>{" "}
          freelancers{" "}
          <span>in</span>{" "}
          <span>less </span>{" "}
          than 2 minutes.
        </p>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          className="google-circle"
          aria-label="Continue with Google"
        >
          <FcGoogle className="google-icon" />
        </button>

        {/* TERMS */}
        <div className="terms-container">
          <span>linkx </span>
          <Link to="/terms">
            terms and conditions
          </Link>
        </div>

      </div>
    </div>
  );
}