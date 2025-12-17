import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Inbox from "./pages/Inbox";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import Chatbot from "./pages/Chatbot";
import EditProfile from "./pages/EditProfile";
import Search from "./pages/Search";


export default function App() {
  return (
    <Routes>

      {/* pages WITH bottom navbar */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/search" element={<Search />} />
        
      </Route>

      {/* pages WITHOUT bottom navbar */}
      <Route path="/chat/:clientId" element={<Chat />} />

      <Route path="/chatbot" element={<Chatbot />} />

    </Routes>
  );
}
