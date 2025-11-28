// Model Testing Script for /api/chat
// Usage: node test_chat_api.js

// const fetch = require('node-fetch');
const prompts = [
  'Hello, how are you?',
  'Summarize the latest news about AI.',
  'What is the weather in London?',
  'Write a short story about a robot.',
  'Explain quantum computing in simple terms.',
  'Translate "Good morning" to French.',
  'What are the main causes of slow AI model inference?',
];

const API_URL = process.env.TEST_API_URL || 'http://localhost:3300/api/chat';
// const MODEL = process.env.TEST_MODEL || 'qwen3:0.6b';
// const MODEL = process.env.TEST_MODEL || 'qwen3:1.7b';
// const MODEL = process.env.TEST_MODEL || 'qwen3:4b';

async function testPrompt(prompt) {
  const body = {
    model: MODEL,
    messages: [
      { role: 'user', content: prompt }
    ],
    stream: false,
    temperature: 0.7,
    max_tokens: 512
  };
  const start = Date.now();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    const elapsed = Date.now() - start;
    const readableTime = elapsed >= 1000
      ? `${(elapsed / 1000).toFixed(2)} seconds`
      : `${elapsed} ms`;
    console.log(`Prompt: ${prompt}`);
    console.log(`Response time: ${readableTime}`);
    if (elapsed > 3000) {
      console.log('⚠️ SLOW RESPONSE');
    }
    console.log('Response:', text.slice(0, 300));
    console.log('---');
    return elapsed;
  } catch (err) {
    console.error('Error:', err.message);
    return null;
  }
}

async function runTests() {
  let slowCount = 0;
  for (const prompt of prompts) {
    const time = await testPrompt(prompt);
    if (time > 3000) slowCount++;
  }
  console.log(`Total slow responses (>3s): ${slowCount} / ${prompts.length}`);
}

runTests();
