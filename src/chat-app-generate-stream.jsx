import { useContext, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Loader from "./components/loader";
import MainHeader from "./main-header";
import MainFooter from "./main-footer";
import { AppSetting } from "./App-setting";
import './assets/style.css';

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const [ready, setReady] = useState(!!localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentModel } = useContext(AppSetting);
  const [currentContext, setContext] = useState([]);

  // Detects if the text contains code blocks
  const detectCode = (text) => {
    return /```[\s\S]+?```/.test(text.trim());
  };

  // API call to local model with stream reading
  const apiRequest = async (text) => {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: currentModel,
          prompt: text,
          stream: true,
          context: currentContext,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        done = streamDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          let boundary = buffer.indexOf("\n");

          while (boundary !== -1) {
            const chunk = buffer.slice(0, boundary).trim();

            if (chunk) {
              try {
                const parsedChunk = JSON.parse(chunk);

                setMessages((prevMessages) => {
                  const lastMessage = prevMessages[prevMessages.length - 1];
                  const combinedText = lastMessage?.text
                    ? lastMessage.text + ` ${parsedChunk.response}`
                    : parsedChunk.response;

                  const isCode = detectCode(combinedText);

                  if (lastMessage && lastMessage.name === "AI") {
                    const updatedMessage = {
                      ...lastMessage,
                      text: combinedText,
                      isCode,
                    };
                    return [...prevMessages.slice(0, -1), updatedMessage];
                  }

                  return [
                    ...prevMessages,
                    {
                      name: "AI",
                      text: parsedChunk.response.trim(),
                      isCode: detectCode(parsedChunk.response),
                    },
                  ];
                });

                if (parsedChunk.done && parsedChunk.context) {
                  setContext(parsedChunk.context);
                }
              } catch (e) {
                console.error("Parsing error:", e);
              }
            }

            buffer = buffer.slice(boundary + 1);
            boundary = buffer.indexOf("\n");
          }
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle message submission
  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (message.trim() === "") return;

    setMessages((prev) => [...prev, { name: user, text: message }]);
    setMessage("");
    setLoading(true);

    await apiRequest(message);
  };

  // Save the user's name and mark them as ready
  const save = (event) => {
    event.preventDefault();
    const value = event.target.name.value.trim();
    const newUser = value || "user";
    setUser(newUser);
    localStorage.setItem("user", newUser);
    setReady(true);
  };

  // Copy code to clipboard
  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => alert("Code copied to clipboard!"))
      .catch((err) => console.error("Failed to copy code: ", err));
  };

  // Speak out the last message
  const speak = (text) => {
    const messageToSpeak = text || messages[messages.length - 1]?.text;
    if (!messageToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(messageToSpeak);
    window.speechSynthesis.speak(utterance);
  };

  // Ask for user's name first
  if (!ready) {
    return (
      <form onSubmit={save}>
        <label htmlFor="name">Name: </label>
        <input type="text" id="name" name="name" autoFocus />
        <button type="submit">Save</button>
      </form>
    );
  }

  return (
    <>
      <MainHeader user={user} currentModelName={currentModel} />

      <main className="container my-5">
        <div className="chat-box bg-light p-4 rounded-3" role="log" aria-label="Chat messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message mb-3 p-3 rounded-3 ${msg.name === user
                ? "bg-primary text-white ms-auto"
                : "bg-secondary text-dark"
              }`}
            >
              <div className="message-header d-flex justify-content-between align-items-center">
                <h5>{msg.name}</h5>
              </div>
              <div className="message-body">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const code = Array.isArray(children)
                        ? children.join("").replace(/\s+$/, "")
                        : String(children).replace(/\s+$/, "");

                      return !inline ? (
                        <div className="position-relative">
                          <pre className={className}>
                            <code {...props}>{code}</code>
                          </pre>
                          <button
                            onClick={() => copyCode(code)}
                            className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2"
                            style={{ zIndex: 1 }}
                          >
                            Copy
                          </button>
                        </div>
                      ) : (
                        <code className={className} {...props}>{code}</code>
                      );
                    }
                  }}
                >
                  {msg.text}
                </Markdown>
              </div>
            </div>
          ))}
        </div>

        {loading && <Loader />}

        <div className="message-input d-flex align-items-center mt-4">
          <form onSubmit={handleSendMessage} className="w-100 d-flex">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type a message..."
              className="form-control me-2"
              rows={2}
              aria-label="Type a message"
            />
            <button type="submit" className="btn btn-primary">Send</button>
            <button
              type="button"
              className="btn btn-info ms-2"
              onClick={() => speak()}
              aria-label="Speak last message"
              disabled={loading}
            >
              Speak
            </button>
          </form>
        </div>
      </main>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <pre>{error}</pre>
        </div>
      )}

      <MainFooter />
    </>
  );
};

export default Chat;
