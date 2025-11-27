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

  // Validate URL
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
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChatBot/1.0)',
      },
      maxContentLength: 1024 * 1024, // 1MB max
    });

    const html = response.data;
    
    // Basic HTML content extraction (remove tags for simple text)
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .slice(0, 5000); // Limit to first 5000 chars

    // Try to extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    return {
      url,
      title,
      content: textContent,
      success: true,
    };
  } catch (error: any) {
    console.error('Web scrape error:', error.message);
    
    return {
      url,
      content: '',
      success: false,
      error: error.message || 'Failed to fetch web page',
    };
  }
}
