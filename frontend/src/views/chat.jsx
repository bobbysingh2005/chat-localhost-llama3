import { useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { AppSetting } from "./App-setting";
import Loader from "../components/loader";

function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ inline, className, children, ...props }) {
          const text = Array.isArray(children) ? children.join("") : children;
          return inline ? (
            <code
              {...props}
              style={{
                backgroundColor: "#eee",
                padding: "2px 4px",
                borderRadius: 4,
                fontFamily: "monospace",
              }}
            >
              {text}
            </code>
          ) : (
            <pre
              {...props}
              style={{
                backgroundColor: "#f0f0f0",
                padding: 12,
                borderRadius: 6,
                overflowX: "auto",
                fontFamily: "monospace",
              }}
            >
              <code>{text}</code>
            </pre>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

const Chat = () => {
  const { currentModel, apiUrl, isStream, systemTemplate } = useContext(AppSetting);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [context, setContext] = useState([]);
  const [responseTime, setResponseTime] = useState(null);
  const [screenReaderMessage, setScreenReaderMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [wsInstance, setWsInstance] = useState(null);

  const endOfMessagesRef = useRef(null);
  const errorRef = useRef(null);
  const systemRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (systemTemplate) systemRef.current?.focus();
  }, [systemTemplate]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const formatResponseTime = (ms) => {
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)} s`;
    return `${(ms / 60000).toFixed(2)} m`;
  };

  const speak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "You", text: userMessage }]);
    setInput("");
    setLoading(true);
    setError(null);
    setResponseTime(null);
    setScreenReaderMessage("AI is thinking...");
    speak("AI is thinking...");

    const startTime = performance.now();

    try {
      const payload = {
        model: currentModel,
        prompt: userMessage,
        stream: isStream,
        context,
        system: systemTemplate,
      };

      const response = await fetch(`${apiUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      if (isStream) {
        await handleStream(response.body);
      } else {
        const json = await response.json();
        setContext(json.context || []);
        setMessages((prev) => [...prev, { sender: currentModel, text: json.response }]);
      }

      const duration = performance.now() - startTime;
      setResponseTime(formatResponseTime(duration));
      setScreenReaderMessage("AI response is ready.");
      speak("AI response is ready.");
    } catch (err) {
      setError(err.message || "Unknown error occurred.");
      setScreenReaderMessage("An error occurred.");
      speak("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleStream = async (stream) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    setMessages((prev) => [...prev, { sender: currentModel, text: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) processLine(buffer);
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (line) processLine(line);
      }
    }
  };

  const processLine = (line) => {
    try {
      const parsed = JSON.parse(line);
      const content = parsed.response || parsed.message?.content;
      if (!content) return;

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (!lastMsg || lastMsg.sender !== currentModel) return prev;

        return [...prev.slice(0, -1), { ...lastMsg, text: lastMsg.text + content }];
      });
    } catch {
      // ignore bad JSON
    }
  };

  // STT - WebSocket with Vosk
  const handleSTT = () => {
    if (isRecording) return;

    // const ws = new WebSocket("ws://voskSTT:2700");
    const ws = new WebSocket("ws://localhost:2700");

    ws.onopen = () => {
      setIsRecording(true);
      setWsInstance(ws);
      ws.send(JSON.stringify({ config: { sample_rate: 16000 } }));
    };

    ws.onmessage = (event) => {
      const result = JSON.parse(event.data);
      if (result.text) {
        const text = result.text.trim();
        if (!text) return;

        setMessages((prev) => [...prev, { sender: "You", text }]);
        speak("Processing your message...");
        setInput(text);
        setTimeout(() => handleSend({ preventDefault: () => {} }), 400);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      speak("Error with speech-to-text service.");
      setIsRecording(false);
    };

    ws.onclose = () => {
      setIsRecording(false);
      setWsInstance(null);
    };
  };

  const handleStopSTT = () => {
    if (wsInstance) {
      wsInstance.close();
      setIsRecording(false);
      setWsInstance(null);
      speak("Stopped listening.");
    }
  };

  return (
    <main className="container my-5" aria-label="Chat interface">
      <h2 tabIndex={-1}>Chat with AI</h2>

      {systemTemplate && (
        <div
          ref={systemRef}
          tabIndex={0}
          role="alert"
          aria-live="polite"
          className="alert alert-info"
          style={{ marginBottom: "1rem" }}
        >
          <strong>System role:</strong> {systemTemplate}
        </div>
      )}

      <section
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        style={{
          backgroundColor: "#f8f9fa",
          padding: 16,
          borderRadius: 8,
          maxHeight: "60vh",
          overflowY: "auto",
          marginBottom: "1rem",
        }}
      >
        {messages.length === 0 && (
          <p>No messages yet. Start by typing your message below.</p>
        )}
        {messages.map((msg, idx) => (
          <article
            key={idx}
            tabIndex={0}
            aria-label={`${msg.sender} says: ${msg.text.replace(/\s+/g, " ")}`}
            style={{
              marginBottom: 12,
              backgroundColor: msg.sender === "You" ? "#007bff" : "#e2e3e5",
              color: msg.sender === "You" ? "#fff" : "#212529",
              padding: 12,
              borderRadius: 6,
              maxWidth: "75%",
              alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
            }}
          >
            <strong>{msg.sender}:</strong>
            <MarkdownRenderer content={msg.text} />
          </article>
        ))}
        <div ref={endOfMessagesRef} />
      </section>

      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="form-control"
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Send
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        {!isRecording ? (
          <button onClick={handleSTT} className="btn btn-success">
            🎙️ Start Talking
          </button>
        ) : (
          <button onClick={handleStopSTT} className="btn btn-danger">
            🛑 Stop Talking
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-3">
          <Loader />
        </div>
      )}

      {responseTime && (
        <p className="text-muted mt-2">Response time: {responseTime}</p>
      )}

      {error && (
        <div
          className="alert alert-danger mt-2"
          role="alert"
          ref={errorRef}
          tabIndex={-1}
        >
          Error: {error}
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        {screenReaderMessage}
      </div>
    </main>
  );
};

export default Chat;
