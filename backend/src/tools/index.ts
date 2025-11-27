/**
 * Tools Index
 * 
 * Central registry for all AI tools/functions.
 * Tools enable the AI to perform actions like fetching weather, getting time, searching web, etc.
 */

import { getWeather } from './weather';
import { getCurrentTime } from './time';
import { searchWeb } from './web-search';
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
    name: 'getCurrentTime',
    description: 'Get current date and time for a specific timezone. Use this when user asks about time, date, or current day.',
    parameters: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description: 'Timezone (e.g., "America/New_York", "Asia/Tokyo", "Europe/London"). If not provided, uses UTC.',
        },
      },
      required: [],
    },
    execute: getCurrentTime,
  },
  {
    name: 'searchWeb',
    description: 'Search the web for information. Use this when user asks questions that require current information from the internet.',
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
    execute: searchWeb,
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
