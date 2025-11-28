import axios from 'axios';

/**
 * IP Lookup: Get IP info using ipapi.co
 * @param {string} ip - Optional IP address
 */
export async function ipLookup(ip?: string) {
  const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    return { error: 'Failed to fetch IP info.' };
  }
}

/**
 * Public Holidays: Get holidays for a country and year using Nager.Date
 * @param {string} countryCode - e.g. 'IN', 'US'
 * @param {number} year - e.g. 2025
 */
export async function getPublicHolidays(countryCode: string, year: number) {
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
  try {
    const { data } = await axios.get(url);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return { error: 'Failed to fetch public holidays.' };
  }
}

/**
 * Random Joke: Get a random joke
 */
export async function getRandomJoke() {
  const url = 'https://official-joke-api.appspot.com/jokes/random';
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    return { error: 'Failed to fetch joke.' };
  }
}

/**
 * Quote of the Day: Get a random quote
 */
export async function getQuoteOfDay() {
  const url = 'https://api.quotable.io/random';
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    return { error: 'Failed to fetch quote.' };
  }
}
