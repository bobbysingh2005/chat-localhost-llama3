import { useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Loader from "../components/loader";
import { AppSetting } from "./App-setting";

function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ inline, className, children, ...props }) {
          return inline ? (
            <code
              className={className}
              {...props}
              style={{ backgroundColor: "#eee", padding: "2px 4px", borderRadius: "4px" }}
            >
              {children}
            </code>
          ) : (
            <pre
              className={className}
              {...props}
              style={{
                backgroundColor: "#f0f0f0",
                padding: "12px",
                borderRadius: "6px",
                overflowX: "auto",
              }}
            >
              <code>{children}</code>
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

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentContext, setContext] = useState([]);
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const [responseTime, setResponseTime] = useState(null);
  const [screenReaderMessage, setScreenReaderMessage] = useState("");

  const messagesEndRef = useRef(null);
  const systemAlertRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (systemAlertRef.current) {
      systemAlertRef.current.focus();
    }
  }, [systemTemplate]);

  useEffect(() => {
    if (errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  // Detect multi-line code blocks (``` ... ```)
  const detectMultilineCode = (text) => /```[\s\S]+?```/.test(text.trim());

  const formatResponseTime = (duration) => {
    if (duration < 1000) return `${duration.toFixed(2)} ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(2)} seconds`;
    if (duration < 3600000) return `${(duration / 60000).toFixed(2)} minutes`;
    return `${(duration / 3600000).toFixed(2)} hours`;
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => alert("Code copied to clipboard!"))
      .catch((err) => console.error("Failed to copy code: ", err));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { name: user, text: message }]);
    setMessage("");
    setLoading(true);
    apiRequest(message);
  };

  const apiRequest = async (text) => {
    const startTime = performance.now();
    try {
      setScreenReaderMessage("Wait, AI is processing...");
      speak("Wait, AI is processing...");

      const data = {
        model: currentModel,
        prompt: text,
        stream: isStream,
        context: currentContext,
        system: systemTemplate,
      };

      const response = await fetch(`${apiUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const responseData = await response.json();
      const endTime = performance.now();

      setMessages((prev) => [
        ...prev,
        { name: currentModel, text: responseData.response },
      ]);
      setContext(responseData.context);
      setResponseTime(formatResponseTime(endTime - startTime));
      setScreenReaderMessage("AI response done.");
      speak("AI response done.");
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
      setScreenReaderMessage("An error occurred.");
      speak("An error occurred.");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setContext([]);
    setError(null);
    setResponseTime(null);
    setScreenReaderMessage("New chat started.");
    speak("New chat started.");
  };

  return (
    <>
      <h2 tabIndex={-1}>Generate</h2>

      <div className="container my-5">

        {/* System Role Alert */}
        {systemTemplate && (
          <div
            className="alert alert-info"
            role="alert"
            tabIndex={0}
            ref={systemAlertRef}
            aria-live="polite"
            aria-atomic="true"
            style={{ outline: "none" }}
          >
            <strong>Role:</strong> {systemTemplate}
          </div>
        )}

        {/* New Chat Button */}
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleNewChat}
            aria-label="Start a new chat and clear conversation history"
          >
            New Chat
          </button>
        </div>

        {/* Chat Box */}
        <section
          className="chat-box bg-light p-4 rounded-3"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Chat messages"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          {messages.map((msg, idx) => {
            const showCopyBtn =
              msg.name === currentModel && detectMultilineCode(msg.text);

            return (
              <article
                key={idx}
                className={`message mb-3 p-3 rounded-3 ${
                  msg.name === user ? "bg-primary text-white ms-auto" : "bg-secondary text-dark"
                }`}
                tabIndex={0}
                aria-label={`${msg.name} says: ${msg.text.replace(/[\r\n]+/g, " ")}`}
              >
                <header className="message-header d-flex justify-content-between align-items-center">
                  <h5>{msg.name}</h5>
                  {showCopyBtn && (
                    <button
                      className="btn btn-outline-light btn-sm"
                      onClick={() => copyCode(msg.text)}
                      aria-label="Copy code block to clipboard"
                    >
                      Copy Code
                    </button>
                  )}
                </header>
                <div className="message-body">
                  <MarkdownRenderer content={msg.text} />
                </div>
              </article>
            );
          })}
          <div ref={messagesEndRef} />
        </section>

        {/* Loading Indicator */}
        {loading && (
          <Loader
            aria-live="assertive"
            aria-label="Loading AI response"
            role="status"
          />
        )}

        {/* Response Time */}
        {responseTime && (
          <div
            className="response-time text-center mt-2"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="text-muted small">Response Time: {responseTime}</span>
          </div>
        )}

        {/* Screen Reader Notification */}
        {screenReaderMessage && (
          <div
            className="sr-message visually-hidden"
            aria-live="assertive"
            role="alert"
          >
            {screenReaderMessage}
          </div>
        )}

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="w-100 d-flex mt-3" aria-label="Send a message">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            autoFocus
            className="form-control me-2"
            aria-label="Type your message here"
            required
          />
          <button type="submit" className="btn btn-primary" aria-label="Send message">
            Send
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div
            className="alert alert-danger mt-3"
            role="alert"
            tabIndex={-1}
            ref={errorRef}
          >
            <pre>{error}</pre>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
