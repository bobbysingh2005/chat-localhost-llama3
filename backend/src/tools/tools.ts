import dayjs from 'dayjs';
import { DateTime } from 'luxon';
import chrono from 'chrono-node';
import openweather from 'openweather-apis';
import axios from 'axios';
import NewsAPI from 'newsapi';
import geoip from 'geoip-lite';
import NodeGeocoder from 'node-geocoder';
import math from 'mathjs';
import CurrencyConverter from 'currency-converter-lt';
import schedule from 'node-schedule';
import yahooFinance from 'yahoo-finance2';

// You should set your API keys in environment variables
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

// 1. DATE & TIME TOOLS
export function getCurrentDate() {
  // Universal date and IST
  return {
    date: dayjs().format('YYYY-MM-DD'),
    ist: DateTime.now().setZone('Asia/Kolkata').toFormat('yyyy-MM-dd')
  };
}
export function getCurrentTime() {
  // Universal time and IST
  return {
    time: dayjs().format('HH:mm:ss'),
    ist: DateTime.now().setZone('Asia/Kolkata').toFormat('HH:mm:ss')
  };
}
export function getNextMonday() {
  const nextMonday = dayjs().day(8);
  return {
    nextMonday: nextMonday.format('YYYY-MM-DD'),
    ist: DateTime.now().setZone('Asia/Kolkata').plus({ days: (8 - DateTime.now().weekday) % 7 }).toFormat('yyyy-MM-dd')
  };
}
export function parseNaturalDate(text: string) {
  const result = chrono.parseDate(text);
  return {
    parsed: result ? dayjs(result).format('YYYY-MM-DD HH:mm:ss') : null,
    ist: result ? DateTime.fromJSDate(result).setZone('Asia/Kolkata').toFormat('yyyy-MM-dd HH:mm:ss') : null
  };
}

// 2. WEATHER TOOL
export async function getWeather(city: string) {
  // If city is in India, try WeatherAPI.com first
  const indianCities = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Ahmedabad', 'Pune', 'Surat', 'Jaipur', 'Lucknow', 'Vadodara'];
  const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY || '';
  const WEATHERAPI_URL = 'http://api.weatherapi.com/v1/current.json';
  if (WEATHERAPI_KEY && indianCities.some(c => city.toLowerCase().includes(c.toLowerCase()))) {
    try {
      const res = await axios.get(WEATHERAPI_URL, { params: { key: WEATHERAPI_KEY, q: city } });
      const w = res.data.current;
      return { city, temp: w.temp_c, feels_like: w.feelslike_c, humidity: w.humidity, description: w.condition.text };
    } catch (e) {
      // fallback to OpenWeatherMap
    }
  }
  if (!OPENWEATHER_API_KEY) {
    return { error: 'API key not configured', mock: true, city, temp: 22, feels_like: 21, humidity: 65, description: 'partly cloudy' };
  }
  openweather.setAPPID(OPENWEATHER_API_KEY);
  openweather.setCity(city);
  openweather.setUnits('metric');
  return new Promise((resolve) => {
    openweather.getAllWeather((err: any, res: any) => {
      if (err) return resolve({ error: err.message });
      resolve({ city, temp: res.main.temp, feels_like: res.main.feels_like, humidity: res.main.humidity, description: res.weather[0].description });
    });
  });
}

// 3. NEWS TOOL
export async function getLatestNews(topic: string) {
  // If topic is India or Indian news, use Inshorts or TOI RSS
  const INSHORTS_API = 'https://inshortsapi.vercel.app/news?category=national';
  const TOI_RSS = 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms';
  if (topic.toLowerCase().includes('india') || topic.toLowerCase().includes('indian')) {
    try {
      const res = await axios.get(INSHORTS_API);
      const headlines = res.data.data.map((a: any) => a.title);
      return { topic, headlines };
    } catch (e) {
      // fallback to TOI RSS
      try {
        const rss = await axios.get(TOI_RSS);
        // Simple RSS parsing (for demo)
        const matches = rss.data.match(/<title>(.*?)<\/title>/g);
        const headlines = matches ? matches.slice(2, 7).map((t: string) => t.replace(/<\/?title>/g, '')) : [];
        return { topic, headlines };
      } catch (e2) {
        // fallback to NewsAPI
      }
    }
  }
  const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
  if (!NEWS_API_KEY) {
    return { error: 'API key not configured', mock: true, topic, headlines: ['Example headline 1', 'Example headline 2'] };
  }
  const newsapi = new NewsAPI(NEWS_API_KEY);
  const res = await newsapi.v2.everything({ q: topic, language: 'en', sortBy: 'publishedAt', pageSize: 5 });
  return { topic, headlines: res.articles.map((a: any) => a.title) };
}

// 4. LOCATION / GEO TOOL
export function getUserLocation(ip: string) {
  const geo = geoip.lookup(ip);
  // If location is India, add extra info
  if (geo && geo.country === 'IN') {
    return { ip, city: geo.city, country: geo.country, ll: geo.ll, region: 'India' };
  }
  return geo ? { ip, city: geo.city, country: geo.country, ll: geo.ll } : { error: 'Location not found', ip };
}
export async function getCoordinates(city: string) {
  // For Indian cities, use OpenStreetMap and fallback to static data if needed
  const geocoder = NodeGeocoder({ provider: 'openstreetmap' });
  let res = await geocoder.geocode(city);
  if ((!res || res.length === 0) && city.toLowerCase().includes('delhi')) {
    // fallback static
    return { city, lat: 28.6139, lng: 77.2090 };
  }
  if (res && res.length > 0) {
    return { city, lat: res[0].latitude, lng: res[0].longitude };
  }
  return { error: 'Coordinates not found', city };
}

// 5. MATH / CONVERSION TOOLS
export function calculate(expression: string) {
  try {
    return { expression, result: math.evaluate(expression) };
  } catch (e) {
    return { error: 'Invalid expression', expression };
  }
}
export async function convertCurrency(amount: number, from: string, to: string) {
  const cc = new CurrencyConverter({ from, to, amount });
  try {
    const result = await cc.convert();
    return { amount, from, to, result };
  } catch (e) {
    return { error: 'Conversion failed', amount, from, to };
  }
}

// 6. CALENDAR & REMINDER TOOLS
export function setReminder(text: string, datetime: string) {
  const job = schedule.scheduleJob(datetime, () => {
    // In real use, trigger notification or callback
    console.log('Reminder:', text);
  });
  return { text, datetime, scheduled: !!job };
}
export function setTimer(seconds: number) {
  setTimeout(() => {
    console.log('Timer finished:', seconds);
  }, seconds * 1000);
  return { seconds, started: true };
}

// 7. STOCK & CRYPTO PRICE TOOLS
export async function getStockPrice(symbol: string) {
  try {
    const quote = await yahooFinance.quote(symbol);
    return { symbol, price: quote.regularMarketPrice };
  } catch (e) {
    return { error: 'Stock price not found', symbol };
  }
}
export async function getCryptoPrice(token: string) {
  try {
    const res = await axios.get(COINGECKO_API_URL, { params: { ids: token, vs_currencies: 'usd' } });
    return { token, price: res.data[token]?.usd };
  } catch (e) {
    return { error: 'Crypto price not found', token };
  }
}

// 8. GENERAL HTTP TOOL
export async function fetchUrl(url: string) {
  try {
    const res = await axios.get(url);
    return { url, status: res.status, data: res.data };
  } catch (e) {
    return { error: 'Fetch failed', url };
  }
}
