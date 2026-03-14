import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VerifyOtp.css";
import axios from "axios";
import { showToast } from "../utils/toast";

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
      showToast("Enter complete OTP");
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
      showToast(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
  <div className="otp-wrapper">
    <div className="otp-card">
      <h2>Enter OTP</h2>

      <p className="otp-email">{email}</p>

      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            maxLength={1}
          />
        ))}
      </div>

      <button onClick={handleVerify}>Verify OTP</button>
    </div>
  </div>
 );

};

export default VerifyOtpSignup;

