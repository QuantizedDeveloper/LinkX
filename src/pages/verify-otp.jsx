import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

axios.defaults.baseURL = "https://Linkx1.pythonanywhere.com";
axios.defaults.withCredentials = true;


const VerifyOtpSignup = () => {
  const navigate = useNavigate();

  const email = sessionStorage.getItem("email");

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      alert("Enter complete OTP");
      return;
    }
    //axios.defaults.baseURL = "http://127.0.0.1:8001/";

    
    try {
      await axios.post("/api/accounts/verify-signup-otp/", {
        email,
        otp: finalOtp,
      });

      navigate("/FaceVerification");

    } catch (err) {
      alert(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div>
      <p>OTP sent to {email}</p>

      <div style={{ display: "flex", gap: "10px" }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            maxLength={1}
            style={{ width: "50px", height: "50px", textAlign: "center" }}
          />
        ))}
      </div>

      <button onClick={handleVerify}>Verify OTP</button>
    </div>
  );
};

export default VerifyOtpSignup;



const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    width: "320px",
    padding: "25px",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "16px",
    marginBottom: "6px",
  },
  email: {
    fontSize: "14px",
    marginBottom: "20px",
    fontWeight: "500",
  },
  otpBox: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  otpInput: {
    width: "55px",
    height: "55px",
    fontSize: "20px",
    textAlign: "center",
    borderRadius: "10px",
    border: "2px solid #ddd",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: "16px",
    cursor: "pointer",
  },
};