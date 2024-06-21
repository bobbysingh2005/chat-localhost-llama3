import React, { useState } from "react";
import axios from "axios";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Loder from "./components/loader";
import MainHeader from './main-header';
import MainFooter from './main-footer';

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(
    localStorage.getItem("user") ? localStorage.getItem("user") : ""
  );
  const [ready, setReady] = useState(localStorage.getItem("user") || false);
  const [loading, setLoading] = useState(false);
  const [errors, setError] = useState(null);

  const apiRequest = async (text) => {
    try {
      let msg = await axios.post(`http://localhost:11434/api/generate`, {
        model: "llama3",
        prompt: text,
        stream: false,
      }); //end
      setLoading(false);
      return msg.data.response;
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  }; //end

  const handleSendMessage = async (event) => {
    event.preventDefault();
    let txt = message;
    setMessages((prevMessages) => [
      ...prevMessages,
      { name: user, text: message },
    ]);
    setMessage("");
    setLoading(true);
    let answer = await apiRequest(txt);
    setMessages((prevMessages) => [
      ...prevMessages,
      { name: "AI", text: answer },
    ]);
  }; //end
  const save = (ev) => {
    ev.preventDefault();
    let { name, value } = ev.target.name;
    if (value === "") {
      setUser("user");
      localStorage.setItem("user", "user");
    } else {
      setUser(value);
      localStorage.setItem("user", value);
    } //endIf
    setReady(true);
  }; //end

  if (!ready)
    return (
      <form onSubmit={save}>
        <label>Name: </label>
        <input type="text" name="name" autoFocus />
        <button type="submit">Save</button>
      </form>
    ); //end
  return (
    <>
        <MainHeader user={user} />
      <main className="container">
        <div className="row">
          <div className="col">
            {messages.map((message, index) => {
              if (message.name !== user) {
                return (
                  <div key={index}>
                    <h2>{message.name}</h2>
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </Markdown>
                  </div>
                );
              } //endIf
              return (
                <div key={index}>
                  <h2>{message.name}</h2>
                  <p>{message.text}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="row">
          <div className="col">{loading ? <Loder /> : ""}</div>
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
      {errors ? (
        <div className="row" role="alert">
          <pre>{errors}</pre>
        </div>
      ) : (
        ""
      )}
      <MainFooter />
    </>
  );
}; //end

export default Chat;
