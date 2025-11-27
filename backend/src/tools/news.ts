/**
 * News Tool
 * 
 * Fetches latest news using NewsAPI or other news sources
 * Falls back to mock data if API key is not configured
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/top-headlines';

interface NewsParams {
  category?: string;
  country?: string;
}

interface NewsResult {
  category: string;
  country: string;
  articles: Array<{
    title: string;
    description: string;
    url?: string;
    source?: string;
    publishedAt?: string;
  }>;
  totalResults: number;
}

/**
 * Get latest news articles
 */
export async function getNews(params: NewsParams): Promise<NewsResult> {
  const category = params.category || 'general';
  const country = params.country || 'us';

  // If no API key, use sources.json for RSS feeds
  if (!NEWS_API_KEY) {
    console.log('⚠️ NewsAPI key not configured. Using sources.json for RSS feeds.');
    try {
      const sourcesPath = path.resolve(__dirname, '../config/sources.json');
      const sourcesRaw = fs.readFileSync(sourcesPath, 'utf-8');
      const sources = JSON.parse(sourcesRaw);
      const feeds = sources.news_feeds[category] || sources.news_feeds['IT & Technology'] || [];
      const parser = new Parser();
      let articles: any[] = [];
      for (const feed of feeds.slice(0, 2)) { // Limit to 2 feeds for speed
        try {
          const rss = await parser.parseURL(feed.url);
          articles = articles.concat(
            rss.items.slice(0, 3).map((item: any) => ({
              title: item.title,
              description: item.contentSnippet || item.summary || '',
              url: item.link,
              source: feed.title,
              publishedAt: item.pubDate,
            }))
          );
        } catch (err) {
          console.error('RSS fetch error:', feed.url, (err as any).message);
        }
      }
      if (articles.length === 0) {
        articles.push({
          title: 'No news available',
          description: 'Unable to fetch news from RSS sources.',
        });
      }
      return {
        category,
        country,
        articles,
        totalResults: articles.length,
      };
    } catch (err) {
      console.error('sources.json error:', (err as any).message);
      return {
        category,
        country,
        articles: [
          {
            title: 'News unavailable',
            description: 'Unable to fetch news at this time. Please try again later.',
          },
        ],
        totalResults: 1,
      };
    }
  }

  try {
    const response = await axios.get(NEWS_API_BASE_URL, {
      params: {
        apiKey: NEWS_API_KEY,
        category,
        country,
        pageSize: 5,
      },
      timeout: 5000,
    });

    const data = response.data;

    return {
      category,
      country,
      articles: data.articles.map((article: any) => ({
        title: article.title,
        description: article.description || '',
        url: article.url,
        source: article.source?.name,
        publishedAt: article.publishedAt,
      })),
      totalResults: data.totalResults,
    };
  } catch (error: any) {
    console.error('News API error:', error.message);
    
    // Return mock data as fallback
    return {
      category,
      country,
      articles: [
        {
          title: 'News unavailable',
          description: 'Unable to fetch news at this time. Please try again later.',
        },
      ],
      totalResults: 1,
    };
  }
}
