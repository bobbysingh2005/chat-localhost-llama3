import { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown support

import Loader from "./components/loader";
import MainHeader from "./main-header";
import MainFooter from "./main-footer";
import { AppSetting } from "./App-setting";

import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown
import rehypeHighlight from "rehype-highlight"; // For syntax highlighting
// import "highlight.js/styles/github.css"; // Optional: CSS for code highlighting

function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
    >
      {content}
    </ReactMarkdown>
  );
} //end

const Chat = () => {
  const [message, setMessage] = useState(""); // Current message input value
  const [messages, setMessages] = useState([]); // History of messages sent
  const [user, setUser] = useState(localStorage.getItem("user") || ""); // User's name
  const [ready, setReady] = useState(!!localStorage.getItem("user")); // Check if user is ready
  const [loading, setLoading] = useState(false); // Loading state while waiting for response
  const [error, setError] = useState(null); // Error state for handling errors
  const [currentContext, setContext] = useState([]); // Context for the chat conversation
  const { currentModel, apiUrl, isStream } = useContext(AppSetting);

  // A custom renderer to apply syntax highlighting to code blocks
  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const language = className?.replace("language-", "") || ""; // Get the language from className (e.g., "language-js")
      return !inline ? (
        <SyntaxHighlighter
          language={language}
          style={solarizedlight}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  }; //end

  // API request function with streaming enabled to fetch responses from the model
  const apiRequest = async (text) => {
    try {
      if (!isStream) {
        const data = {
          model: currentModel,
          prompt: text,
          stream: isStream,
          context: currentContext,
        };
        await fetch(`${apiUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            // alert(JSON.stringify(data.response, null, 2));
            // alert(JSON.stringify(Object.keys(data), null, 2));
            // console.log(data);

            setMessages((prevMessages) => {
              return [
                ...prevMessages,
                {
                  name: "AI",
                  text: data.response,
                },
              ];
            }); //end
            setContext(data.context);
            // alert(JSON.stringify(messages,null,2))
          })
          .catch((error) => {
            // alert("Error: " + JSON.stringify(error, null, 2));
            console.error(error);
          }); //end
      } else {
        let response = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: currentModel,
            prompt: text,
            stream: isStream,
            context: currentContext,
          }),
        }); //end

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

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
                  const isCode = detectCode(parsedChunk.response);

                  if (parsedChunk.done) {
                    if (parsedChunk.context) {
                      setContext(parsedChunk.context);
                    }
                  } else {
                    setMessages((prevMessages) => {
                      const lastMessage = prevMessages[prevMessages.length - 1];
                      if (lastMessage && lastMessage.name === "AI") {
                        lastMessage.text += ` ${parsedChunk.response}`;
                        lastMessage.isCode = isCode;
                        return [...prevMessages.slice(0, -1), lastMessage];
                      }
                      return [
                        ...prevMessages,
                        {
                          name: "AI",
                          text: parsedChunk.response.trim(),
                          isCode: isCode,
                        },
                      ];
                    });
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
      } //endIf
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Detect if the text contains a code block using triple backticks
  const detectCode = (text) => {
    // Match for code blocks wrapped in triple backticks (non-greedy match)
    console.log(
      `isCode: ${/```[\s\S]+?```/.test(text.trim())}, chunk: ${text}`
    );
    return /`` s`[\s\S]+?``\s`/.test(text.trim());
    // return /```[\s\S]+?```/.test(text.trim());
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

    await apiRequest(message);
  };

  // Save the user's name to localStorage and update UI
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
    navigator.clipboard
      .writeText(code)
      .then(() => alert("Code copied to clipboard!"))
      .catch((err) => console.error("Failed to copy code: ", err));
  };

  // Text-to-speech function for screen readers to read the response aloud
  const speak = (text) => {
    let lastIndex = messages.length - 1;
    let message = text || messages[lastIndex].text;
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  // Check if user is ready (name provided)
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
        <div
          className="chat-box bg-light p-4 rounded-3"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {/* Display messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message mb-3 p-3 rounded-3 ${
                msg.name === user
                  ? "bg-primary text-white ms-auto"
                  : "bg-secondary text-dark"
              }`}
            >
              <div className="message-header d-flex justify-content-between align-items-center">
                <h5>{msg.name}</h5>
                {/* Conditionally render the Copy Code button if the message contains code */}
                {msg.isCode && (
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => copyCode(msg.text)}
                    aria-label="Copy code to clipboard"
                  >
                    Copy Code
                  </button>
                )}
              </div>
              <div className="message-body">
                {/* Render Markdown content */}
                {!isStream ? (
                  <MarkdownRenderer content={msg.text} />
                ) : (
                  <Markdown
                    children={msg.text}
                    remarkPlugins={[remarkGfm]}
                    components={renderers}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Show loader when waiting for AI response */}
        {loading && <Loader />}

        {/* Input form for sending messages */}
        <div className="message-input d-flex align-items-center">
          <form onSubmit={handleSendMessage} className="w-100 d-flex">
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type a message..."
              autoFocus
              className="form-control me-2"
              aria-label="Type a message"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
            <button
              type="button"
              className="btn btn-info ms-2"
              onClick={() => speak()}
              aria-label="Speak last message"
            >
              Speak
            </button>
          </form>
        </div>
      </main>

      {error && (
        <div className="alert alert-danger" role="alert">
          <pre>{error}</pre>
        </div>
      )}

      <MainFooter />
    </>
  );
};

export default Chat;
