import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSignup = async () => {
  if (!form.username || !form.email || !form.password) {
    alert("All fields are required");
    return;
  }

  if (!form.agree) {
    alert("You must agree to LinkX user agreement");
    return;
  }
  axios.defaults.baseURL = "http://127.0.0.1:8001/";

  try {
    await axios.post("/api/accounts/send-signup-otp/", {
      email: form.email,
      username: form.username,
    });

    // ✅ store TEMPORARILY (session only)
    sessionStorage.setItem("signup_email", form.email);
    sessionStorage.setItem("signup_username", form.username);
    sessionStorage.setItem("signup_password", form.password);

    navigate("/verify-otp");
  } catch (err) {
    alert(err.response?.data?.error || "Signup failed");
  }
};


  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <div className="logo">✖</div>

        <h2 className="title">Sign up</h2>

        <input
          className="input"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        <input
          className="input"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          className="input"
          name="password"
          type="password"
          placeholder="Create a password"
          onChange={handleChange}
        />

        <div className="checkbox-row">
          <input
            type="checkbox"
            name="agree"
            onChange={handleChange}
          />
          <span>
            I agree to the
            <span className="purple"> LinkX User Agreement</span>
          </span>
        </div>

        <button className="signup-btn" onClick={handleSignup}>
          Sign up
        </button>

        <p className="login-text">
          Already have an account?
          <span
            className="purple"
            onClick={() => navigate("/login")}
          >
            {" "}
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
