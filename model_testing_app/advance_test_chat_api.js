// Endpoint Testing Script for /api/chat
// Usage: node testingapp.js


const prompts = [
  'Hello, how are you?',
  'Summarize the latest news about AI.',
  'What is the weather in London?',
  'Write a short story about a robot.',
  'Explain quantum computing in simple terms.',
  'Translate "Good morning" to French.',
  'What are the main causes of slow AI model inference?',
];

// Safe URLs for scraping tests
const testUrls = [
  { url: 'https://example.com/', purpose: 'Basic HTML structure: <title>, <p>, headings' },
  { url: 'https://httpbin.org/html', purpose: 'HTML parsing: <h1>, <p> elements' },
  { url: 'https://www.w3schools.com/html/html_examples.asp', purpose: 'Multiple headings (h1, h2), paragraphs, tables' },
  { url: 'https://www.w3schools.com/html/tryit.asp?filename=tryhtml_basic', purpose: 'Nested <div> and <article> extraction' },
  { url: 'http://localhost:3000/test.html', purpose: 'Local controlled page for stress testing' },
];

const API_URL = process.env.TEST_API_URL || 'http://localhost:3300/api/chat';
const MODEL = process.env.TEST_MODEL || 'qwen3:0.6b';

// -------------------- AI Prompt Test --------------------
async function testPrompt(prompt) {
  const body = { model: MODEL, messages: [{ role: 'user', content: prompt }], stream: false, temperature: 0.7, max_tokens: 512 };
  const start = Date.now();
  try {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await res.text();
    const elapsed = Date.now() - start;
    console.log(`Prompt: ${prompt}`);
    console.log(`Response time: ${(elapsed / 1000).toFixed(2)}s`);
    if (elapsed > 3000) console.log('⚠️ SLOW RESPONSE');
    console.log('Response:', text.slice(0, 300));
    console.log('---');
    return elapsed;
  } catch (err) {
    console.error('Error:', err.message);
    return null;
  }
}

// -------------------- Scraping Test via API --------------------
async function testScrapingEndpoint() {
  for (const test of testUrls) {
    console.log(`Testing URL: ${test.url}`);
    console.log(`Purpose: ${test.purpose}`);
    const body = { model: MODEL, messages: [{ role: 'user', content: `Scrape the page: ${test.url}` }], stream: false, temperature: 0, max_tokens: 1024 };
    const start = Date.now();
    try {
      const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const text = await res.text();
      const elapsed = Date.now() - start;
      console.log(`Elapsed time: ${(elapsed / 1000).toFixed(2)}s`);
      console.log('Scraping Response snippet:', text.slice(0, 300));
    } catch (err) {
      console.error('Error:', err.message);
    }
    console.log('---');
  }
}

// -------------------- Run Tests --------------------
async function runTests() {
  console.log('=== Running AI Prompts ===');
  let slowCount = 0;
  for (const prompt of prompts) {
    const time = await testPrompt(prompt);
    if (time > 3000) slowCount++;
  }
  console.log(`Total slow AI responses (>3s): ${slowCount} / ${prompts.length}`);
  
  console.log('\n=== Running Scraping Tests via Endpoint ===');
  await testScrapingEndpoint();
}

runTests();
