import { Route, Routes, useNavigate } from "react-router-dom";
import { useContext } from "react";

import MainFooter from "./main-footer";
import MainHeader from "./main-header";
import ChatApp from "./chat-app";
import Home from "./Home";
import TextToSpeech from "../components/tts";
import SpeachToText from "../components/stt";
import ApiHealthChecker from "../components/app-status";
import AuthForm from "./auth";
import Conversations from "./conversations";
import { AppSetting } from "./App-setting";
import { useState } from "react";
import LoginModal from "../components/LoginModal";

function DefaultLayout() {
  const { user, currentModel, setUser } = useContext(AppSetting);

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(
    !user || Object.keys(user || {}).length === 0,
  );

  const handleGuest = () => {
    setUser({ guest: true, username: "Guest" });
    try {
      localStorage.setItem(
        "user",
        JSON.stringify({ guest: true, username: "Guest" }),
      );
    } catch (e) {}
    setShowModal(false);
    navigate("/chat");
  };

  const openLogin = () => {
    // show inline auth form by navigating to / or showing AuthForm area.
    setShowModal(false);
    navigate("/auth");
  };

  const openRegister = () => {
    setShowModal(false);
    navigate("/auth");
  };

  return (
    <>
      <LoginModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onGuest={handleGuest}
        onOpenLogin={() => {
          setShowModal(false);
          navigate("/auth");
        }}
        onOpenRegister={() => {
          setShowModal(false);
          navigate("/auth");
        }}
      />
      <MainHeader currentModelName={currentModel} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatApp />} />
          <Route path="/generate" element={<ChatApp />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/tts" element={<TextToSpeech />} />
          <Route path="/stt" element={<SpeachToText />} />
          <Route path="/auth" element={<AuthForm />} />
        </Routes>
      </main>

      <MainFooter />
      <ApiHealthChecker />
    </>
  );
}

export default DefaultLayout;
