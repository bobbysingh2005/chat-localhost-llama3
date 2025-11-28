/**
 * Multi-Provider Weather Tool
 * Supports Open-Meteo (no key), OpenWeatherMap, WeatherAPI
 * Falls back to Open-Meteo if no key is provided
 */
import axios from 'axios';
import config from '../config';

export interface WeatherParams {
  location?: string; // City name or coordinates
  latitude?: number;
  longitude?: number;
}

export interface WeatherResult {
  provider: string;
  location: string;
  temperature: number;
  description: string;
  humidity?: number;
  wind_speed?: number;
  unit: string;
  error?: string;
}

// Helper: Get coordinates for a city (simple geocoding)
async function getCoordinates(city: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: city, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'PersonalAssistant/1.0' },
    });
    if (res.data && res.data.length > 0) {
      return {
        latitude: parseFloat(res.data[0].lat),
        longitude: parseFloat(res.data[0].lon),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getWeather(params: WeatherParams): Promise<WeatherResult> {
  let { location, latitude, longitude } = params;
  // If location is provided, get coordinates
  if (location && (!latitude || !longitude)) {
    const coords = await getCoordinates(location);
    if (coords) {
      latitude = coords.latitude;
      longitude = coords.longitude;
    }
  }
  // Default to Ahmedabad if nothing provided
  if (!latitude || !longitude) {
    latitude = 23.03;
    longitude = 72.58;
    location = location || 'Ahmedabad';
  }
  // Try OpenWeatherMap (API key required)
  if (config.openWeatherApiKey) {
    try {
      const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: location,
          appid: config.openWeatherApiKey,
          units: 'metric',
        },
        timeout: 5000,
      });
      const data = res.data;
      return {
        provider: 'OpenWeatherMap',
        location: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        unit: 'celsius',
      };
    } catch (error: any) {
      // Fallback to next provider
    }
  }
  // Try WeatherAPI (API key required)
  if (config.weatherApiKey) {
    try {
      const res = await axios.get('https://api.weatherapi.com/v1/current.json', {
        params: {
          key: config.weatherApiKey,
          q: location,
        },
        timeout: 5000,
      });
      const data = res.data;
      return {
        provider: 'WeatherAPI',
        location: data.location.name,
        temperature: Math.round(data.current.temp_c),
        description: data.current.condition.text,
        humidity: data.current.humidity,
        wind_speed: data.current.wind_kph,
        unit: 'celsius',
      };
    } catch (error: any) {
      // Fallback to next provider
    }
  }
  // Use Open-Meteo (no key required)
  try {
    const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current_weather: true,
      },
      timeout: 5000,
    });
    const data = res.data;
    return {
      provider: 'Open-Meteo',
      location: location || `${latitude},${longitude}`,
      temperature: data.current_weather.temperature,
      description: 'Current weather',
      wind_speed: data.current_weather.windspeed,
      unit: 'celsius',
    };
  } catch (error: any) {
    return {
      provider: 'none',
      location: location || `${latitude},${longitude}`,
      temperature: 0,
      description: 'Weather data unavailable',
      unit: 'celsius',
      error: error.message || 'Failed to fetch weather',
    };
  }
}
