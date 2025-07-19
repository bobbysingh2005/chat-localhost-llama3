import dotenv from 'dotenv';

dotenv.config();

export default {
    env: String(process.env.NODE_ENV==='development' ? 'development' : 'production'),
    port: Number(process.env.PORT || 3000),
    secretKey: String(process.env.SECRET_KEY || 'supersecret')
}