# User Guide: Chat Localhost Llama3

## 🚀 Getting Started

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:3301` (development) or `http://localhost:8000` (production)
   - The application automatically detects your location for context-aware responses

2. **Authentication**
   - **Sign In**: Use your registered account credentials
   - **Register**: Create a new account with email/password
   - **Guest Mode**: Click "Continue as Guest" for quick access
   - Guest conversations are saved locally; sign in to sync across devices

3. **Start Chatting**
   - Type your message in the input box and press Enter or click "Send"
   - Use Shift+Enter for multi-line messages
   - The AI will respond using the selected model and mode

---

## 🎯 Key Features

### 1. **Dual-Mode System**

#### 💬 **Chat Mode** (Conversational)
- **Best for**: Back-and-forth conversations, Q&A, clarifications
- **Temperature**: 0.3 (more focused and consistent)
- **Max Tokens**: 500 (shorter, concise responses)
- **Endpoint**: `/api/chat` (maintains conversation history)
- **Use cases**: 
  - Quick questions
  - Clarifying information
  - Multi-turn conversations
  - Personal assistant tasks

#### 📝 **Generate Mode** (Long-form)
- **Best for**: Creative writing, detailed explanations, code generation
- **Temperature**: 0.6 (more creative and varied)
- **Max Tokens**: 2000 (longer, detailed responses)
- **Endpoint**: `/api/generate` (prompt-based)
- **Use cases**:
  - Writing essays or articles
  - Generating complex code
  - Creating content
  - Detailed analysis

**Switching Modes**: Click the mode toggle buttons in the header (💬 Chat | 📝 Generate)

---

### 2. **AI Tools & Function Calling** 🔧

The AI can automatically use tools to provide real-time information:

#### Available Tools:

**🌤️ Weather Information**
- Ask: *"What's the weather like?"* or *"How's the weather in Tokyo?"*
- The AI automatically detects your location or the mentioned city
- Provides temperature, conditions, humidity, wind speed

**🕐 Time & Date**
- Ask: *"What time is it?"* or *"What's the date in New York?"*
- Gets current time for any timezone
- Provides day of week, date, and time

**📰 Latest News**
- Ask: *"What's the latest news?"* or *"Show me tech news"*
- Categories: general, business, technology, science, health, sports, entertainment
- Returns recent headlines and summaries

**🔍 Web Search** (Coming Soon)
- Ask general knowledge questions
- The AI will search the web for current information

**How it works:**
1. You ask a question like "What's the weather?"
2. AI detects it needs the weather tool
3. Backend executes the tool with your location
4. AI formats the result into a natural response
5. You get accurate, real-time information!

---

### 3. **Temperature & Token Controls** 🎛️

**Temperature Slider** (0.0 - 1.0)
- **Lower (0.0-0.3)**: More focused, deterministic, factual
- **Medium (0.4-0.7)**: Balanced creativity and consistency
- **Higher (0.8-1.0)**: More creative, diverse, unpredictable
- Auto-adjusts when switching modes

**Max Tokens Input** (50 - 4000)
- Controls response length
- Lower values: Shorter, concise answers
- Higher values: Longer, detailed responses
- Auto-adjusts when switching modes

---

### 4. **Voice Mode** 🎤🔊

**Full Voice Assistant Experience:**
- Click **🔇 Voice Off** button to enable voice mode
- The AI will automatically:
  1. Listen for your voice input
  2. Process your speech to text
  3. Send message to AI
  4. Read the response aloud (Text-to-Speech)
  5. Start listening again for continuous conversation

**Manual Voice Input** (when Voice Mode is off):
- Click the microphone button to speak once
- Your speech is converted to text in the input box
- Review and edit before sending

**Browser Compatibility:**
- Works best with Google Chrome or Microsoft Edge
- Requires microphone permissions
- Allow location access for better context

---

### 5. **Code Blocks & Editing** 💻

When the AI generates code:
- **Copy Button**: Copy code to clipboard
- **Edit Button**: Opens Monaco Editor for inline editing
- **Syntax Highlighting**: Automatic language detection
- **File Blocks**: Named files with language labels

**Editing Code:**
1. Click "Edit" on any code block
2. Modify the code in the Monaco Editor
3. Changes are instantly visible
4. Copy the edited code when ready

---

### 6. **Conversation Management** 📝

**Sidebar Features:**
- View all your saved conversations
- Click a conversation to load it
- **New Chat**: Start a fresh conversation
- Conversations are auto-saved (for logged-in users)

**Guest Mode:**
- Conversations saved in browser localStorage
- Limited to current device
- Won't sync across devices
- Register to save conversations permanently

---

### 7. **Role Templates** 👨‍⚕️👨‍💻

Select pre-configured system prompts:
- **Doctor**: Medical advice context (educational purposes)
- **Developer**: Code-focused responses
- **Custom**: Create your own system prompt

