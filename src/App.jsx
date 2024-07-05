// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import ChatApp from "./chat-app";
import { AppSettingProvider } from "./App-setting";

function App() {
  return (
    <AppSettingProvider>
      <ChatApp />
    </AppSettingProvider>
  );
}

export default App;
