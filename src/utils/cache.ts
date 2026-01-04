import { AnalyticsData } from './types';

const CACHE_KEY_PREFIX = 'repo-analytics-';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CachedData extends AnalyticsData {
  cachedAt: number;
}

export const getCachedAnalytics = (owner: string, repo: string): AnalyticsData | null => {
  try {
    const key = `${CACHE_KEY_PREFIX}${owner}/${repo}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);

    // Check TTL
    if (Date.now() - data.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }

    // Remove the cachedAt property before returning
    const { cachedAt: _, ...analyticsData } = data;
    return analyticsData;
  } catch (e) {
    console.warn('Cache read failed:', e);
    return null;
  }
};

export const setCachedAnalytics = (
  owner: string,
  repo: string,
  data: AnalyticsData
): void => {
  try {
    const key = `${CACHE_KEY_PREFIX}${owner}/${repo}`;
    const cacheEntry: CachedData = { ...data, cachedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (e) {
    console.warn('Cache write failed:', e);
    // Clear old entries if storage is full
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }
};

export const clearCache = (): void => {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k?.startsWith(CACHE_KEY_PREFIX)) {
      localStorage.removeItem(k);
    }
  }
};
