/**
 * Multi-Provider News Tool
 * Supports NewsAPI and Currents API
 * Falls back to mock data if no key is provided
 */
import axios from 'axios';
import config from '../config';

export interface NewsParams {
  category?: string;
  query?: string;
  language?: string;
}

export interface NewsResult {
  provider: string;
  category?: string;
  articles: Array<{
    title: string;
    description: string;
    url?: string;
    publishedAt?: string;
    source?: string;
  }>;
  error?: string;
}

export async function getNews(params: NewsParams): Promise<NewsResult> {
  const { category = 'general', query = '', language = 'en' } = params;
  // Try NewsAPI (API key required)
  if (config.newsApiKey) {
    try {
      let url = 'https://newsapi.org/v2/top-headlines';
      let apiParams: any = { apiKey: config.newsApiKey, language };
      if (query) {
        url = 'https://newsapi.org/v2/everything';
        apiParams.q = query;
        apiParams.sortBy = 'publishedAt';
      } else {
        apiParams.category = category;
        apiParams.country = 'in';
      }
      const res = await axios.get(url, { params: apiParams, timeout: 5000 });
      const data = res.data;
      return {
        provider: 'NewsAPI',
        category,
        articles: (data.articles || []).map((a: any) => ({
          title: a.title,
          description: a.description,
          url: a.url,
          publishedAt: a.publishedAt,
          source: a.source?.name,
        })),
      };
    } catch (error: any) {
      // Fallback to next provider
    }
  }
  // Try Currents API (API key required)
  if (config.currentsApiKey) {
    try {
      const res = await axios.get('https://api.currentsapi.services/v1/latest-news', {
        params: { apiKey: config.currentsApiKey, language },
        timeout: 5000,
      });
      const data = res.data;
      return {
        provider: 'CurrentsAPI',
        category,
        articles: (data.news || []).map((a: any) => ({
          title: a.title,
          description: a.description,
          url: a.url,
          publishedAt: a.published,
          source: a.author,
        })),
      };
    } catch (error: any) {
      // Fallback to mock
    }
  }
  // Fallback to mock data
  return {
    provider: 'mock',
    category,
    articles: [
      {
        title: 'News unavailable',
        description: 'Could not fetch news articles. Please try again later.',
      },
    ],
    error: 'No news API key configured or all providers failed.',
  };
}
