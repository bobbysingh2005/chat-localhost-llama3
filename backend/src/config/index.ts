import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();

export default {
    env: nodeEnv,
    isDev: nodeEnv === 'development',
    isStaging: nodeEnv === 'staging',
    isProd: nodeEnv === 'production',
    port: Number(process.env.PORT || 3000),
    secretKey: String(process.env.SECRET_KEY || 'supersecret'),
    mongoUrl: String(process.env.MONGO_URL || 'mongodb://mongo:27017/chatApp'),
    ollamaHost: String(process.env.OLLAMA_HOST || 'http://localhost:11434'),
    adminUser: String(process.env.ADMIN_USER || 'admin'),
    adminPassword: String(process.env.ADMIN_PASSWORD || 'Admin@123'),
    adminEmail: String(process.env.ADMIN_EMAIL || 'bobbysingh2005@gmail.com'),
    allowedOrigins: String(process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://localhost:5173,https://andhru.com,https://www.andhru.com,http://andhru.com'),
};