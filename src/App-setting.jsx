import { createContext,  useMemo,  useState } from "react";

export const AppSetting = createContext();
//eslint-disable-next-line
export const AppSettingProvider = ({ children }) => {
  const [currentModel, setModel] = useState("llama3");
  const modelList = useMemo(()=>[
    { name: "Llama3", value: "llama3" },
    { name: "Deepseek Coder v2", value: "deepseek-coder-v2" },
    { name: "Code Gemma", value: "codegemma:7b" },
    { name: "Code Llama", value: "codellama" },
    { name: "Star Coder", value: "starcoder" },
    { name: "Star Coder B15", value: "starcoder:15b" },
  ],[]);

  const changeModel = ({target}) => setModel(target.value || "llama3");

  return (
    <AppSetting.Provider
      value={{ modelList, currentModel, changeModel }}
    >
      {children}
    </AppSetting.Provider>
  );
};
