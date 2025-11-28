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
import globalNews from '../config/globalNews.json';

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
    category?: string;
  }>;
  totalResults: number;
  report?: {
    updatedCategories: string[];
    indiaFeedCount: number;
    globalFeedCount: number;
  };
}

/**
 * Get latest news articles
 */
export async function getNews(params: NewsParams): Promise<NewsResult> {
  const category = params.category || 'general';
  const country = params.country || 'us';

  // If no API key, use globalNews.json for RSS feeds
  if (!NEWS_API_KEY) {
    console.log('⚠️ NewsAPI key not configured. Using globalNews.json for RSS feeds.');
    try {
      const parser = new Parser();
      let indiaArticles: any[] = [];
      let globalArticles: any[] = [];
      let allFeeds: any[] = [];
      // Merge all feeds from globalNews.json
      for (const [cat, feeds] of Object.entries(globalNews.news_feeds)) {
        for (const feed of feeds) {
          allFeeds.push({ ...feed, category: cat });
        }
      }
      // Fetch articles for each feed
      for (const feed of allFeeds) {
        try {
          const rss = await parser.parseURL(feed.url);
          const items = rss.items.slice(0, 3).map((item: any) => ({
            title: item.title,
            description: item.contentSnippet || item.summary || '',
            url: item.link,
            source: feed.title,
            publishedAt: item.pubDate,
            category: feed.category,
          }));
          // Separate India-specific feeds
          if (feed.title.toLowerCase().includes('india')) {
            indiaArticles = indiaArticles.concat(items);
          } else {
            globalArticles = globalArticles.concat(items);
          }
        } catch (err) {
          console.error('RSS fetch error:', feed.url, (err as any).message);
        }
      }
      // Deduplicate articles by URL
      const dedup = (arr: any[]) => {
        const seen = new Set();
        return arr.filter(a => {
          if (!a.url || seen.has(a.url)) return false;
          seen.add(a.url);
          return true;
        });
      };
      indiaArticles = dedup(indiaArticles).sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
      globalArticles = dedup(globalArticles).sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
      // Filter articles by requested category/topic
      const requestedCategory = category.toLowerCase();
      const filteredIndia = indiaArticles.filter(a => (a.category || '').toLowerCase().includes(requestedCategory));
      const filteredGlobal = globalArticles.filter(a => (a.category || '').toLowerCase().includes(requestedCategory));
      const filteredArticles = [...filteredIndia, ...filteredGlobal];
      // Concise report
      const report = {
        updatedCategories: Array.from(new Set(allFeeds.map(f => f.category))),
        indiaFeedCount: filteredIndia.length,
        globalFeedCount: filteredGlobal.length,
      };
      // If no matching articles, return polite message
      if (filteredArticles.length === 0) {
        return {
          category,
          country,
          articles: [
            {
              title: 'No relevant news found',
              description: `Sorry, no news articles were found related to "${category}" in the current context. Please try a different topic or check back later.`,
            },
          ],
          totalResults: 0,
          report,
        };
      }
      // Return filtered and categorized articles
      return {
        category,
        country,
        articles: filteredArticles,
        totalResults: filteredArticles.length,
        report,
      };
    } catch (err) {
      console.error('globalNews.json error:', (err as any).message);
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
