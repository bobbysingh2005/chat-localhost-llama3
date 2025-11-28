/**
 * Weather Tool
 * 
 * Fetches current weather information using OpenWeatherMap API
 * Falls back to mock data if API key is not configured
 */

import axios from 'axios';
import config from '../config';

const OPENWEATHER_API_KEY = config.openWeatherApiKey || '';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface WeatherParams {
  location: string;
}

interface WeatherResult {
  location: string;
  temperature: number;
  feels_like: number;
  description: string;
  humidity: number;
  wind_speed: number;
  unit: string;
}

/**
 * Get current weather for a location
 */
export async function getWeather(params: WeatherParams): Promise<WeatherResult> {
  const { location } = params;

  // If no API key, return mock data
  if (!OPENWEATHER_API_KEY) {
    console.log('⚠️ OpenWeatherMap API key not configured. Using mock data.');
    return {
      location,
      temperature: 22,
      feels_like: 21,
      description: 'Partly cloudy',
      humidity: 65,
      wind_speed: 3.5,
      unit: 'celsius',
    };
  }

  try {
    const response = await axios.get(OPENWEATHER_BASE_URL, {
      params: {
        q: location,
        appid: OPENWEATHER_API_KEY,
        units: 'metric', // Use Celsius
      },
      timeout: 5000,
    });

    const data = response.data;

    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      unit: 'celsius',
    };
  } catch (error: any) {
    console.error('Weather API error:', error.message);
    
    // Return mock data as fallback
    return {
      location,
      temperature: 22,
      feels_like: 21,
      description: 'Weather data unavailable',
      humidity: 65,
      wind_speed: 3.5,
      unit: 'celsius',
    };
  }
}
