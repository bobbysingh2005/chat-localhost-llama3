// Sound feedback for user and AI
const bellSound =
  typeof window !== "undefined" ? new window.Audio("/sounds/chimes-2.mp3") : null;

// =============================
// TODO: FUTURE PRODUCTION UPGRADE
// - For production, consider using server-based STT/TTS for consistent, high-quality voice features.
// - Add REST endpoints in backend: /api/stt and /api/tts
// - Add Docker services for TTS (e.g., coqui-ai/tts, mozilla-tts) and STT (e.g., whisper, kaldi, deepgram)
// - Modularize frontend to allow switching between browser and server STT/TTS
// - Add a toggle in UI for "Browser" vs "Server" voice mode
// =============================
import { useContext, useEffect, useRef, useState } from "react";
// --- Inline STT/TTS for full voice mode loop ---
// (No longer using STTButton/TTSButton for main loop)
import MonacoEditorWrapper from "../components/MonacoEditorWrapper";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Loader from "../components/loader";
import { AppSetting } from "./App-setting";

import STTButton from "../components/STTButton";

function CopyableCodeBlock({ children, className = "", ...props }) {
  const text = Array.isArray(children) ? children.join("") : children;
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [ariaMsg, setAriaMsg] = useState("");
  let lang = "";
  if (className && className.startsWith("language-")) {
    lang = className.replace("language-", "");
  }
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f5f7fa",
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          border: "1px solid #e0e0e0",
          borderBottom: "none",
          padding: "0.3rem 0.8rem",
          fontSize: "0.97rem",
          fontFamily: "monospace",
          color: "#4f8cff",
        }}
      >
        <span style={{ fontWeight: 600 }}>{lang || "code"}</span>
        <span>
          <button
            type="button"
            aria-label="Copy code"
            style={{
              background: isCopied ? "#4f8cff" : "#fff",
              color: isCopied ? "#fff" : "#4f8cff",
              border: "1px solid #4f8cff",
              borderRadius: 6,
              padding: "2px 10px",
              fontSize: "0.95rem",
              cursor: "pointer",
              marginRight: 8,
              transition: "all 0.2s",
            }}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 1200);
                if (setScreenReaderMessage)
                  setScreenReaderMessage("Code copied to clipboard");
              } catch {}
            }}
          >
            {isCopied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            aria-label="Edit code"
            style={{
              background: isEditing ? "#4f8cff" : "#fff",
              color: isEditing ? "#fff" : "#4f8cff",
              border: "1px solid #4f8cff",
              borderRadius: 6,
              padding: "2px 10px",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => {
              setIsEditing(true);
              if (setScreenReaderMessage)
                setScreenReaderMessage("Code editor opened");
            }}
            disabled={isEditing}
          >
            Edit
          </button>
        </span>
      </div>
      {isEditing ? (
        <MonacoEditorWrapper
          value={editValue}
          language={lang}
          onChange={(v) => setEditValue(v)}
          onCancel={() => setIsEditing(false)}
          onSave={() => {
            setIsEditing(false);
          }}
        />
      ) : (
        <pre
          {...props}
          style={{
            backgroundColor: "#f0f0f0",
            padding: 12,
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
            border: "1px solid #e0e0e0",
            borderTop: "none",
            overflowX: "auto",
            fontFamily: "monospace",
            margin: 0,
          }}
        >
          <code>{text}</code>
        </pre>
      )}
    </div>
  );
}

// Helper: Render a file/code block with filename heading
function FileCodeBlock({ filename, code, language }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {filename && (
        <div
          style={{
            background: "#f5f7fa",
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
            border: "1px solid #e0e0e0",
            borderBottom: "none",
            padding: "0.3rem 0.8rem",
            fontSize: "0.97rem",
            fontFamily: "monospace",
            color: "#4f8cff",
            fontWeight: 600,
          }}
        >
          {filename}
        </div>
      )}
      <CopyableCodeBlock className={language ? `language-${language}` : ""}>
        {code}
      </CopyableCodeBlock>
    </div>
  );
}

