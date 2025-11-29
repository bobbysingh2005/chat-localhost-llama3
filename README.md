# Chat Localhost Llama3 🚀

**AI-Powered Personal Assistant with Function Calling & Dual-Mode System**

Modern, accessible, and feature-rich self-hosted chat application powered by Ollama LLMs, with intelligent tool usage, voice interaction, and real-time capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22.21.1-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 **Intelligent AI Assistant**
- **Dual-Mode System**: 
  - 💬 **Chat Mode**: Conversational with context history (temp: 0.3, tokens: 500)
  - 📝 **Generate Mode**: Long-form creative content (temp: 0.6, tokens: 2000)
- **Function Calling**: AI automatically uses tools for real-time information
- **Context-Aware**: Automatically detects user location for personalized responses

### 🔧 **Built-in Tools**
- 🌤️ **Weather**: Real-time weather information for any location
- 🕐 **Time & Date**: Current time for any timezone
- 📰 **News**: Latest headlines by category
- 🔍 **Web Search**: (Coming Soon) Search the web for information

### 🎛️ **Advanced Controls**
- **Temperature Slider** (0.0-1.0): Control response creativity
- **Max Tokens Input** (50-4000): Adjust response length
- **Auto-Adjustment**: Settings optimize when switching modes
- **Role Templates**: Pre-configured personas (Doctor, Developer, Custom)

### 🎤 **Voice Interaction**
- **Full Voice Mode**: Continuous hands-free conversation loop
- **Speech-to-Text**: Browser-based voice input
- **Text-to-Speech**: AI responses read aloud automatically
- **Manual STT**: Click-to-speak for one-time voice input

### 💻 **Developer Experience**
- **Code Editing**: Inline Monaco Editor for code blocks
- **Syntax Highlighting**: Automatic language detection
- **Copy/Edit**: One-click copy or edit any code block
- **Markdown Rendering**: Full markdown support with GFM

### 🔐 **Security & Auth**
- **JWT Authentication**: Secure token-based auth
- **Guest Mode**: Quick access without account
- **Password Encryption**: bcrypt hashing
- **CORS Protection**: Whitelist-based origin control

### 📱 **User Experience**
- **Responsive Design**: Works on desktop, tablet, mobile
- **Accessibility**: Screen reader support, keyboard navigation
- **Conversation History**: Save and manage chats
- **Auto-scroll**: Smooth scrolling to new messages
- **Sound Feedback**: Audio cues for actions
- **Dark/Light Theme**: (Coming Soon)

### 🚀 **Performance**
- **Streaming Responses**: Real-time token streaming
- **GPU Acceleration**: AMD ROCm support
- **Efficient Caching**: Optimized build and runtime
- **Docker Support**: Full containerization

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 22.21.1
- **Framework**: Fastify (TypeScript)
- **Database**: MongoDB
- **Authentication**: JWT + bcrypt
- **LLM**: Ollama (local inference)
- **HTTP Client**: Axios

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Bootstrap 5 + Custom CSS
- **Code Editor**: Monaco Editor
- **Markdown**: react-markdown + rehype-highlight

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Voice Services**: Browser API (STT/TTS), Kaldi (optional)
- **GPU**: AMD ROCm support

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 22.x
- MongoDB >= 5.x
- Ollama installed with models pulled
- Docker & Docker Compose (optional)

### Installation

**1. Clone Repository**
```bash
git clone https://github.com/bobbysingh2005/chat-localhost-llama3.git
cd chat-localhost-llama3
```

**2. Install Dependencies**
```bash
# Install root workspace dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

**3. Configure Environment**

Create `.env` files in backend and frontend directories:

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=3300
MONGO_URL=mongodb://localhost:27017/chatApp
OLLAMA_HOST=http://localhost:11434
SECRET_KEY=your-secret-key-here

ADMIN_USER=admin
ADMIN_PASSWORD=Admin@123
ADMIN_EMAIL=your-email@example.com

ALLOWED_ORIGINS=http://localhost:3301,http://localhost:8080,http://localhost:5173

# Optional: API Keys for Tools
OPENWEATHER_API_KEY=your-key-here
NEWS_API_KEY=your-key-here
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3300
```

