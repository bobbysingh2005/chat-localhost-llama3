import axios from 'axios';

/**
 * Forward geocoding: Get location info from address or place name using Nominatim.
 * @param {string} query - Address or place name (e.g., 'Ahmedabad')
 */
export async function geocodeForward(query: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`;
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'pro-chat-app/1.0' }
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return { error: 'Failed to fetch geocoding data.' };
  }
}

/**
 * Reverse geocoding: Get address info from latitude/longitude using Nominatim.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
export async function geocodeReverse(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'pro-chat-app/1.0' }
    });
    return data;
  } catch (error) {
    return { error: 'Failed to fetch reverse geocoding data.' };
  }
}
