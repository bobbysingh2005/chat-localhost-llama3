import { useContext, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown support
import Loader from "./components/loader";
import { AppSetting } from "./App-setting";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight"; // For syntax highlighting
import _debounce from "lodash/debounce"; // Import lodash debounce

function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
      {content}
    </ReactMarkdown>
  );
}

const Chat = () => {
  const [message, setMessage] = useState(""); // Current message input value
  const [messages, setMessages] = useState([]); // History of messages sent
  const [loading, setLoading] = useState(false); // Loading state while waiting for response
  const [error, setError] = useState(null); // Error state for handling errors
  const [currentContext, setContext] = useState([]); // Context for the chat conversation
  const { currentModel, apiUrl, isStream } = useContext(AppSetting);
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const [ready, setReady] = useState(!!localStorage.getItem("user"));
  const [responseTime, setResponseTime] = useState(null); // Track response time
  const [screenReaderMessage, setScreenReaderMessage] = useState(""); // For screen reader notifications

  // Detects if the text contains code (both inline and multi-line)
  const detectCode = (text) => {
    return /```[\s\S]+?```|`[^`]+`/.test(text.trim());
  };

  // Function to format response time into readable format
  const formatResponseTime = (duration) => {
    let formattedTime = "";

    if (duration < 1000) {
      formattedTime = `${duration.toFixed(2)} ms`; // Less than 1 second
    } else if (duration >= 1000 && duration < 60000) {
      formattedTime = `${(duration / 1000).toFixed(2)} seconds`; // Between 1 and 60 seconds
    } else if (duration >= 60000 && duration < 3600000) {
      formattedTime = `${(duration / 60000).toFixed(2)} minutes`; // Between 1 and 60 minutes
    } else {
      formattedTime = `${(duration / 3600000).toFixed(2)} hours`; // More than 60 minutes
    }

    return formattedTime;
  };

  // Handle sending a message and starting an API request
  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (message.trim() === "") return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { name: user, text: message },
    ]);
    setMessage("");
    setLoading(true);
    apiRequest(message); // Trigger the API request
  };

  // API request function to interact with Ollama API
  const apiRequest = async (text) => {
    const startTime = performance.now(); // Start time for response time calculation

    try {
      // Notify screen reader user that AI is processing
      setScreenReaderMessage("Wait, AI is processing...");
      speak("Wait, AI is processing...");

      const data = {
        model: currentModel,
        prompt: text,
        stream: isStream,
        context: currentContext,
      };

      const response = await fetch(`${apiUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      const endTime = performance.now(); // End time for response time calculation
      const responseDuration = (endTime - startTime); // Calculate response duration

      const formattedResponseTime = formatResponseTime(responseDuration); // Format the response time

      // Update messages with the AI response
      setMessages((prevMessages) => [
        ...prevMessages,
        { name: currentModel, text: responseData.response },
      ]);
      setContext(responseData.context);
      setResponseTime(formattedResponseTime); // Set formatted response time

      // Notify screen reader user that AI has responded
      setScreenReaderMessage("AI response done.");
      speak("AI response done.");

      setLoading(false); // Stop loading
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false); // Stop loading in case of error

      // Notify screen reader user of error
      setScreenReaderMessage("An error occurred.");
      speak("An error occurred.");
    }
  };

  // Function to speak messages via screen reader
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Copy the code to clipboard
  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => alert("Code copied to clipboard!"))
      .catch((err) => console.error("Failed to copy code: ", err));
  };

  return (
    <>
      <h2>Generate</h2>
      <div className="container my-5">
        {/* Chat box for messages */}
        <div className="chat-box bg-light p-4 rounded-3" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg, index) => {
            const isCode = detectCode(msg.text); // Detect if message contains code
            return (
              <div
                key={index}
                className={`message mb-3 p-3 rounded-3 ${msg.name === user ? "bg-primary text-white ms-auto" : "bg-secondary text-dark"}`}
              >
                <div className="message-header d-flex justify-content-between align-items-center">
                  <h5>{msg.name}</h5>
                  {/* Show "Copy Code" button if it's a code block */}
                  {isCode && (
                    <button
                      className="btn btn-outline-light btn-sm"
                      onClick={() => copyCode(msg.text)} // Copy button will copy the code block
                      aria-label="Copy code to clipboard"
                    >
                      Copy Code
                    </button>
                  )}
                </div>
                <div className="message-body">
                  <MarkdownRenderer content={msg.text} /> {/* Render Markdown */}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show loader when waiting for AI response */}
        {loading && <Loader />}

        {/* Display API response time */}
        {responseTime && (
          <div className="response-time text-center mt-2">
            <span className="text-muted small">Response Time: {responseTime}</span>
          </div>
        )}

        {/* Screen reader notification */}
        {screenReaderMessage && (
          <div className="sr-message" aria-live="assertive">
            {screenReaderMessage}
          </div>
        )}

        {/* Message input and send button */}
        <div className="message-input d-flex align-items-center">
          <form onSubmit={handleSendMessage} className="w-100 d-flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              autoFocus
              className="form-control me-2"
              aria-label="Type a message"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Display error message if any */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <pre>{error}</pre>
        </div>
      )}
    </>
  );
};

export default Chat;
