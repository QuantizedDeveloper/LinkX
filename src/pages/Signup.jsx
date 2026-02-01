import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const API = axios.create({
  baseURL: "https://linkx1.pythonanywhere.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // IMPORTANT
});

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
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

    try {
      const res = await API.post("/api/accounts/send-signup-otp/", {
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
      });

      console.log("OTP sent:", res.data);

      sessionStorage.setItem("email", form.email.trim());
      navigate("/verify-otp");
    } catch (err) {
      console.log("FULL ERROR:", err);

      // show full backend error if exists
      console.log("FULL ERROR:", err.response);
      alert(
        JSON.stringify(err.response?.data || err.message, null, 2)
        );

    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h2>Sign up</h2>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Create password"
          value={form.password}
          onChange={handleChange}
        />

        <label>
          <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
          I agree to LinkX terms
        </label>

        <button onClick={handleSignup}>Send OTP</button>
      </div>
    </div>
  );
};

export default Signup;