**4. Start Services**

**Option A: Using Docker Compose (Recommended)**
```bash
docker-compose up -d
```

**Option B: Manual Start**
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Ollama
ollama serve

# Terminal 3: Backend
cd backend
npm run dev

# Terminal 4: Frontend
cd frontend
npm run dev
```

**5. Pull Ollama Models**
```bash
ollama pull llama3.2
ollama pull mistral
```

**6. Access Application**
- Frontend: http://localhost:3301
- Backend API: http://localhost:3300
- Production (Nginx): http://localhost:8000

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 3300 | Yes |
| `NODE_ENV` | Environment mode | development | Yes |
| `MONGO_URL` | MongoDB connection string | mongodb://localhost:27017/chatApp | Yes |
| `OLLAMA_HOST` | Ollama server URL | http://localhost:11434 | Yes |
| `SECRET_KEY` | JWT secret key | - | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | - | Yes |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | - | Optional |
| `NEWS_API_KEY` | NewsAPI key | - | Optional |

### Optional API Keys

To enable real-time data in tools:
- **Weather**: Get free API key from [OpenWeatherMap](https://openweathermap.org/api)
- **News**: Get free API key from [NewsAPI](https://newsapi.org/)

Without API keys, tools will return mock data.

---

## 📖 Usage

### Getting Started

1. **Open Browser**: Navigate to http://localhost:3301
2. **Allow Location**: Grant location permission for context-aware responses
3. **Sign In or Guest**: Create account or continue as guest
4. **Start Chatting**: Type message and press Enter

### Dual-Mode System

**💬 Chat Mode** (Conversational)
- Best for: Q&A, clarifications, conversations
- Click "💬 Chat" button in header
- Temperature: 0.3 (focused)
- Max Tokens: 500 (concise)

**📝 Generate Mode** (Long-form)
- Best for: Essays, code, creative writing
- Click "📝 Generate" button in header
- Temperature: 0.6 (creative)
- Max Tokens: 2000 (detailed)

### Using AI Tools

Simply ask natural questions:
- "What's the weather?" → AI automatically uses weather tool with your location
- "What time is it in Tokyo?" → AI uses time tool with Tokyo timezone
- "Show me tech news" → AI fetches latest technology news

### Voice Mode

1. Click **🔇 Voice Off** to enable
2. Speak your question
3. AI responds with voice
4. Continues listening automatically
5. Click **🔊 Voice On** to disable

### Adjusting Controls

- **Temperature Slider**: Drag to adjust creativity (0.0-1.0)
- **Max Tokens**: Enter value (50-4000) for response length
- **Auto-adjust**: Switch modes to apply optimal settings

---

## 📡 API Documentation

### Authentication

**POST** `/auth/register`
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**POST** `/auth/login`
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Chat Endpoints

**POST** `/api/chat` (Chat Mode)
```json
{
  "model": "llama3.2",
  "messages": [
    { "role": "user", "content": "What's the weather?" }
  ],
  "temperature": 0.3,
  "max_tokens": 500,
  "userLocation": {
    "city": "San Francisco",
    "country": "USA"
  }
}
```

**POST** `/api/generate` (Generate Mode)
```json
{
  "model": "llama3.2",
  "prompt": "Write a Python function",
  "temperature": 0.6,
  "max_tokens": 2000
}
```

### Conversation Management

- **GET** `/conversations` - List all conversations
- **GET** `/conversations/:id` - Get specific conversation
- **POST** `/conversations` - Create new conversation
- **DELETE** `/conversations/:id` - Delete conversation

---

## 📚 Documentation

Detailed documentation available in the repository:

- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user manual with features and tips
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Development setup, architecture, and API docs
- **[TESTER_GUIDE.md](TESTER_GUIDE.md)** - Testing procedures and QA guidelines

---

## 🏗️ Project Structure

```
chat-localhost-llama3/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Fastify app setup
│   │   ├── index.ts            # Entry point
│   │   ├── config/             # Configuration
│   │   ├── models/             # MongoDB models
│   │   ├── routes/             # API routes
│   │   └── tools/              # Function calling tools
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx            # Entry point
│   │   ├── App.jsx             # Root component
│   │   ├── components/         # Reusable components
│   │   └── views/              # Page components
│   ├── package.json
│   └── vite.config.js
├── nginx/                      # Nginx configuration
├── docker-compose.yml          # Docker orchestration
├── USER_GUIDE.md              # User documentation
├── DEVELOPER_GUIDE.md         # Developer documentation
└── README.md                  # This file
```

---

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Code Quality
```bash
# Lint and format
cd backend
npm run lint

