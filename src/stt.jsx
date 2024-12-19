import React, { useState } from "react";

const Stt = () => {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);

  const startListening = (e) => {
    e.preventDefault();
    if (!listening) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        alert(SpeechRecognition);
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;
        alert("start");
        recognition.onresult = (event) => {
          let fullTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript + " ";
          }
          //   setText(event.results[0][0].transcript);
          setText(fullTranscript);
        };
        recognition.start();
        setListening(true);
      });
    }
  };

  return (
    <div>
      <h1>Speech to Text</h1>
      <button onClick={startListening}>Start Listening</button>
      {listening && <p>Listening...</p>}
      <p>Transcript: {text}</p>
    </div>
  );
};

export default Stt;
