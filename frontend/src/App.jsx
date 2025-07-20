import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AppSettingProvider } from "./views/App-setting";
import DefaultLayout from "./views/default-layout";

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
