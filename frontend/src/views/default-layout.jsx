import { Route, Routes } from "react-router-dom";
import { useContext } from "react";

import MainFooter from "./main-footer";
import MainHeader from "./main-header";
import Generate from "./generate";
import Chat from "./chat";
import Home from "./Home";
import TextToSpeech from "../components/tts";
import SpeachToText from "../components/stt";
import ApiHealthChecker from "../components/app-status";
import AuthForm from "./auth";
import { AppSetting } from "./App-setting";

function DefaultLayout() {
  const { user, currentModel } = useContext(AppSetting);

  // ✅ If not authenticated, show login form
  if (!user?._id) {
    return <AuthForm />;
  }

  return (
    <>
      <MainHeader currentModelName={currentModel} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/tts" element={<TextToSpeech />} />
          <Route path="/stt" element={<SpeachToText />} />
        </Routes>
      </main>

      <MainFooter />
      <ApiHealthChecker />
    </>
  );
}

export default DefaultLayout;
