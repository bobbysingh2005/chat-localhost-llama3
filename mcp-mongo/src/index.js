// index.js
import mongoose from "mongoose";
import readline from "readline";
import { tools } from "./tools/userTools.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongodb:27017/myapp";

// Connect to MongoDB
await mongoose.connect(MONGO_URI);
console.log("✅ MCP Mongo Server connected to DB");

// Setup JSON-RPC loop over stdin/stdout
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", async (line) => {
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    if (tools[method]) {
      const result = await tools[method](params);
      process.stdout.write(JSON.stringify({ id, result }) + "\n");
    } else {
      process.stdout.write(
        JSON.stringify({ id, error: "Unknown method" }) + "\n"
      );
    }
  } catch (err) {
    process.stdout.write(
      JSON.stringify({ error: err.message }) + "\n"
    );
  }
});
