import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import GoogleLogin from "./pages/GoogleLogin";
import Username from "./pages/Username"
import "./App.css";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import Inbox from "./pages/Inbox";
import Notifications from "./pages/Notifications";
import EditProfile from "./pages/EditProfile";
import Search from "./pages/Search";
//import Login from "./pages/Login";
//import Signup from "./pages/Signup";
//import VerifyOtpSignup from "./pages/verify-otp";
import FaceVerification from "./pages/FaceVerification";
//import ResetPassword from "./pages/ResetPassword";
//import ForgotPassword from "./pages/ForgotPassword";
import Chat from "./pages/Chat";
import Chatbot from "./pages/Chatbot";
import { useEffect } from "react";
import PublicProfile from "./pages/publicProfile"
import TermsAndConditions from "./pages/TermsAndConditions"
import FreelancerAgreement from "./pages/FreelancerAgreement"
import FaceVerificationInfo from "./pages/FaceVerificationAgreement"
import ActivityTracker from "./ActivityTracker"
import HiredGuide from "./pages/HiredGuide";
import HiringGuide from "./pages/HiringGuide";
import { enablePushNotifications } from "./utils/push";
const URL_BASE = "https://linkx-backend-api-linkx-backend.hf.space";

export default function App() {
  useEffect(() => {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker.register(
  process.env.PUBLIC_URL + "/service-worker.js")
  .then(async () => {
      await enablePushNotifications();
    })
    .catch((err) => {
      console.error(err);
    });
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
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/face-verificationAgreement" element={<FaceVerificationInfo />} />
       <Route path="/freelancer-agreement" element={<FreelancerAgreement />} />
      <Route path="/login" element={<GoogleLogin />} />
      <Route path="/faceVerification" element={<FaceVerification />} />
      <Route path="/hiring-guide" element={<HiringGuide />} />
      <Route path="/hired-guide" element={<HiredGuide />} />
      <Route path="/chat/:username" element={<Chat />} />
      <Route path="/chatbot" element={<Chatbot />} />
       <Route
          path="/username"
          element={
              <Username />}
        />
    </Routes>
  );
}
