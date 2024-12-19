import { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Loader from "./components/loader";
import MainHeader from "./main-header";
import MainFooter from "./main-footer";
import { AppSetting } from "./App-setting";
import Stt from "./stt";



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
        headers: { "Content-Type": "application/json" },
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
            // Extract a chunk
            const chunk = buffer.slice(0, boundary).trim(); 

            if (chunk) {
              try {
                // Parse the chunk as JSON
                const parsedChunk = JSON.parse(chunk); 

                // Avoid processing if the chunk is marked as done (end of data)
                if (parsedChunk.done) {
                  // Async code detection (if needed)
                  const isCode = await detectCode(parsedChunk.response); 
                                    if (parsedChunk.context) {
                    // let ncontext = [...currentContext, ...parsedChunk.context];
                    let ncontext = parsedChunk.context;
                    setContext(ncontext);
                  } //endIf
                } else {
                  // Async code detection (if needed)
                  const isCode = await detectCode(parsedChunk.response);

                  await setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    if (lastMessage && lastMessage.name === "AI") {
                      const words = lastMessage.text.split(" ");
                      if (words.length > 0 && words[words.length - 1] !== parsedChunk.response) {
                      lastMessage.text += parsedChunk.response;
                      // lastMessage.text += ` ${parsedChunk.response}`;
                      }else{
                      lastMessage.text += ` ${parsedChunk.response}`;
                      };//endIf
                        // Add code flag if applicable
                        lastMessage.isCode = isCode;
                        
                        return [...prevMessages.slice(0, -1), lastMessage];
                    };//endIf
                      return [
                        ...prevMessages,
                        {
                          name: "AI",
                          text: parsedChunk.response.trim(),
                          isCode: isCode,
                        },
                      ];
                    
                  }); //endSetMessage
                } //endIf
              } catch (e) {
                console.error("Parsing error:", e);
              }
            } //endIfChunk

            // Slice the buffer after processing the chunk, and look for the next boundary
            buffer = buffer.slice(boundary + 1);
            boundary = buffer.indexOf("\n");
          } //endWhile
        } //endIfValues
      } //endWhile

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

  //function tts
const speak = () => {
  let lastIndex = messages.length - 1;
  // alert(JSON.stringify(messages,null,2))
  // alert(lastIndex)
  let message = messages[lastIndex].text;
  const utterance = new SpeechSynthesisUtterance(message);
  window.speechSynthesis.speak(utterance);
};//endSpeak
useEffect(()=>{
  console.log('ready')
},[]);//endUseEffect

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
              {/* <Stt /> */}
              <button type="submit">Send</button>
              <button type="button" onClick={()=>speak()}>Speak</button>
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
