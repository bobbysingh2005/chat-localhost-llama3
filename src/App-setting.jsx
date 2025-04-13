import { createContext, useMemo, useState } from "react";

export const defaultModel = "llama3.2";
export const AppSetting = createContext();
//eslint-disable-next-line
export const AppSettingProvider = ({ children }) => {
  const [apiUrl, setApiUrl] = useState("http://localhost:11434");
  const [currentModel, setModel] = useState(defaultModel);
  const [modelList, updateList] = useState([]);
  const [isStream, updateStream] = useState(false);

  const changeModel = ({ target }) => setModel(target.value || defaultModel);

  return (
    <AppSetting.Provider
      value={{ 
        modelList, 
        updateList, 
        currentModel, 
        changeModel, 
        apiUrl,
        isStream,
        updateStream
      }}
    >
      {children}
    </AppSetting.Provider>
  );
};
