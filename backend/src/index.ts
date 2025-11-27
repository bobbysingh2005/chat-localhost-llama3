import buildApp from './app';
import config from './config';
import { connectToDB } from './config/db';
import { join } from 'path';
import { ensureAdminUser } from './models/user';

const pkg = require(join(__dirname, '..', 'package.json'));

function printBanner(info: { port: number; env: string; mongoUrl: string; ollama: string; adminEmail: string; allowedOrigins: string }) {
  // Simple, clean format for VI developers (Morgan-tiny style, no colors)
  console.log();
  console.log(`[${pkg.name} v${pkg.version}] Starting...`);
  console.log(`Environment: ${info.env.toUpperCase()} | Node: ${process.version}`);
  console.log(`Server: http://localhost:${info.port}`);
  console.log(`MongoDB: ${info.mongoUrl}`);
  console.log(`Ollama: ${info.ollama}`);
  console.log(`Admin: ${info.adminEmail}`);
  console.log(`CORS: ${info.allowedOrigins.split(',').length} origins`);
  console.log(`Ready. Waiting for requests...`);
  console.log();
}


const start = async () => {
  const app = buildApp();
  try {
    console.log('Initializing backend services...');
    
    await connectToDB();
    await ensureAdminUser(); // Ensure admin user exists before server starts
    
    await app.listen({ port: config.port, host: '0.0.0.0' });

    printBanner({ 
      port: config.port, 
      env: config.env, 
      mongoUrl: config.mongoUrl, 
      ollama: config.ollamaHost,
      adminEmail: config.adminEmail,
      allowedOrigins: config.allowedOrigins
    });
  } catch (err) {
    console.log();
    console.log('STARTUP FAILED');
    
    if (app && typeof app.log !== 'undefined') {
      app.log.error(err);
    } else {
      console.error('Error:', err);
    }
    console.log();
    process.exit(1);
  }
};

start();
