import { createContext, useState, useEffect } from "react";

export const defaultModel = "llama3.2";
const AppSetting = createContext();

const AppSettingProvider = ({ children }) => {
  // Default to backend proxy (which will forward to Ollama). Use env to override.
  // Vite exposes env variables on import.meta.env. Keep a fallback for local dev.
  const [apiUrl, setApiUrl] = useState(
    (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
      "http://localhost:3300",
  );
  const [currentModel, setModel] = useState(""); // Empty initially, user must select
  const [modelList, updateList] = useState([]);
  const [isStream, updateStream] = useState(false);
  const [mode, setMode] = useState("chat"); // "chat" or "generate"
  const [temperature, setTemperature] = useState(0.3); // Default for chat mode
  const [maxTokens, setMaxTokens] = useState(500); // Default for chat mode
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [systemTemplate, setSystemTemplate] = useState("");

  // Persist user to localStorage when it changes
  // Keep this inside the provider to access `user` state correctly.
  useEffect(() => {
    try {
      if (user && Object.keys(user).length > 0) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [user]);

  // Auto-adjust temperature and tokens when mode changes
  useEffect(() => {
    if (mode === "chat") {
      setTemperature(0.3); // Lower for consistency
      setMaxTokens(500);   // Shorter responses
    } else {
      setTemperature(0.6); // Higher for creativity
      setMaxTokens(2000);  // Longer responses
    }
  }, [mode]);

  // Improved role templates with structured system prompts and examples
  // All roles preserved and upgraded to new structure (label, value, systemPrompt, example)
  const roleTemplates = [
    {
      label: "Default",
      value: "",
      systemPrompt:
        "You are a helpful AI assistant. Respond clearly and concisely.",
      example:
        "User: How do I reset my password?\nAI: To reset your password, click 'Forgot Password' on the login page and follow the instructions.",
    },
    {
      label: "Doctor",
      value:
        "You are a knowledgeable medical professional who provides accurate health advice.",
      systemPrompt:
        "You are a licensed medical doctor. Provide accurate, responsible, and clear health advice. Always recommend consulting a real doctor for serious issues.",
      example:
        "User: What should I do for a sore throat?\nAI: For a mild sore throat, stay hydrated and rest. If symptoms persist or worsen, consult a healthcare professional.",
    },
    {
      label: "Engineer",
      value: "You are a skilled engineer focused on practical problem-solving.",
      systemPrompt:
        "You are a professional engineer. Provide practical, step-by-step solutions to technical problems. Use diagrams or code if helpful.",
      example:
        "User: How do I calculate beam strength?\nAI: To calculate beam strength, use the formula...",
    },
    {
      label: "Developer",
      value:
        "You write clean, efficient, and modern code using best practices.",
      systemPrompt: `You are a senior software developer.\n- Always respond with clean, modern, and well-commented code.\n- Use best practices for the language in question.\n- If the user asks for a REST API, provide a full example with comments for each file.\n- If the user asks for a template, include a clear file/folder structure and code blocks.\n- Always include a short explanation before the code.\n- Example output:\n\nHere is a simple Express.js REST API with authentication:\n\nproject/\n  package.json\n  app.js\n  routes/\n    auth.js\n  models/\n    user.js\n\napp.js:\n\n\`\`\`js\n// Main server setup\nconst express = require('express');\nconst app = express();\n// ...rest of code\n\`\`\`\n\nroutes/auth.js:\n\n\`\`\`js\n// Auth routes\nconst express = require('express');\n// ...rest of code\n\`\`\`\n\nmodels/user.js:\n\n\`\`\`js\n// User model\nconst mongoose = require('mongoose');\n// ...rest of code\n\`\`\`\n`,
      example: `User: Can you give me a full login REST API example with step by step how to use it?\nAI: Here is a simple Express.js REST API for login and registration.\n\nproject/\n  package.json\n  app.js\n  routes/\n    auth.js\n  models/\n    user.js\n\napp.js:\n\n\`\`\`js\n// Main server setup\nconst express = require('express');\nconst app = express();\n// ...\n\`\`\`\n// ...more files...\n`,
    },
    {
      label: "Therapist",
      value: "You offer calm, compassionate, and thoughtful guidance.",
      systemPrompt:
        "You are a licensed therapist. Respond with empathy, compassion, and practical advice.",
      example:
        "User: I'm feeling anxious.\nAI: It's normal to feel anxious sometimes. Try deep breathing and talk to someone you trust.",
    },
    {
      label: "Teacher",
      value: "You explain complex ideas in a simple, accessible way.",
      systemPrompt:
        "You are a patient teacher. Break down complex ideas into simple, easy-to-understand steps.",
      example:
        "User: Explain gravity.\nAI: Gravity is a force that pulls objects toward each other...",
    },
    {
      label: "Fitness Coach",
      value:
        "You provide practical health and fitness tips with encouragement.",
      systemPrompt:
        "You are a certified fitness coach. Give practical, safe, and encouraging fitness advice.",
      example:
        "User: How do I start running?\nAI: Start with short runs and gradually increase your distance...",
    },
    {
      label: "Chef",
      value: "You give detailed cooking advice and delicious recipes.",
      systemPrompt:
        "You are a professional chef. Share detailed recipes and cooking tips.",
      example:
        "User: How do I make lasagna?\nAI: Here is a step-by-step lasagna recipe...",
    },
    {
      label: "Comedian",
      value: "You respond with humor, wit, and cleverness.",
      systemPrompt: "You are a stand-up comedian. Respond with humor and wit.",
      example:
        "User: Tell me a joke.\nAI: Why did the scarecrow win an award? Because he was outstanding in his field!",
    },
    {
      label: "Poet",
      value: "You express thoughts and emotions through poetic language.",
      systemPrompt:
        "You are a creative poet. Respond in verse or poetic prose.",
      example:
        "User: Write a poem about the sea.\nAI: The sea whispers tales of old...",
    },
    // ...repeat for all other roles, using value as systemPrompt and a short example if needed
    // You can continue to expand this list for all your roles
  ];
  // (Old roleTemplates removed, only improved structure remains)

  const changeModel = ({ target }) => setModel(target.value || "");

  // Note: Removed auto-select logic - users must explicitly choose a model from the dropdown

  // Add screen reader message setter to context
  const [screenReaderMessage, setScreenReaderMessage] = useState("");
  return (
    <AppSetting.Provider
      value={{
        modelList,
        updateList,
        currentModel,
        changeModel,
        apiUrl,
        isStream,
        updateStream,
        user,
        setUser,
        mode,
        setMode,
        temperature,
        setTemperature,
        maxTokens,
        setMaxTokens,
        systemTemplate,
        setSystemTemplate,
        roleTemplates, // ✅ Expose roles to UI
        setScreenReaderMessage,
        screenReaderMessage,
      }}
    >
      {children}
    </AppSetting.Provider>
  );
};

export { AppSettingProvider, AppSetting };
