/**
 * Time Tool
 * 
 * Gets current date and time for specified timezone
 */

interface TimeParams {
  timezone?: string;
}

interface TimeResult {
  timezone: string;
  datetime: string;
  date: string;
  time: string;
  day: string;
  unix_timestamp: number;
}

/**
 * Get current date and time for a timezone
 */
export async function getCurrentTime(params: TimeParams): Promise<TimeResult> {
  const timezone = params.timezone || 'UTC';
  
  try {
    const now = new Date();
    
    // Format date and time for the specified timezone
    const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long',
      hour12: false,
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
    });
    
    return {
      timezone,
      datetime: dateTimeFormatter.format(now),
      date: dateFormatter.format(now),
      time: timeFormatter.format(now),
      day: dayFormatter.format(now),
      unix_timestamp: Math.floor(now.getTime() / 1000),
    };
  } catch (error: any) {
    console.error('Time tool error:', error.message);
    
    // Fallback to UTC
    const now = new Date();
    return {
      timezone: 'UTC',
      datetime: now.toUTCString(),
      date: now.toDateString(),
      time: now.toTimeString(),
      day: now.toLocaleDateString('en-US', { weekday: 'long' }),
      unix_timestamp: Math.floor(now.getTime() / 1000),
    };
  }
}
