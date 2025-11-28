/**
 * Web Search Tool
 * 
 * Searches the web using DuckDuckGo or other search APIs
 * Falls back to mock data if no API is configured
 */

import axios from 'axios';

interface SearchParams {
  query: string;
}

interface SearchResult {
  query: string;
  results: Array<{
    title: string;
    snippet: string;
    url?: string;
  }>;
  source: string;
}

/**
 * Search the web for information
 */
export async function searchWeb(params: SearchParams): Promise<SearchResult> {
  const { query } = params;
  // DuckDuckGo Instant Answer API integration
  // Returns top result for the query
  try {
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
      },
      timeout: 5000,
    });
    const data = response.data;
    // Format results
    return {
      query,
      results: [
        {
          title: data.Heading || 'Search Results',
          snippet: data.AbstractText || 'No results found',
          url: data.AbstractURL || '',
        },
      ],
      source: 'DuckDuckGo',
    };
  } catch (error: any) {
    // Fallback to mock result if API fails
    console.error('Web search error:', error.message);
    return {
      query,
      results: [
        {
          title: 'Search unavailable',
          snippet: `Could not fetch results for "${query}". Please try again later.`,
        },
      ],
      source: 'error',
    };
  }
}
