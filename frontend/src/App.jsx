import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AppSettingProvider } from "./views/App-setting";
import DefaultLayout from "./views/default-layout";
import ReminderNotification from "./components/ReminderNotification";

function App() {
  return (
    <AppSettingProvider>
      <BrowserRouter>
        <DefaultLayout />
        <ReminderNotification />
      </BrowserRouter>
    </AppSettingProvider>
  );
}

export default App;
