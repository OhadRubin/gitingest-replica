import { CommitListItem, CommitDetail, FetchProgress } from './types';

export const extractOwnerRepo = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch (e) {
    // try handling non-url strings like "owner/repo"
    const parts = url.split('/');
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  }
  return null;
};

// Rate-limit aware fetch with exponential backoff
const rateLimitedFetch = async (
  url: string,
  headers: HeadersInit,
  retries = 3
): Promise<Response> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, { headers });

    if (res.status === 403) {
      const resetTime = res.headers.get('X-RateLimit-Reset');
      if (resetTime) {
        const waitMs = parseInt(resetTime) * 1000 - Date.now();
        if (waitMs > 0 && waitMs < 60000) {
          await new Promise((r) => setTimeout(r, waitMs + 1000));
          continue;
        }
      }
      throw new Error('Rate limit exceeded. Please try again later or add a GitHub token.');
    }

    if (res.status === 202) {
      // GitHub is computing stats, wait and retry
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Repository not found');
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    return res;
  }
  throw new Error('Max retries exceeded');
};

// Fetch commits with pagination (up to maxCommits)
export const fetchCommitList = async (
  owner: string,
  repo: string,
  token: string | undefined,
  maxCommits = 500,
  onProgress?: (p: FetchProgress) => void
): Promise<CommitListItem[]> => {
  const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const commits: CommitListItem[] = [];
  let page = 1;
  const perPage = 100;

  while (commits.length < maxCommits) {
    onProgress?.({
      phase: 'commits',
      current: commits.length,
      total: maxCommits,
      message: `Fetching commit list (page ${page})...`,
    });

    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`;
    const res = await rateLimitedFetch(url, headers);
    const data: CommitListItem[] = await res.json();

    if (data.length === 0) break;
    commits.push(...data);

    // Check Link header for next page
    const linkHeader = res.headers.get('Link');
    if (!linkHeader?.includes('rel="next"')) break;

    page++;
  }

  return commits.slice(0, maxCommits);
};

// Fetch commit details (files changed) - serialized to avoid rate limits
// Fetch commit details (files changed) - parallelized with concurrency limit
export const fetchCommitDetails = async (
  owner: string,
  repo: string,
  shas: string[],
  token: string | undefined,
  onProgress?: (p: FetchProgress) => void
): Promise<CommitDetail[]> => {
  const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const details: CommitDetail[] = [];
  let completedCount = 0;
  const CONCURRENCY_LIMIT = 25;

  const fetchSingleDetail = async (sha: string): Promise<CommitDetail> => {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
    const res = await rateLimitedFetch(url, headers);
    const data = await res.json();

    completedCount++;
    onProgress?.({
      phase: 'details',
      current: completedCount,
      total: shas.length,
      message: `Fetching commit details (${completedCount}/${shas.length})...`,
    });

    return {
      sha: data.sha,
      files: data.files || [],
      stats: data.stats || { additions: 0, deletions: 0, total: 0 },
    };
  };

  // Simple concurrency controller
  const queue = [...shas];
  const active: Promise<void>[] = [];

  while (queue.length > 0 || active.length > 0) {
    while (queue.length > 0 && active.length < CONCURRENCY_LIMIT) {
      const sha = queue.shift()!;
      const promise = fetchSingleDetail(sha)
        .then((detail) => {
          details.push(detail);
        })
        .catch((e) => {
          console.error(`Failed to fetch commit ${sha}:`, e);
          // push a placeholder or partial valid object if needed, or just skip
        })
        .finally(() => {
          active.splice(active.indexOf(promise), 1);
        });
      active.push(promise);
    }

    if (active.length > 0) {
      // Wait for at least one to finish before checking/filling queue again
      await Promise.race(active);
    }
  }

  return details;
};
