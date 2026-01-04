// GitHub API Response Types
export interface CommitListItem {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string; // ISO 8601
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface CommitDetail {
  sha: string;
  files: CommitFile[];
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface CommitFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
}

// Aggregated Analytics Types
export interface FileStats {
  path: string;
  commitCount: number;
  totalAdditions: number;
  totalDeletions: number;
  contributors: string[]; // unique logins
  lastModified: string; // ISO date
}

export interface ContributorData {
  login: string;
  avatarUrl: string;
  commitCount: number;
  additions: number;
  deletions: number;
  filesOwned: string[]; // files they modified most
  lastActive: string;
}

export interface WeeklyActivity {
  weekStart: string; // ISO date (Monday of week)
  commits: number;
  additions: number;
  deletions: number;
  contributors: number;
}

export interface AnalyticsData {
  repoName: string;
  totalCommits: number;
  dateRange: { start: string; end: string };
  files: FileStats[];
  contributors: ContributorData[];
  weeklyActivity: WeeklyActivity[];
  fetchedAt: string;
}

export interface FetchProgress {
  phase: 'commits' | 'details' | 'stats';
  current: number;
  total: number;
  message: string;
}
