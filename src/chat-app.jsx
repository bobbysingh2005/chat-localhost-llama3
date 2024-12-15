import { useContext, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Loader from "./components/loader";
import MainHeader from "./main-header";
import MainFooter from "./main-footer";
import { AppSetting } from "./App-setting";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const [ready, setReady] = useState(!!localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentModel } = useContext(AppSetting);
  const [count, setCount] = useState([0]);
  const [currentContext, setContext] = useState([]);

  // Function to handle API request with streaming enabled
  const apiRequest = async (text) => {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: currentModel,
          prompt: text,
          stream: true,
          context: currentContext,
        }),
      }); //endFetchResponse

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } //endIf

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        done = streamDone; // Update done when stream ends

        if (value) {
          // Add the new chunk to the buffer and decode it
          buffer += decoder.decode(value, { stream: true });

          // Process all complete lines (delimited by '\n')
          let boundary = buffer.indexOf("\n");
          while (boundary !== -1) {
            const chunk = buffer.slice(0, boundary).trim(); // Extract a chunk
            if (chunk) {
              try {
                const parsedChunk = JSON.parse(chunk); // Parse the chunk as JSON

                // Avoid processing if the chunk is marked as done (end of data)
                if (parsedChunk.done) {
                  const isCode = await detectCode(parsedChunk.response); // Async code detection (if needed)
                  
                  setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    if (lastMessage && lastMessage.name === "AI") {
                      lastMessage.text += parsedChunk.response;
                      lastMessage.isCode = isCode; // Add code flag if applicable
                      return [...prevMessages.slice(0, -1), lastMessage];
                    };//endIf
                    return [
                      ...prevMessages,
                      {
                        name: "AI",
                        text: parsedChunk.response,
                        isCode: isCode,
                      },
                    ];
                  }); //endSetMessage
                  
                  if(parsedChunk.context){
                    // let ncontext = [...currentContext, ...parsedChunk.context];
                    let ncontext = parsedChunk.context;
                  setContext(ncontext);
                };//endIf
                } else {
                  const isCode = await detectCode(parsedChunk.response); // Async code detection (if needed)
                  setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    if (lastMessage && lastMessage.name === "AI") {
                      const lastText = lastMessage.text.split(' ')
                    // alert(`lastText: ${lastText[lastText.length-1]}, parsedChunk: ${parsedChunk.response}`)
                    // alert(lastMessage.text+' '+parsedChunk.response)
                      lastMessage.text += parsedChunk.response;
                      lastMessage.isCode = isCode; // Add code flag if applicable
                      return [...prevMessages.slice(0, -1), lastMessage];
                    } //endIf
                    return [
                      ...prevMessages,
                      {
                        name: "AI",
                        text: parsedChunk.response,
                        isCode: isCode,
                      },
                    ];
                  }); //endSetMessage
                } //endIf

              } catch (e) {
                console.error("Parsing error:", e);
              }
            }

            // Slice the buffer after processing the chunk, and look for the next boundary
            buffer = buffer.slice(boundary + 1);
            boundary = buffer.indexOf("\n");
          }
        };///endIfValue
      };//endWhile

      // At this point, the stream is finished (`done === true`), ensure no more updates.
      console.log("Stream finished processing.");

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

    setMessages((prevMessages) => [
      ...prevMessages,
      { name: user, text: message },
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
    navigator.clipboard
      .writeText(code)
      .then(() => alert("Code copied to clipboard!"))
      .catch((err) => console.error("Failed to copy code: ", err));
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
                  <Markdown remarkPlugins={[remarkGfm]} children={msg.text} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="row">
          <div className="col">{loading && <Loader />}</div>
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
