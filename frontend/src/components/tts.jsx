import React, { useState, useEffect } from "react";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const populateVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        setVoices(allVoices);
        setSelectedVoice(allVoices[0]);
      }
    };

    // Attach listener and call once in case voices are already available
    speechSynthesis.addEventListener("voiceschanged", populateVoices);
    populateVoices();

    // Cleanup listener on unmount
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", populateVoices);
    };
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSpeak = () => {
    if (!text || !selectedVoice) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <h1>Text to Speech</h1>
      <textarea
        value={text}
        onChange={handleTextChange}
        rows="5"
        cols="30"
        placeholder="Type something..."
      />
      <br />
      <label>
        Select Voice:
        <select
          value={selectedVoice?.name || ""}
          onChange={(e) => {
            const voice = voices.find((v) => v.name === e.target.value);
            setSelectedVoice(voice);
          }}
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Rate:
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
        />
        {rate}
      </label>
      <br />
      <button onClick={handleSpeak} disabled={!selectedVoice || !text}>
        Speak
      </button>
    </div>
  );
};

export default TextToSpeech;
