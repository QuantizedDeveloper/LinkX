import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

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

export default function App() {
  return (
    <Routes>

      {/* ✅ ROUTES WITH BottomNav */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/search" element={<Search />} />
      </Route>

      {/* ✅ ROUTES WITHOUT BottomNav */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtpSignup />} />
      <Route path="/faceVerification" element={<FaceVerification />} />
      <Route path="/resetpassword" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/chat/:clientId" element={<Chat />} />
      <Route path="/chatbot" element={<Chatbot />} />

    </Routes>
  );
}
