import { getNews } from '../src/tools/news';

describe('getNews (India tech)', () => {
  it('should return top 5 tech news articles from India, sorted by latest', async () => {
    jest.setTimeout(15000);
    const result = await getNews({ category: 'Technology & AI', country: 'in' });
    expect(Array.isArray(result.articles)).toBe(true);
    expect(result.articles.length).toBeGreaterThan(0);
    // Check that India-specific feeds are present
    const indiaFeed = result.articles.find(a => a.source && a.source.toLowerCase().includes('india'));
    expect(indiaFeed).toBeDefined();
    // Check sorting by published date
    for (let i = 1; i < Math.min(5, result.articles.length); i++) {
      const prev = new Date(result.articles[i - 1].publishedAt || 0).getTime();
      const curr = new Date(result.articles[i].publishedAt || 0).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });
});
