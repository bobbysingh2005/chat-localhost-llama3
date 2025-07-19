import { BrowserRouter } from "react-router-dom";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import { AppSettingProvider } from "./App-setting";
import DefaultLayout from "./default-layout";

function App() {
  return (
    <AppSettingProvider>
      <BrowserRouter>
      <DefaultLayout />
      </BrowserRouter>
    </AppSettingProvider>
  );
}

export default App;
