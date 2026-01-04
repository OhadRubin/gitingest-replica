import {
  CommitListItem,
  CommitDetail,
  FileStats,
  ContributorData,
  WeeklyActivity,
  AnalyticsData,
} from './types';

// Get Monday of the week for a given date
const getWeekStart = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};

export const aggregateAnalytics = (
  repoName: string,
  commits: CommitListItem[],
  details: CommitDetail[]
): AnalyticsData => {
  const fileMap = new Map<string, FileStats>();
  const contributorMap = new Map<string, ContributorData>();
  const weeklyMap = new Map<string, WeeklyActivity>();
  const weeklyContributors = new Map<string, Set<string>>();

  // Create a map from sha to commit info for quick lookup
  const commitInfoMap = new Map(commits.map((c) => [c.sha, c]));

  // Process each commit detail
  for (const detail of details) {
    const commitInfo = commitInfoMap.get(detail.sha);
    if (!commitInfo) continue;

    const authorLogin = commitInfo.author?.login || commitInfo.commit.author.name;
    const authorAvatar = commitInfo.author?.avatar_url || '';
    const commitDate = new Date(commitInfo.commit.author.date);
    const weekStart = getWeekStart(commitDate);

    // Update weekly activity
    if (!weeklyMap.has(weekStart)) {
      weeklyMap.set(weekStart, {
        weekStart,
        commits: 0,
        additions: 0,
        deletions: 0,
        contributors: 0,
      });
      weeklyContributors.set(weekStart, new Set());
    }
    const week = weeklyMap.get(weekStart)!;
    week.commits++;
    week.additions += detail.stats.additions;
    week.deletions += detail.stats.deletions;
    weeklyContributors.get(weekStart)!.add(authorLogin);

    // Update contributor stats
    if (!contributorMap.has(authorLogin)) {
      contributorMap.set(authorLogin, {
        login: authorLogin,
        avatarUrl: authorAvatar,
        commitCount: 0,
        additions: 0,
        deletions: 0,
        filesOwned: [],
        lastActive: commitInfo.commit.author.date,
      });
    }
    const contributor = contributorMap.get(authorLogin)!;
    contributor.commitCount++;
    contributor.additions += detail.stats.additions;
    contributor.deletions += detail.stats.deletions;
    if (commitInfo.commit.author.date > contributor.lastActive) {
      contributor.lastActive = commitInfo.commit.author.date;
    }

    // Update file stats
    for (const file of detail.files) {
      if (!fileMap.has(file.filename)) {
        fileMap.set(file.filename, {
          path: file.filename,
          commitCount: 0,
          totalAdditions: 0,
          totalDeletions: 0,
          contributors: [],
          lastModified: commitInfo.commit.author.date,
        });
      }
      const fileStats = fileMap.get(file.filename)!;
      fileStats.commitCount++;
      fileStats.totalAdditions += file.additions;
      fileStats.totalDeletions += file.deletions;
      if (!fileStats.contributors.includes(authorLogin)) {
        fileStats.contributors.push(authorLogin);
      }
      if (commitInfo.commit.author.date > fileStats.lastModified) {
        fileStats.lastModified = commitInfo.commit.author.date;
      }
    }
  }

  // Update weekly contributor counts
  weeklyContributors.forEach((contributorSet, weekStart) => {
    const week = weeklyMap.get(weekStart);
    if (week) {
      week.contributors = contributorSet.size;
    }
  });

  // Calculate file ownership for contributors
  const files = Array.from(fileMap.values());
  contributorMap.forEach((contributor) => {
    const ownedFiles = files
      .filter((f) => f.contributors.includes(contributor.login))
      .sort((a, b) => b.commitCount - a.commitCount)
      .slice(0, 5)
      .map((f) => f.path);
    contributor.filesOwned = ownedFiles;
  });

  // Sort data
  const sortedFiles = files.sort((a, b) => b.commitCount - a.commitCount);
  const contributorValues: ContributorData[] = [];
  contributorMap.forEach((value) => contributorValues.push(value));
  const sortedContributors = contributorValues.sort(
    (a, b) => b.commitCount - a.commitCount
  );
  const sortedWeekly = Array.from(weeklyMap.values()).sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart)
  );

  const dates = commits.map((c) => c.commit.author.date).sort();

  return {
    repoName,
    totalCommits: commits.length,
    dateRange: {
      start: dates[0]?.split('T')[0] || '',
      end: dates[dates.length - 1]?.split('T')[0] || '',
    },
    files: sortedFiles,
    contributors: sortedContributors,
    weeklyActivity: sortedWeekly,
    fetchedAt: new Date().toISOString(),
  };
};
