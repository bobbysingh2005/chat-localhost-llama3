
import buildApp from './app';
import config from './config';
import { connectToDB } from './db';
import { join } from 'path';
import { ensureAdminUser } from './models/user';

const pkg = require(join(__dirname, '..', 'package.json'));

const color = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

function printBanner(info: { port: number; env: string; mongoUrl: string; ollama: string }) {
  const pad = (s: string, l = 36) => s + ' '.repeat(Math.max(0, l - s.length));
  console.log();
  console.log(`${color.cyan}${color.bright}==============================================${color.reset}`);
  console.log(`${color.green}${color.bright}  ${pkg.name} ${color.reset}${color.dim}v${pkg.version}${color.reset}`);
  console.log(`${color.cyan}${color.bright}----------------------------------------------${color.reset}`);
  console.log(`${color.yellow}${pad('Environment:')} ${color.reset}${info.env}`);
  console.log(`${color.yellow}${pad('Server Port:')} ${color.reset}http://localhost:${info.port}`);
  console.log(`${color.yellow}${pad('MongoDB:')} ${color.reset}${info.mongoUrl}`);
  console.log(`${color.yellow}${pad('Ollama:')} ${color.reset}${info.ollama}`);
  console.log(`${color.cyan}${color.bright}==============================================${color.reset}`);
  console.log();
}


const start = async () => {
  const app = buildApp();
  try {
    await connectToDB();
    await ensureAdminUser(); // Ensure admin user exists before server starts
    const address = await app.listen({ port: config.port, host: '0.0.0.0' });

    // address may be string or object depending on Fastify; normalize
    const port = config.port;
    printBanner({ port, env: config.env, mongoUrl: config.mongoUrl, ollama: config.ollamaHost });

    // Also log Fastify's own message for completeness
    console.log(`🚀 Server running at ${address}`);
  } catch (err) {
    if (app && typeof app.log !== 'undefined') {
      app.log.error(err);
    } else {
      console.error('Startup failed:', err);
    }
    process.exit(1);
  }
};

start();
