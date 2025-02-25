import { createContext, useMemo, useState } from "react";

export const defaultModel = "llama3.2-vision";
export const AppSetting = createContext();
//eslint-disable-next-line
export const AppSettingProvider = ({ children }) => {
  const [currentModel, setModel] = useState(defaultModel);
  const modelList = useMemo(
    () => [
      { name: "Llama 3.2 vision", value: "llama3.2-vision" },
      { name: "Llama 3.2", value: "llama3.2" },
      { name: "Llama 3.1", value: "llama3.1" },
      { name: "Deepseek Coder v2", value: "deepseek-coder-v2" },
      { name: "Code Gemma", value: "codegemma:7b" },
      { name: "Code Llama", value: "codellama" },
      { name: "Star Coder", value: "starcoder" },
      { name: "Google Gemma2", value: "gemma2" },
      { name: "Star Coder B15", value: "starcoder:15b" },
    ],
    []
  );

  const changeModel = ({ target }) => setModel(target.value || defaultModel);

  return (
    <AppSetting.Provider value={{ modelList, currentModel, changeModel }}>
      {children}
    </AppSetting.Provider>
  );
};
