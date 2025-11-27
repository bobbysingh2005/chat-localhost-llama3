// tools-runner.ts
// Centralized tool runner for AI assistant backend
// Uses child_process for heavy tool calls, avoids blocking main thread
// Each tool is documented for clarity and maintainability

import { fork } from 'child_process';
import path from 'path';

// List of supported tools and their argument schemas
export const toolList = {
  getCurrentDate: {},
  getCurrentTime: {},
  getNextMonday: {},
  parseNaturalDate: { text: 'string' },
  getWeather: { city: 'string' },
  getLatestNews: { topic: 'string' },
  getUserLocation: { ip: 'string' },
  getCoordinates: { city: 'string' },
  calculate: { expression: 'string' },
  convertCurrency: { amount: 'number', from: 'string', to: 'string' },
  setReminder: { text: 'string', datetime: 'string' },
  setTimer: { seconds: 'number' },
  getStockPrice: { symbol: 'string' },
  getCryptoPrice: { token: 'string' },
  fetchUrl: { url: 'string' }
};

/**
 * Runs a tool in a child process for performance and isolation.
 * @param {string} toolName - Name of the tool to run
 * @param {object} args - Arguments for the tool
 * @returns {Promise<any>} - Resolves with tool result or error
 */
export function runTool(toolName: string, args: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // Only spawn child for heavy tools
    const heavyTools = ['getWeather', 'getLatestNews', 'getStockPrice', 'getCryptoPrice', 'fetchUrl', 'getCoordinates'];
    if (heavyTools.includes(toolName)) {
      const child = fork(path.join(__dirname, 'tools-child.js'));
      child.send({ toolName, args });
      child.on('message', (result) => {
        child.kill();
        resolve(result);
      });
      child.on('error', (err) => {
        child.kill();
        reject(err);
      });
    } else {
      // Lightweight tools run in main process
      import('./tools').then(tools => {
        if (typeof tools[toolName] === 'function') {
          Promise.resolve(tools[toolName](...Object.values(args))).then(resolve).catch(reject);
        } else {
          reject(new Error('Tool not found'));
        }
      });
    }
  });
}

// Example usage:
// runTool('getWeather', { city: 'London' }).then(console.log);
