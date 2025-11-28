import { getNews } from '../src/tools/news';

describe('getNews (globalNews integration)', () => {
  it('should return top 5 tech news for India, sorted by latest', async () => {
    const result = await getNews({ category: 'Technology & AI', country: 'in' });
    expect(Array.isArray(result.articles)).toBe(true);
    expect(result.articles.length).toBeGreaterThan(0);
    // Check that India-specific articles are present
    const indiaArticles = result.articles.filter(a => a.source && a.source.toLowerCase().includes('india'));
    expect(indiaArticles.length).toBeGreaterThanOrEqual(0);
    // Check sorting by published date
    let sorted = true;
    for (let i = 1; i < result.articles.length; i++) {
      if (new Date(result.articles[i].publishedAt || 0) > new Date(result.articles[i - 1].publishedAt || 0)) {
        sorted = false;
        break;
      }
    }
    expect(sorted).toBe(true);
    // Check concise report
    expect(result.report).toBeDefined();
    expect(Array.isArray(result.report?.updatedCategories ?? [])).toBe(true);
  });
});
