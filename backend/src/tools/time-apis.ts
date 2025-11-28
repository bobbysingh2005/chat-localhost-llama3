import axios from 'axios';
import config from '../config';

/**
 * Get current time and date for a specific timezone using WorldTimeAPI.
 * @param {string} timezone - e.g. 'Asia/Kolkata'
 */
export async function getTimeByTimezone(timezone: string) {
  const url = `https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`;
  try {
    const { data } = await axios.get(url);
    return {
      datetime: data.datetime,
      timezone: data.timezone,
      utc_offset: data.utc_offset,
      abbreviation: data.abbreviation,
      day_of_week: data.day_of_week,
      day_of_year: data.day_of_year,
      week_number: data.week_number,
    };
  } catch (error) {
    return { error: 'Failed to fetch time from WorldTimeAPI.' };
  }
}

/**
 * Get timezone by IP using ipapi.co
 * @param {string} ip - Optional IP address (if not provided, uses requester's IP)
 */
export async function getTimezoneByIP(ip?: string) {
  const url = ip ? `https://ipapi.co/${ip}/timezone/` : 'https://ipapi.co/timezone/';
  try {
    const { data } = await axios.get(url);
    return { timezone: typeof data === 'string' ? data : data.timezone };
  } catch (error) {
    return { error: 'Failed to fetch timezone from ipapi.' };
  }
}

/**
 * Get time info by IP using WorldTimeAPI (alternative)
 * @param {string} ip - Optional IP address
 */
export async function getTimeByIP(ip?: string) {
  const url = ip ? `https://worldtimeapi.org/api/ip/${ip}` : 'https://worldtimeapi.org/api/ip';
  try {
    const { data } = await axios.get(url);
    return {
      datetime: data.datetime,
      timezone: data.timezone,
      utc_offset: data.utc_offset,
      abbreviation: data.abbreviation,
      day_of_week: data.day_of_week,
      day_of_year: data.day_of_year,
      week_number: data.week_number,
    };
  } catch (error) {
    return { error: 'Failed to fetch time by IP from WorldTimeAPI.' };
  }
}
