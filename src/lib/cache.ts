const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  cache.delete(key); // Remove expired or non-existent entry
  return null;
}

export function setInCache<T>(key: string, data: T) {
  cache.set(key, { data, timestamp: Date.now() });
}
