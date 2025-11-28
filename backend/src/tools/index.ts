/**
 * Tools Index
 * 
 * Central registry for all AI tools/functions.
 * Tools enable the AI to perform actions like fetching weather, getting time, searching web, etc.
 */

import { getWeather } from './weather';
// import { getCurrentTime } from './time';
import { getTimeByTimezone, getTimezoneByIP, getTimeByIP } from './time-apis';
import { geocodeForward, geocodeReverse } from './geocoding-apis';
import { ipLookup, getPublicHolidays, getRandomJoke, getQuoteOfDay } from './utilities-apis';
import { compareWeather } from './compare-weather';
import { searchWeb, scrapeWebsite, searchAndScrape, askOllama } from './webTools';
import { getNews } from './news';
import { webScrape } from './web-scrape';
import { dbSearch } from './db-search';

export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (params: any) => Promise<any>;
}

/**
 * Available tools that the AI can call
 */
export const tools: Tool[] = [
          {
            name: 'getCurrentDate',
            description: 'Get the current date, day, and time for a specific location or timezone.',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string', description: 'City or location name (optional)' },
                timezone: { type: 'string', description: 'Timezone (e.g., "Asia/Kolkata")' },
              },
              required: [],
            },
            execute: async ({ location, timezone }) => require('./date').getCurrentDate({ location, timezone }),
          },
          {
            name: 'getNextWeekday',
            description: 'Get the date of the next specified weekday (e.g., next Monday) for a location/timezone.',
            parameters: {
              type: 'object',
              properties: {
                date: { type: 'string', description: 'Base date in yyyy-MM-dd format (optional)' },
                weekday: { type: 'string', description: 'Weekday name (e.g., "Monday")' },
                timezone: { type: 'string', description: 'Timezone (e.g., "Asia/Kolkata")' },
              },
              required: ['weekday'],
            },
            execute: async ({ date, weekday, timezone }) => require('./date').getNextWeekday({ date, weekday, timezone }),
          },
          {
            name: 'addDaysToDate',
            description: 'Add days to a date and return the future date for a location/timezone.',
            parameters: {
              type: 'object',
              properties: {
                date: { type: 'string', description: 'Base date in yyyy-MM-dd format (optional)' },
                daysToAdd: { type: 'number', description: 'Number of days to add' },
                timezone: { type: 'string', description: 'Timezone (e.g., "Asia/Kolkata")' },
              },
              required: ['daysToAdd'],
            },
            execute: async ({ date, daysToAdd, timezone }) => require('./date').addDaysToDate({ date, daysToAdd, timezone }),
          },
        {
          name: 'compareWeather',
          description: 'Compare weather for multiple cities and summarize which city is hottest and which is coldest.',
          parameters: {
            type: 'object',
            properties: {
              cities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of city names (e.g., ["Toronto, Canada", "Delhi, India"])',
              },
            },
            required: ['cities'],
          },
          execute: async ({ cities }) => compareWeather(cities),
        },
      {
        name: 'ipLookup',
        description: 'IP Lookup: Get IP info using ipapi.co.',
        parameters: {
          type: 'object',
          properties: {
            ip: {
              type: 'string',
              description: 'IP address (optional, if not provided uses requester IP)',
            },
          },
          required: [],
        },
        execute: async ({ ip }) => ipLookup(ip),
      },
      {
        name: 'getPublicHolidays',
        description: 'Get public holidays for a country and year using Nager.Date.',
        parameters: {
          type: 'object',
          properties: {
            countryCode: {
              type: 'string',
              description: 'Country code (e.g., "IN", "US")',
            },
            year: {
              type: 'number',
              description: 'Year (e.g., 2025)',
            },
          },
          required: ['countryCode', 'year'],
        },
        execute: async ({ countryCode, year }) => getPublicHolidays(countryCode, year),
      },
      {
        name: 'getRandomJoke',
        description: 'Get a random joke.',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        execute: getRandomJoke,
      },
      {
        name: 'getQuoteOfDay',
        description: 'Get a random quote of the day.',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        execute: getQuoteOfDay,
      },
    {
      name: 'geocodeForward',
      description: 'Forward geocoding: Get location info from address or place name using Nominatim.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Address or place name (e.g., "Ahmedabad")',
          },
        },
        required: ['query'],
      },
      execute: async ({ query }) => geocodeForward(query),
    },
    {
      name: 'geocodeReverse',
      description: 'Reverse geocoding: Get address info from latitude/longitude using Nominatim.',
      parameters: {
        type: 'object',
        properties: {
          lat: {
            type: 'number',
            description: 'Latitude',
          },
          lon: {
            type: 'number',
            description: 'Longitude',
          },
        },
        required: ['lat', 'lon'],
      },
      execute: async ({ lat, lon }) => geocodeReverse(lat, lon),
    },
  {
    name: 'getWeather',
    description: 'Get current weather information for a specific location. Use this when user asks about weather, temperature, or climate conditions.',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name or location (e.g., "New York", "London", "Tokyo")',
        },
      },
      required: ['location'],
    },
    execute: getWeather,
  },
  {
    name: 'getTimeByTimezone',
    description: 'Get current date and time for a specific timezone using WorldTimeAPI.',
    parameters: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description: 'Timezone (e.g., "Asia/Kolkata", "America/New_York").',
        },
      },
      required: ['timezone'],
    },
    execute: async ({ timezone }) => getTimeByTimezone(timezone),
  },
  {
    name: 'getTimezoneByIP',
    description: 'Get timezone by IP address using ipapi.co.',
    parameters: {
      type: 'object',
      properties: {
        ip: {
          type: 'string',
          description: 'IP address (optional, if not provided uses requester IP)',
        },
      },
      required: [],
    },
    execute: async ({ ip }) => getTimezoneByIP(ip),
  },
  {
    name: 'getTimeByIP',
    description: 'Get current date and time by IP address using WorldTimeAPI.',
    parameters: {
      type: 'object',
      properties: {
        ip: {
          type: 'string',
          description: 'IP address (optional, if not provided uses requester IP)',
        },
      },
      required: [],
    },
    execute: async ({ ip }) => getTimeByIP(ip),
  },
  {
    name: 'searchWeb',
    description: 'Search the web for information using DuckDuckGo HTML scraping. Use this when user asks questions that require current information from the internet.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string',
        },
      },
      required: ['query'],
    },
    execute: async ({ query }) => searchWeb(query),
  },
  {
    name: 'scrapeWebsite',
    description: 'Scrape a web page for title, description, headings, and readable text using axios + cheerio.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL of the web page to scrape (must include http:// or https://)',
        },
      },
      required: ['url'],
    },
    execute: async ({ url }) => scrapeWebsite(url),
  },
  {
    name: 'searchAndScrape',
    description: 'Search the web and scrape the first result for content. Use this for deep information extraction.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string',
        },
      },
      required: ['query'],
    },
    execute: async ({ query }) => searchAndScrape(query),
  },
  {
    name: 'askOllama',
    description: 'Send a prompt to the Ollama AI model and get a response.',
    parameters: {
      type: 'object',
      properties: {
        promptText: {
          type: 'string',
          description: 'Prompt text to send to Ollama',
        },
      },
      required: ['promptText'],
    },
    execute: async ({ promptText }) => askOllama(promptText),
  },
  {
    name: 'getNews',
    description: 'Get latest news articles. Use this when user asks about news, current events, or headlines.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'News category: general, business, technology, science, health, sports, entertainment',
        },
        country: {
          type: 'string',
          description: 'Country code (e.g., "us", "gb", "in"). Optional.',
        },
      },
      required: [],
    },
    execute: getNews,
  },
  {
    name: 'webScrape',
    description: 'Extract content from a web page. Use this when user asks to read or analyze a specific URL.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL of the web page to scrape (must include http:// or https://)',
        },
      },
      required: ['url'],
    },
    execute: webScrape,
  },
  {
    name: 'dbSearch',
    description: 'Search through conversation history in the database. Use this when user asks to find or recall previous conversations.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find in conversation messages',
        },
        userId: {
          type: 'string',
          description: 'User ID to filter searches (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
        },
      },
      required: ['query'],
    },
    execute: dbSearch,
  },
];

/**
 * Execute a tool by name with given parameters
 */
export async function executeTool(toolName: string, params: any): Promise<any> {
  const tool = tools.find((t) => t.name === toolName);
  
  if (!tool) {
    throw new Error(`Tool "${toolName}" not found`);
  }
  
  try {
    const result = await tool.execute(params);
    return {
      success: true,
      toolName,
      result,
    };
  } catch (error: any) {
    return {
      success: false,
      toolName,
      error: error.message || 'Tool execution failed',
    };
  }
}

/**
 * Get tool definitions for Ollama function calling
 */
export function getToolDefinitions() {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}
