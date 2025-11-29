// src/tools/webTools.ts
import axios from 'axios';
import cheerio from 'cheerio';
import { spawn } from 'child_process';

/**
 * DuckDuckGo Web Search (HTML scraping, no API)
 */
export async function searchWeb(
  query: string,
  delayMs: number = 1000
): Promise<Array<{ title: string; url: string; description: string }>> {
  const startTotal = Date.now();

  // Configurable rate limit delay
  if (delayMs > 0) {
    const startDelay = Date.now();
    await new Promise(res => setTimeout(res, delayMs));
    console.log(`searchWeb: Rate limit delay ${Date.now() - startDelay}ms`);
  }

  const endpoint = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    // Network request timing
    const startNetwork = Date.now();
    const { data } = await axios.get(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CopilotBot/1.0)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 7000,
    });
    console.log(`searchWeb: Network request ${Date.now() - startNetwork}ms`);

    // HTML parsing timing
    const startParse = Date.now();
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
    console.log(`searchWeb: HTML parsing ${Date.now() - startParse}ms`);
    console.log(`searchWeb: Total time ${Date.now() - startTotal}ms`);

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
  const startTotal = Date.now();
  try {
    // Network request timing
    const startNetwork = Date.now();
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CopilotBot/1.0)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });
    console.log(`scrapeWebsite: Network request ${Date.now() - startNetwork}ms`);

    // HTML parsing and extraction timing
    const startParse = Date.now();
    const $ = cheerio.load(data);
    $('script, style, noscript').remove();
    const title = $('title').first().text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || '';
    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt) headings.push(txt);
    });
    let text = '';
    $('article, p, div').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt.length > 40) text += txt + '\n';
    });
    text = text.replace(/\s+/g, ' ').trim();
    console.log(`scrapeWebsite: HTML parsing and extraction ${Date.now() - startParse}ms`);
    console.log(`scrapeWebsite: Total time ${Date.now() - startTotal}ms`);

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
  const startTotal = Date.now();
  try {
    // Timing searchWeb
    const startSearch = Date.now();
    const results = await searchWeb(query);
    console.log(`searchAndScrape: searchWeb ${Date.now() - startSearch}ms`);

    const first = results.find(r => r.url && r.url.startsWith('http'));
    if (!first) {
      console.log(`searchAndScrape: No valid search result found. Total time ${Date.now() - startTotal}ms`);
      return { query, foundUrl: '', pageTitle: '', extractedText: 'No valid search result found.' };
    }

    // Timing scrapeWebsite
    const startScrape = Date.now();
    const scraped = await scrapeWebsite(first.url);
    console.log(`searchAndScrape: scrapeWebsite ${Date.now() - startScrape}ms`);
    console.log(`searchAndScrape: Total time ${Date.now() - startTotal}ms`);

    return {
      query,
      foundUrl: first.url,
      pageTitle: scraped.title,
      extractedText: scraped.text,
    };
  } catch (err) {
    console.error('searchAndScrape error:', err);
    console.log(`searchAndScrape: Error. Total time ${Date.now() - startTotal}ms`);
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
