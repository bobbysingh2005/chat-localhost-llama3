import React, { useState } from "react";

/**
 * TTSButton: Text-to-Speech button for chat messages
 * Props:
 *   text: string (text to speak)
 *   disabled: boolean
 */
const TTSButton = ({ text, disabled }) => {
  const [speaking, setSpeaking] = useState(false);

  const bellSound = typeof window !== 'undefined' ? new window.Audio('/sounds/bell-1.mp3') : null;
  const handleSpeak = () => {
    // Play bell sound for TTS activation
    try { if (bellSound) { bellSound.currentTime = 0; bellSound.play(); } } catch {}
    if (!text) return;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      alert('Text-to-Speech is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }
    setSpeaking(true);
    try {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setSpeaking(false);
      alert('Text-to-Speech failed to start. Please check your browser settings.');
    }
  };

  return (
    <button
      type="button"
      aria-label="Listen to AI response"
      onClick={handleSpeak}
      disabled={disabled || !text}
      style={{ marginTop: 8, marginBottom: 8, background: '#e6f0ff', color: '#4f8cff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}
    >
      {speaking ? "🔊 Playing..." : "🔊 Listen"}
    </button>
  );
};

export default TTSButton;
