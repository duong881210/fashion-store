const rateLimitMap = new Map<string, Array<{ timestamp: number }>>();

/**
 * Checks if a given IP address has exceeded a specific rate limit.
 * @param ip - Client IP address
 * @param limit - Max number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (e.g. 60 * 1000 for 1 minute)
 * @returns boolean - True if the client is rate limited, false otherwise
 */
export function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];

  // Filter out request timestamps older than the active window
  const activeRequests = requests.filter((req) => now - req.timestamp < windowMs);

  if (activeRequests.length >= limit) {
    return true;
  }

  // Record current request
  activeRequests.push({ timestamp: now });
  rateLimitMap.set(ip, activeRequests);

  return false;
}
