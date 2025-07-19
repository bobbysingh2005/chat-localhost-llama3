import { Route, Routes } from "react-router-dom";
import MainFooter from "./main-footer";
import MainHeader from "./main-header";
import ChatGenerate from "./generate";
import ChatStream from "./generate-stream";
import Home from "./Home";
import { useState } from "react";
import { useContext } from "react";
import { AppSetting } from "./App-setting";
import TextToSpeech from "./components/tts";
import SpeachToText from "./components/stt";

export default function DefaultLayout() {
  const [ready, setReady] = useState(!!localStorage.getItem("user")); // Check if user is ready
  const [user, setUser] = useState(localStorage.getItem("user") || ""); // User's name
  const { currentModel, apiUrl, isStream } = useContext(AppSetting);

  // Save the user's name to localStorage and update UI
  const save = (event) => {
    event.preventDefault();
    const value = event.target.name.value.trim();
    const newUser = value || "user";
    setUser(newUser);
    localStorage.setItem("user", newUser);
    setReady(true);
  }; //endSave

  // Check if user is ready (name provided)
  if (!ready) {
    return (
      <form onSubmit={save}>
        <label htmlFor="name">Name: </label>
        <input type="text" id="name" name="name" autoFocus />
        <button type="submit">Save</button>
      </form>
    );
  } //endIfReady

  return (
    <>
      {/* <MainHeader /> */}
      <MainHeader user={user} currentModelName={currentModel} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<ChatGenerate />} />
          <Route path="/chat" element={<ChatStream />} />

          <Route path="/tts" element={<TextToSpeech />} />
          <Route path="/stt" element={<SpeachToText />} />
        </Routes>
      </main>
      <MainFooter />
    </>
  );
}
