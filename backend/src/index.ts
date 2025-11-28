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


const { setupWebSocket } = require('./ws');

const start = async () => {
  const app = buildApp();
  try {
    console.log('Initializing backend services...');
    await connectToDB();
    await ensureAdminUser();

    const server = await app.listen({ port: config.port, host: '0.0.0.0' });
    // Fastify v4: .server property is not available, use returned server directly
    setupWebSocket(app.server);

    // Start reminder cron job for scheduled reminders
    require('./jobs/reminder-cron').startReminderCron(app);

    printBanner({ 
      port: config.port, 
      env: config.env, 
      mongoUrl: String(config.mongoUrl), 
      ollama: String(config.ollamaHost),
      adminEmail: String(config.adminEmail),
      allowedOrigins: String(config.allowedOrigins)
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
