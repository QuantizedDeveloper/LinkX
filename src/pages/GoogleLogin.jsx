import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "../firebase";
 // ✅ correct
import "./GoogleLogin.css"
export default function GoogleLogin() {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
  if (!checked) return;

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
      alert(data.error || "Login failed");
      return;
    }

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    
    if (data.needs_username) {
      navigate("/username");
    } else if (data.needs_face) {
      navigate("/faceVerification");
    } else {
      localStorage.setItem("username", data.username)
      navigate("/");
      
    }

  } catch (err) {
    console.error("FULL ERROR:", err);

    alert(
      err.message || err.code || "Google login failed"
    );
  }
};

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <button
        onClick={handleGoogleLogin}
        disabled={!checked}
        style={{
          padding: "12px 20px",
          borderRadius: 10,
          cursor: checked ? "pointer" : "not-allowed",
          opacity: checked ? 1 : 0.5,
        }}
      >
        Sign in with Google
      </button>

      <div style={{ marginTop: 20 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => setChecked(!checked)}
        />
        <span> I agree to LinkX terms</span>
      </div>
    </div>
  );
}