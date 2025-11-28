// src/tools/webTools.ts
import axios from 'axios';
import cheerio from 'cheerio';
import { spawn } from 'child_process';

/**
 * DuckDuckGo Web Search (HTML scraping, no API)
 */
export async function searchWeb(query: string): Promise<Array<{ title: string; url: string; description: string }>> {
  await new Promise(res => setTimeout(res, 1000)); // Rate limit: 1s delay
  const endpoint = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CopilotBot/1.0)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 7000,
    });
    const $ = cheerio.load(data);
    const results: Array<{ title: string; url: string; description: string }> = [];
    $('.result').each((_, el) => {
      const title = $(el).find('.result__title').text().trim();
      let url = $(el).find('.result__url').attr('href') || '';
      if (url && !url.startsWith('http')) url = 'https://' + url.replace(/^\//, '');
      const description = $(el).find('.result__snippet').text().trim();
      if (title && url) results.push({ title, url, description });
      if (results.length >= 5) return false;
    });
    // Captcha/blocked fallback
    if (results.length === 0 && $('form[action*="captcha"]').length) {
      return [{ title: 'Blocked', url: '', description: 'DuckDuckGo search was blocked by captcha.' }];
    }
    return results;
  } catch (err: any) {
    console.error('searchWeb error:', err);
    return [{ title: 'Error', url: '', description: 'Network error or search failed. Please check your query or try again later.' }];
  }
}

/**
 * Web Scraping (axios + cheerio)
 */
export async function scrapeWebsite(url: string): Promise<{ title: string; description: string; headings: string[]; text: string }> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CopilotBot/1.0)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });
    const $ = cheerio.load(data);
    // Remove unwanted tags
    $('script, style, noscript').remove();
    // Extract title
    const title = $('title').first().text().trim();
    // Extract meta description
    const description = $('meta[name="description"]').attr('content')?.trim() || '';
    // Extract headings
    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt) headings.push(txt);
    });
    // Extract readable text
    let text = '';
    $('article, p, div').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt.length > 40) text += txt + '\n';
    });
    text = text.replace(/\s+/g, ' ').trim();
    return { title, description, headings, text };
  } catch (err: any) {
    console.error('scrapeWebsite error:', err);
    return { title: '', description: '', headings: [], text: 'Unable to scrape this page. Please check the URL or try again later.' };
  }
}

/**
 * Combined Search + Scrape
 */
export async function searchAndScrape(query: string): Promise<{ query: string; foundUrl: string; pageTitle: string; extractedText: string }> {
  try {
    const results = await searchWeb(query);
    const first = results.find(r => r.url && r.url.startsWith('http'));
    if (!first) {
      return { query, foundUrl: '', pageTitle: '', extractedText: 'No valid search result found.' };
    }
    const scraped = await scrapeWebsite(first.url);
    return {
      query,
      foundUrl: first.url,
      pageTitle: scraped.title,
      extractedText: scraped.text,
    };
  } catch (err) {
    console.error('searchAndScrape error:', err);
    return { query, foundUrl: '', pageTitle: '', extractedText: 'Search and scrape failed. Please try again later.' };
  }
}

/**
 * Ollama AI Integration (child_process)
 */
export async function askOllama(promptText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ollama', ['run', 'llama3.2:1b']);
    let output = '';
    proc.stdin.write(promptText + '\n');
    proc.stdin.end();
    proc.stdout.on('data', data => { output += data.toString(); });
    proc.stderr.on('data', data => { output += data.toString(); });
    proc.on('close', () => resolve(output.trim()));
    proc.on('error', err => reject(err));
  });
}
