// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import ChatAppStream from "./chat-app-generate-stream";
import ChatAppChat from "./chat-app-chat";
import { AppSettingProvider } from "./App-setting";

function App() {
  return (
    <AppSettingProvider>
      {/* <ChatAppStream /> */}
      <ChatAppChat />
    </AppSettingProvider>
  );
}

export default App;
