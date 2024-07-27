import { useContext, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from './components/loader';
import MainHeader from './main-header';
import MainFooter from './main-footer';
import { AppSetting } from './App-setting';

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const [ready, setReady] = useState(!!localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestTime, setRequestTime] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const { currentModel } = useContext(AppSetting);

  // Function to handle API request with streaming enabled
  const apiRequest = async (text) => {
    try {
      const startTime = new Date();
      setRequestTime(startTime.toLocaleTimeString());
  
      const response = await fetch("http://localhost:11434/api/generate", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentModel,
          prompt: text,
          stream: true,
        }),
      });

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
          let boundary = buffer.indexOf('\n');
          while (boundary !== -1) {
            const chunk = buffer.slice(0, boundary).trim();
            if (chunk) {
              try {
                const parsedChunk = JSON.parse(chunk);

                // Add a code flag to determine if the message contains code
                if (!parsedChunk.done) {
                  setMessages(prevMessages => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    if (lastMessage && lastMessage.name === "AI") {
                      lastMessage.text += parsedChunk.response;
                      lastMessage.isCode = detectCode(parsedChunk.response); // Check if it's code
                      return [...prevMessages.slice(0, -1), lastMessage];
                    }
                    return [...prevMessages, { name: "AI", text: parsedChunk.response, isCode: detectCode(parsedChunk.response) }];
                  });
                } else if (parsedChunk.done) {
                  setMessages(prevMessages => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    if (lastMessage && lastMessage.name === "AI") {
                      lastMessage.text += parsedChunk.response;
                      lastMessage.isCode = detectCode(parsedChunk.response); // Check if it's code
                      return [...prevMessages.slice(0, -1), lastMessage];
                    }
                    return [...prevMessages, { name: "AI", text: parsedChunk.response, isCode: detectCode(parsedChunk.response) }];
                  });
                }
              } catch (e) {
                console.error('Parsing error:', e);
              }
            }
            buffer = buffer.slice(boundary + 1);
            boundary = buffer.indexOf('\n');
          }
        }
      }

      const endTime = new Date();
      setResponseTime(endTime.toLocaleTimeString());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Function to detect if the text contains code (e.g., checking for code block delimiters)
  const detectCode = (text) => {
    return /```.*\n[\s\S]*\n```/.test(text); // Example heuristic for code blocks
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (message.trim() === "") return;

    setMessages(prevMessages => [
      ...prevMessages,
      { name: user, text: message }
    ]);
    setMessage("");
    setLoading(true);

    await apiRequest(message);
  };

  const save = (event) => {
    event.preventDefault();
    const value = event.target.name.value.trim();
    const newUser = value || "user";
    setUser(newUser);
    localStorage.setItem("user", newUser);
    setReady(true);
  };

  // Function to copy code to the clipboard
  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => alert('Code copied to clipboard!'))
      .catch(err => console.error('Failed to copy code: ', err));
  };

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
      <main className="container">
        <div className="row">
          <div className="col">
            {messages.map((msg, index) => (
              <div key={index} className="message-container">
                <h2>{msg.name}</h2>
                <div className="code-container">
                  {/* Conditionally render the Copy Code button if the message contains code */}
                  {msg.isCode && (
                    <button 
                      className="copy-button"
                      onClick={() => copyCode(msg.text)}
                    >
                      Copy Code
                    </button>
                  )}
                  {/* Render Markdown content */}
                  <Markdown 
                    remarkPlugins={[remarkGfm]} 
                    children={msg.text}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="row">
          <div className="col">
            {loading && <Loader />}
          </div>
        </div>
        <div className="row">
          <div className="col">
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type a message..."
                autoFocus
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
        {requestTime && responseTime && (
          <div className="row">
            <div className="col">
              <p>Request Time: {requestTime}</p>
              <p>Response Time: {responseTime}</p>
            </div>
          </div>
        )}
      </main>
      {error && (
        <div className="row" role="alert">
          <pre>{error}</pre>
        </div>
      )}
      <MainFooter />
    </>
  );
};

export default Chat;
