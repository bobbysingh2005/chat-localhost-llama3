import dotenv from 'dotenv';
import envSchema from 'env-schema';

dotenv.config();

const schema = {
    type: 'object',
    required: ['NODE_ENV', 'PORT', 'SECRET_KEY', 'MONGO_URL', 'OLLAMA_HOST', 'ALLOWED_ORIGINS'],
    properties: {
        NODE_ENV: { type: 'string', default: 'development' },
        PORT: { type: 'string', default: '3300' },
        SECRET_KEY: { type: 'string', default: 'supersecret' },
        JWT_SECRET: { type: 'string', default: 'supersecret' },
        CUSTOM_SECRET: { type: 'string', default: '' },
        MONGO_URL: { type: 'string', default: 'mongodb://localhost:27017/chatApp' },
        OLLAMA_HOST: { type: 'string', default: 'http://localhost:11434' },
        ADMIN_USER: { type: 'string', default: 'admin' },
        ADMIN_PASSWORD: { type: 'string', default: 'Admin@123' },
        ADMIN_EMAIL: { type: 'string', default: 'admin@example.com' },
        ALLOWED_ORIGINS: { type: 'string', default: 'http://localhost:8080,http://localhost:5173,https://andhru.com,https://www.andhru.com,http://andhru.com' },
        OPENWEATHER_API_KEY: { type: 'string', default: '' },
        WEATHERAPI_KEY: { type: 'string', default: '' },
        NEWS_API_KEY: { type: 'string', default: '' },
        COINGECKO_API_URL: { type: 'string', default: 'https://api.coingecko.com/api/v3/simple/price' },
    }
};

const config = envSchema({ schema, dotenv: true });
const nodeEnv = config.NODE_ENV.toLowerCase();

// Centralized config object for all environment variables
// Use this object throughout the app for validated env access
export default {
    env: nodeEnv,
    isDev: nodeEnv === 'development',
    isStaging: nodeEnv === 'staging',
    isProd: nodeEnv === 'production',
    port: Number(config.PORT),
    secretKey: config.SECRET_KEY,
    jwtSecret: config.JWT_SECRET,
    customSecret: config.CUSTOM_SECRET,
    mongoUrl: config.MONGO_URL,
    ollamaHost: config.OLLAMA_HOST,
    adminUser: config.ADMIN_USER,
    adminPassword: config.ADMIN_PASSWORD,
    adminEmail: config.ADMIN_EMAIL,
    allowedOrigins: config.ALLOWED_ORIGINS,
    openWeatherApiKey: config.OPENWEATHER_API_KEY,
    weatherApiKey: config.WEATHERAPI_KEY,
    newsApiKey: config.NEWS_API_KEY,
    coinGeckoApiUrl: config.COINGECKO_API_URL,
};