cd frontend
npm run lint
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Use TypeScript for backend
- Follow ESLint/Prettier rules
- Write meaningful commit messages
- Update documentation for new features
- Test thoroughly before submitting

---

## 🐛 Troubleshooting

### API Offline Message
- Verify backend is running on port 3300
- Check `VITE_API_URL` in frontend `.env`
- Ensure frontend port is in backend `ALLOWED_ORIGINS`

### Tools Not Working
- Check API keys in backend `.env`
- Tools provide mock data if keys missing
- Check browser console for errors

### Voice Mode Issues
- Allow microphone permissions
- Use Chrome or Edge browser
- Check for HTTPS in production

### Location Not Detected
- Allow location permissions in browser
- Mention city explicitly in questions

For more troubleshooting, see [USER_GUIDE.md](USER_GUIDE.md#troubleshooting)

---

## 🚀 New Features & Tool System (2025)

### Universal & Local Tool Support
- AI assistant now uses real tools for weather, news, time, location, math, finance, reminders, and HTTP requests.
- Tools support both global and Indian sources (auto-detects context).
- All tool API keys and secrets are managed via `.env` and `.env.example` (see documentation).
- Environment variables are strictly validated using `env-schema` for security and reliability.
- Centralized config object for environment access throughout backend.
- Fastify `/api/tool` route exposes all tools for AI model function calling.
- Heavy tools run in child processes for performance and stability.
- All dependencies are frozen for reproducible builds.

### How to Use Tools
- The AI automatically calls tools when you ask for real-world info (weather, time, news, etc.).
- You can also call tools directly via `/api/tool` (see API docs).
- Example tool call:
  ```json
  {
    "tool": "getWeather",
    "arguments": { "city": "London" }
  }
  ```

### Environment Setup
- Copy `.env.example` to `.env` and fill in your API keys and secrets.
- All variables are documented and validated.
- Run `yarn install --frozen-lockfile` for stable dependency setup.

### Troubleshooting
- If `yarn install` fails, delete `node_modules`, `yarn.lock`, and `package-lock.json`, then run again.
- For Windows file lock errors, restart your computer and repeat the cleanup.
- Use `yarn outdated` to check for outdated packages.

---

## 🆕 Quick Reference
- All tools are ready to use via chat or API.
- See `USER_GUIDE.md` for usage details.
- See `DEVELOPER_GUIDE.md` for adding new tools and environment management.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - Local LLM inference
- [Fastify](https://www.fastify.io/) - Fast web framework
- [React](https://react.dev/) - UI library
- [MongoDB](https://www.mongodb.com/) - Database
- [Vite](https://vitejs.dev/) - Build tool

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/bobbysingh2005/chat-localhost-llama3/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bobbysingh2005/chat-localhost-llama3/discussions)
- **Email**: bobbysingh2005@gmail.com

---

## 🗺️ Roadmap

- [ ] Multi-language voice support (Hindi, Spanish, etc.)
- [ ] Web search tool integration
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)
- [ ] Plugin system for custom tools
- [ ] Collaborative chat rooms
- [ ] Export conversations (PDF, Markdown)
- [ ] Advanced analytics dashboard
- [ ] Rate limiting & security enhancements
- [ ] CI/CD pipeline with automated tests

---

**Made with ❤️ by Bobby Singh**

**Star ⭐ this repo if you find it useful!**

##test1