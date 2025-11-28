import { getWeather } from './weather-apis';

/**
 * Compare weather for multiple cities and summarize results.
 * @param {string[]} cities - Array of city names (e.g., ['Toronto, Canada', 'Delhi, India'])
 * @returns {Promise<{summary: string, results: Array<{city: string, temp: number, unit: string}>}>}
 */
export async function compareWeather(cities: string[]) {
  const results = [];
  for (const city of cities) {
    const weather = await getWeather(city);
    if (weather && weather.temp) {
      results.push({ city, temp: weather.temp, unit: weather.unit || '°C' });
    }
  }
  if (results.length === 0) {
    return { summary: 'No valid weather data found.', results };
  }
  // Find highest and lowest
  const sorted = [...results].sort((a, b) => b.temp - a.temp);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const summary = `Highest temperature: ${highest.city} (${highest.temp}${highest.unit}). Lowest: ${lowest.city} (${lowest.temp}${lowest.unit}).`;
  return { summary, results };
}
