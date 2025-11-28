/**
 * Web Scraping Tool
 * 
 * Extracts content from web pages
 * Uses axios for fetching and basic HTML parsing
 */

import axios from 'axios';

interface WebScrapeParams {
  url: string;
}

interface WebScrapeResult {
  url: string;
  title?: string;
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Scrape content from a web page
 */
export async function webScrape(params: WebScrapeParams): Promise<WebScrapeResult> {
  const { url } = params;
  // Validate URL format
  try {
    new URL(url);
  } catch (err) {
    return {
      url,
      content: '',
      success: false,
      error: 'Invalid URL provided',
    };
  }
  try {
    // Attempt to fetch the web page
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChatBot/1.0)',
      },
      maxContentLength: 1024 * 1024, // 1MB max
    });
    const html = response.data;
    // Remove scripts and styles, extract text
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;
    return {
      url,
      title,
      content: textContent,
      success: true,
    };
  } catch (error: any) {
    // Enhanced error handling for DNS and network errors
    let errorMsg = error.message || 'Failed to fetch web page';
    if (error.code === 'ENOTFOUND' || errorMsg.includes('ENOTFOUND')) {
      errorMsg = 'Domain not found or unreachable.';
    } else if (error.code === 'ETIMEDOUT' || errorMsg.includes('timeout')) {
      errorMsg = 'Request timed out.';
    }
    console.error('Web scrape error:', errorMsg);
    return {
      url,
      content: '',
      success: false,
      error: errorMsg,
    };
  }
}
