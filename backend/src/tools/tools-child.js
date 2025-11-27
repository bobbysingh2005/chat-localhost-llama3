// tools-child.js
// Child process handler for heavy tool calls
// Receives toolName and args, runs tool, sends result back to parent

const tools = require('./tools');

process.on('message', async ({ toolName, args }) => {
  try {
    if (typeof tools[toolName] === 'function') {
      const result = await tools[toolName](...Object.values(args));
      process.send(result);
    } else {
      process.send({ error: 'Tool not found', toolName });
    }
  } catch (err) {
    process.send({ error: err.message, toolName });
  }
});
