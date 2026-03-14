import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import "./App.css";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import Inbox from "./pages/Inbox";
import Notifications from "./pages/Notifications";
import EditProfile from "./pages/EditProfile";
import Search from "./pages/Search";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtpSignup from "./pages/verify-otp";
import FaceVerification from "./pages/FaceVerification";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Chat from "./pages/Chat";
import Chatbot from "./pages/Chatbot";
import { useEffect } from "react";
import PublicProfile from "./pages/publicProfile"
export default function App() {
  useEffect(() => {
    const refresh = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return console.log("no refresh token");
      try {
        const res = await fetch("https://Linkx1.pythonanywhere.com/api/auth/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
       const data = await res.json();
       localStorage.setItem("accessToken", data.access);
       console.log("Auto refreshed token");
    } catch {
      localStorage.clear();
      console.log("Session expired");
    }
  };

  refresh(); // refresh on load
  const interval = setInterval(refresh, 1000 * 60 * 4); // every 4 minutes

  return () => clearInterval(interval);
}, []);

  return (
    <Routes>

      {/* ✅ ROUTES WITH BottomNav */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />}/>
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/public-profile/:username" element={<PublicProfile />} />
      </Route>

      {/* ✅ ROUTES WITHOUT BottomNav */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtpSignup />} />
      <Route path="/faceVerification" element={<FaceVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/*<Route path="/chat/:username"element={<Chat />} />*/}
      <Route path="/chat/:username" element={<Chat />} />
      <Route path="/chatbot" element={<Chatbot />} />
      {/*}<Route path="/" element={<Home />} />*/}
      {/*<Route path="/upload" element={<Upload />} />*/}
    </Routes>
  );
}