// Recursively render any AI response as readable blocks (code, files, markdown, text)
// Improved MarkdownRenderer: adds line breaks and restores copy/edit for all code blocks
function MarkdownRenderer({ content }) {
  function renderAny(val, keyPrefix = "", isTopLevel = true) {
    if (typeof val === "string") {
      // Split summary/explanation from code blocks for clarity
      const parts = val.split(/(```[\s\S]*?```)/g);
      return (
        <div key={keyPrefix}>
          {parts.map((part, idx) => {
            if (part.startsWith("```")) {
              // Extract language and code
              const match = part.match(/^```(\w+)?\n([\s\S]*?)```$/);
              const lang = match ? match[1] || "" : "";
              const code = match ? match[2] : part.replace(/^```|```$/g, "");
              return (
                <div key={idx} style={{ margin: "16px 0" }}>
                  <CopyableCodeBlock className={lang ? `language-${lang}` : ""}>
                    {code}
                  </CopyableCodeBlock>
                </div>
              );
            } else if (part.trim()) {
              // Summary/explanation: add margin below
              return (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {part}
                  </ReactMarkdown>
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
      );
    }
    if (Array.isArray(val)) {
      return val.map((item, idx) =>
        renderAny(item, keyPrefix + "-" + idx, false),
      );
    }
    if (val && typeof val === "object") {
      // If object looks like a file/code block
      const filename = val.filename || val.name || val.file || "";
      const code = val.code || val.content || val.text || "";
      const language = val.language || val.lang || "";
      if (filename && code) {
        return (
          <div key={keyPrefix + filename} style={{ margin: "16px 0" }}>
            <FileCodeBlock
              filename={filename}
              code={code}
              language={language}
            />
          </div>
        );
      }
      // If object has multiple keys, render each
      return Object.entries(val).map(([k, v], idx) => (
        <div key={keyPrefix + "-" + k}>
          {filename || language ? null : <strong>{k}:</strong>}
          {renderAny(v, keyPrefix + "-" + k, false)}
        </div>
      ));
    }
    return null;
  }
  return <>{renderAny(content)}</>;
}

const ChatApp = () => {
  // --- Voice Mode ---
  // Now: Full browser-based voice mode loop (auto listen, send, TTS, repeat)
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  // Helper: Start browser STT and auto-send to AI
  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setScreenReaderMessage(
        "Speech Recognition is not supported in this browser.",
      );
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
        setInput("");
        setListening(false);
        setScreenReaderMessage("You said: " + transcript);
        // Auto-send to AI
        handleSend(transcript);
      };
      recognition.onerror = (e) => {
        setListening(false);
        setScreenReaderMessage("Speech recognition error");
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
      setScreenReaderMessage("Speech Recognition failed to start.");
    }
  };

  // Helper: Speak text using browser TTS
  const speakText = (text, onEnd) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setScreenReaderMessage(
        "Text-to-Speech is not supported in this browser.",
      );
      alert(
        "Text-to-Speech is not supported in this browser. Please use Google Chrome or Microsoft Edge.",
      );
      if (onEnd) onEnd();
      return;
    }
    try {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (onEnd) onEnd();
    }
  };
  const {
    currentModel,
    apiUrl,
    isStream,
    systemTemplate,
    user: contextUser,
  } = useContext(AppSetting);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [context, setContext] = useState([]);
  const [responseTime, setResponseTime] = useState(null);
  const [screenReaderMessage, setScreenReaderMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [convLoading, setConvLoading] = useState(false);
  const liveRegionRef = useRef(null);
  const lastAssistantMsgRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const errorRef = useRef(null);
  const systemRef = useRef(null);
  const [user, setUser] = useState(
    contextUser || localStorage.getItem("user") || "",
  );
  // Fetch conversation list on mount (if logged in)
  useEffect(() => {
    if (!user || !user._id) return;
    fetchConversations();
  }, [user]);

  // Fetch conversations
  const fetchConversations = async () => {
    setConvLoading(true);
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/conversations`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json?.success) setConversations(json.conversations || []);
    } catch {}
    setConvLoading(false);
  };

  // Load a conversation by id
  const loadConversation = async (id) => {
    setLoading(true);
    setCurrentConvId(id);
    try {
      const res = await fetch(
        `${apiUrl.replace(/\/$/, "")}/conversations/${id}`,
        { credentials: "include" },
      );
      const json = await res.json();
      if (json?.success) {
        setMessages(
          json.conversation.messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        );
      }
    } catch {}
    setLoading(false);
  };

  // Start a new conversation
  const handleNewChat = async () => {
    setInput("");
    setMessages([]);
    setCurrentConvId(null);
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    // Announce new assistant message for screen readers
    if (
      messages.length > 0 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      setScreenReaderMessage(
        "Assistant: " +
          messages[messages.length - 1].content
            .replace(/\s+/g, " ")
            .slice(0, 200),
      );
      // Announce response is ready
      setTimeout(() => setScreenReaderMessage("AI response is ready."), 500);
      // Focus the last assistant message
      lastAssistantMsgRef.current?.focus();
    }
  }, [messages]);

  useEffect(() => {
    if (systemRef.current) {
      systemRef.current.focus();
    }
  }, [systemTemplate]);

  // Announce loading and response time for screen readers
  useEffect(() => {
    if (loading) {
      setScreenReaderMessage("Loading response...");
    }
  }, [loading]);
  useEffect(() => {
    if (responseTime) {
      setScreenReaderMessage(`Response time: ${responseTime} milliseconds`);
    }
  }, [responseTime]);

  useEffect(() => {
    if (errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  // Overload handleSend: accepts optional text (for voice mode), else uses input
  const handleSend = async (textOverride) => {
    const textToSend = typeof textOverride === "string" ? textOverride : input;
    // Play bell sound for user action (processing)
    try {
      if (bellSound) {
        bellSound.currentTime = 0;
        bellSound.play();
      }
    } catch {}
    if (!textToSend.trim()) return;
    setLoading(true);
    setError(null);
    const start = Date.now();
    const newMessage = { role: "user", content: textToSend };
    let updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    try {
      // Always use the correct endpoint for backend
      const endpoint = apiUrl
        ? apiUrl.replace(/\/$/, "") + "/api/generate"
        : "/api/generate";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: currentModel,
          prompt: textToSend,
          stream: !!isStream,
          context,
        }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      let result = "";
      if (isStream) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = "";
        while (!done) {
          const { done: streamDone, value } = await reader.read();
          done = streamDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
          }
        }
        // Try to parse as JSON if possible
        try {
          const parsed = JSON.parse(buffer);
          result = parsed.response || buffer;
        } catch {
          result = buffer;
        }
      } else {
        // Try to parse as JSON if possible
        const text = await response.text();
        try {
          const parsed = JSON.parse(text);
          result = parsed.response || text;
        } catch {
          result = text;
        }
      }
      // Recursively extract all string content from result
      function extractStrings(val) {
        if (typeof val === "string") return val;
        if (Array.isArray(val)) return val.map(extractStrings).join("\n");
        if (val && typeof val === "object") {
          // Prefer 'text', 'content', or join all string values
          if (val.text) return extractStrings(val.text);
          if (val.content) return extractStrings(val.content);
          return Object.values(val).map(extractStrings).join("\n");
        }
        return "";
      }
      const aiContent = extractStrings(result);
      updatedMessages = [
        ...updatedMessages,
        { role: "assistant", content: aiContent },
      ];
      setMessages(updatedMessages);
      setResponseTime(Date.now() - start);
      // Play bell sound for AI response
      try {
        if (bellSound) {
          bellSound.currentTime = 0;
          bellSound.play();
        }
      } catch {}

      // Speak AI response if in voice mode
      if (voiceMode && aiContent) {
        speakText(aiContent, () => {
          // After TTS, auto-listen again
          if (voiceMode) startVoiceRecognition();
        });
      }

      // Save or update conversation in backend
      if (user && user._id) {
        if (!currentConvId) {
          // Create new conversation
          const convRes = await fetch(
            `${apiUrl.replace(/\/$/, "")}/conversations`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                title: updatedMessages[0]?.content?.slice(0, 30) || "New chat",
                messages: updatedMessages.map((m) => ({
                  sender: m.role === "user" ? "user" : "assistant",
                  text: m.content,
                })),
              }),
            },
          );
          const convJson = await convRes.json();
          if (convJson?.success) {
            setCurrentConvId(convJson.conversation._id);
            fetchConversations();
          }
        } else {
          // Update existing conversation
          await fetch(
            `${apiUrl.replace(/\/$/, "")}/conversations/${currentConvId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                messages: updatedMessages.map((m) => ({
                  sender: m.role === "user" ? "user" : "assistant",
                  text: m.content,
                })),
              }),
            },
          );
          fetchConversations();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start/stop voice mode effect
  useEffect(() => {
    if (voiceMode) {
      // Start listening automatically
      startVoiceRecognition();
    } else {
      // Stop any ongoing recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMode]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Sidebar for conversation history */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 0,
          transition: "width 0.2s",
          background: "#f4f6fa",
          borderRight: "1px solid #e0e0e0",
          overflow: "auto",
          minHeight: "100%",
        }}
      >
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Conversations
          </span>
          <button
            onClick={handleNewChat}
            style={{
              background: "#4f8cff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.3rem 0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + New Chat
          </button>
        </div>
        {convLoading ? <div style={{ padding: "1rem" }}>Loading...</div> : null}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {conversations.map((conv) => (
            <li
              key={conv._id}
              style={{
                borderBottom: "1px solid #e0e0e0",
                background:
                  conv._id === currentConvId ? "#e6f0ff" : "transparent",
              }}
            >
              <button
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "0.8rem 1rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: conv._id === currentConvId ? 700 : 400,
                }}
                onClick={() => loadConversation(conv._id)}
                aria-current={conv._id === currentConvId ? "true" : undefined}
              >
                {conv.title || "Untitled"}
                <div
                  style={{ fontSize: "0.85rem", color: "#888", marginTop: 2 }}
                >
                  {new Date(conv.updatedAt).toLocaleString()}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {/* Main chat area */}
      <div className="chat-app-container" style={{ flex: 1, minWidth: 0 }}>
        {/* Screen reader live region for new messages, errors, loading, and response time */}
        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: "absolute",
            left: "-9999px",
            height: 1,
            width: 1,
            overflow: "hidden",
          }}
        >
          {screenReaderMessage}
        </div>
        <div className="messages-list">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message message-${msg.role}`}
              tabIndex={msg.role === "assistant" ? 0 : -1}
              ref={
                msg.role === "assistant" && idx === messages.length - 1
                  ? lastAssistantMsgRef
                  : null
              }
              aria-label={
                msg.role === "assistant"
                  ? `Assistant: ${msg.content.replace(/\s+/g, " ").slice(0, 200)}`
                  : undefined
              }
            >
              {msg.role === "user" ? (
                <h5
                  className="message-heading"
                  style={{ fontSize: "1.05rem", margin: 0, fontWeight: 700 }}
                >
                  You
                </h5>
              ) : (
                <h6
                  className="message-heading"
                  style={{ fontSize: "1.02rem", margin: 0, fontWeight: 700 }}
                >
                  AI
                </h6>
              )}
              <div className="message-content">
                <MarkdownRenderer content={msg.content} />
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            className="error-message"
            aria-live="assertive"
            aria-atomic="true"
          >
            {error}
          </div>
        )}
        <form
          className="input-area"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          role="search"
          aria-label="Chat input area"
        >
          <label htmlFor="chat-input" className="visually-hidden">
            Type your message
          </label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            aria-label="Type your message"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          {/* Voice mode: show status and manual STT only if not in voice mode */}
          {!voiceMode && (
            <STTButton onResult={(text) => setInput(text)} disabled={loading} />
          )}
          {voiceMode && (
            <span
              style={{
                marginRight: 8,
                fontWeight: 600,
                color: listening ? "#4f8cff" : "#888",
              }}
            >
              {listening ? "🎤 Listening..." : "🛑 Paused"}
            </span>
          )}
          <button
            type="button"
            aria-label={voiceMode ? "Disable voice mode" : "Enable voice mode"}
            style={{
              marginRight: 8,
              background: voiceMode ? "#4f8cff" : "#fff",
              color: voiceMode ? "#fff" : "#4f8cff",
              border: "1px solid #4f8cff",
              borderRadius: 6,
              padding: "2px 10px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => setVoiceMode((v) => !v)}
          >
            {voiceMode ? "🔊 Voice On" : "🔇 Voice Off"}
          </button>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            Send
          </button>
          {/* Removed misplaced TTSButton. It is rendered per message below. */}
        </form>
        {loading && <Loader />}
        {responseTime && (
          <div className="response-time">Response time: {responseTime} ms</div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