Role templates shape how the AI responds to your messages.

---

## 🎨 User Interface Tips

### Header Controls
- **Model Selector**: Choose your AI model (e.g., llama3.2, mistral)
- **Mode Toggle**: Switch between Chat (💬) and Generate (📝)
- **Temperature Slider**: Adjust creativity (hover to see value)
- **Max Tokens**: Set response length limit
- **Settings**: Access additional configuration

### Chat Interface
- **Mode Banner**: Shows current mode and settings at the top
- **Message Bubbles**: User (right) vs AI (left)
- **Loading Indicator**: Animated dots while AI is thinking
- **Response Time**: Shows how long the AI took to respond
- **Auto-scroll**: Automatically scrolls to newest message

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift+Enter**: New line in message input
- **Tab**: Navigate between UI elements
- **Escape**: Close modals/editors

---

## 🛠️ Troubleshooting

### Location Not Detected
- **Solution**: Allow location permissions in browser
- **Alternative**: Mention your city explicitly (e.g., "Weather in Mumbai")

### Tools Not Working
- **Check**: Backend API keys in `.env` file
- **Fallback**: Tools provide mock data if API keys missing
- **Status**: Look for tool execution logs in browser console

### Voice Mode Issues
- **Permissions**: Allow microphone and audio access
- **Browser**: Use Chrome or Edge for best compatibility
- **Privacy**: Some browsers block TTS/STT on HTTP (use HTTPS in production)

### API Offline Message
- **Check**: Backend is running on port 3300
- **Verify**: `VITE_API_URL=http://localhost:3300` in frontend `.env`
- **CORS**: Frontend port must be in backend `ALLOWED_ORIGINS`

### Slow Responses
- **Model Size**: Larger models take longer to generate
- **Token Limit**: Higher max_tokens = longer generation time
- **Hardware**: GPU acceleration improves speed significantly

---

## 🆕 New Features & Tool Usage

### Universal & Local Tools
- Ask the AI for weather, news, time, location, math, finance, reminders, or HTTP requests.
- The assistant auto-detects your location and context for better results.
- Tools use both global and Indian sources (e.g., OpenWeatherMap, NewsAPI, TOI RSS).

### How to Use Tools
- Just ask: "What's the weather in Mumbai?" or "Show me the latest news."
- For advanced users, you can call tools via API (see README).
- Location and time are detected automatically if not specified.

### Troubleshooting
- If you get errors about missing API keys, check your `.env` file.
- For dependency issues, see README troubleshooting section.
- If a tool fails, the AI will fallback or show an error message.

### Quick Feature Summary
- Real tools for weather, news, time, location, math, finance, reminders, HTTP.
- Strict environment validation for reliability.
- All tools ready to use in chat and API.

---

## 📱 Best Practices

1. **Use Chat Mode** for quick questions and conversations
2. **Use Generate Mode** for detailed content and code
3. **Lower temperature** for factual, consistent answers
4. **Higher temperature** for creative, varied outputs
5. **Ask specific questions** for better tool usage
6. **Mention locations** when asking about weather/time
7. **Enable voice mode** for hands-free operation
8. **Sign in** to save conversations across devices
9. **Clear conversations** periodically to improve performance
10. **Use role templates** to set context for specialized tasks

---

## 🔒 Privacy & Security

- **Authentication**: JWT-based secure authentication
- **Password**: Encrypted with bcrypt
- **Location**: Only shared if you grant permission (never stored permanently)
- **Conversations**: Saved securely in MongoDB (encrypted at rest)
- **Guest Mode**: Data stored locally in your browser
- **API Keys**: Kept secure in backend environment variables
- **CORS**: Restricted to allowed frontend origins only

---

## 🆘 Getting Help

- **Documentation**: Check `DEVELOPER_GUIDE.md` for technical details
- **Issues**: Report bugs on GitHub repository
- **Logs**: Check browser console (F12) for errors
- **Backend Logs**: Check terminal running backend for API errors

---

## 🎉 Tips for Advanced Users

### Custom System Prompts
Create specialized AI personas by customizing system templates:
```
You are an expert Python developer specializing in machine learning.
Always provide code examples and explain trade-offs.
```

### Combining Tools
Ask complex questions that use multiple tools:
- "What's the weather and news in San Francisco?"
- "What time is it in Tokyo and what's the temperature there?"

### Optimal Token Settings
- **Code Generation**: 1000-2000 tokens
- **Quick Answers**: 200-500 tokens
- **Essays**: 2000-4000 tokens
- **Chat Messages**: 500-1000 tokens

### Temperature Tuning
- **Math/Logic**: 0.1-0.2
- **General Chat**: 0.3-0.5
- **Creative Writing**: 0.7-0.9
- **Brainstorming**: 0.8-1.0

---

**Enjoy your AI-powered personal assistant! 🚀**
