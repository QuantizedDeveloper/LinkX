import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("resetEmail");

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const isComplete = otp.every((d) => d !== "");

  const verifyOtp = async () => {
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid OTP");
        return;
      }

      navigate("/reset-password");
    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="otp-wrapper">
      <div className="otp-card">
        <h2>Enter OTP</h2>
        <p>{email}</p>

        <div className="otp-inputs">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              maxLength="1"
            />
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        <button
          onClick={verifyOtp}
          disabled={!isComplete}
          className={isComplete ? "active" : ""}
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
}
