import React, { useState, useRef } from "react";

/**
 * STTButton: Speech-to-Text button for chat input
 * Props:
 *   onResult: function(text) => void (called with recognized text)
 *   disabled: boolean
 */
const bellSound =
  typeof window !== "undefined" ? new window.Audio("/sounds/bell-1.mp3") : null;
const STTButton = ({ onResult, disabled }) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    // Play bell sound for STT activation
    try {
      if (bellSound) {
        bellSound.currentTime = 0;
        bellSound.play();
      }
    } catch {}
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.",
      );
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
        setListening(false);
      };
      recognition.onerror = (e) => {
        setListening(false);
        if (e.error === "not-allowed") {
          alert(
            "Microphone access denied. Please allow microphone permissions.",
          );
        }
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    } catch (err) {
      setListening(false);
      alert(
        "Speech Recognition failed to start. Please check your browser settings.",
      );
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={listening ? "Stop listening" : "Speak to AI"}
      onClick={listening ? stopListening : startListening}
      disabled={disabled}
      style={{ marginRight: 8 }}
    >
      {listening ? "🛑 Stop" : "🎤 Speak"}
    </button>
  );
};

export default STTButton;
