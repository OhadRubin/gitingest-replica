import React, { useState } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import { extractOwnerRepo, fetchCommitList, fetchCommitDetails } from './utils/github';
import { aggregateAnalytics } from './utils/analytics';
import { getCachedAnalytics, setCachedAnalytics } from './utils/cache';
import { AnalyticsData, FetchProgress } from './utils/types';

function App() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const handleAnalyze = async (url: string, token: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    setProgress(null);

    try {
      const repoInfo = extractOwnerRepo(url);
      if (!repoInfo) {
        throw new Error('Invalid GitHub URL. Use format: https://github.com/owner/repo');
      }

      const { owner, repo } = repoInfo;

      // Check cache first
      const cached = getCachedAnalytics(owner, repo);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Fetch commit list (paginated)
      const commits = await fetchCommitList(
        owner,
        repo,
        token || undefined,
        500,
        setProgress
      );

      if (commits.length === 0) {
        throw new Error('No commits found in this repository.');
      }

      // Fetch details for each commit (serialized to avoid rate limits)
      // For large repos, limit to most recent 200 commits for details
      const shasToFetch = commits.slice(0, 200).map((c) => c.sha);
      const details = await fetchCommitDetails(
        owner,
        repo,
        shasToFetch,
        token || undefined,
        setProgress
      );

      // Aggregate analytics
      setProgress({
        phase: 'stats',
        current: 1,
        total: 1,
        message: 'Computing analytics...',
      });
      const analytics = aggregateAnalytics(`${owner}/${repo}`, commits, details);

      // Cache results
      setCachedAnalytics(owner, repo, analytics);

      setData(analytics);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <Layout>
      {!data ? (
        <>
          <Hero onAnalyze={handleAnalyze} loading={loading} />
          {progress && (
            <div className="max-w-xl mx-auto mt-6">
              <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">{progress.message}</p>
                <div className="h-2 bg-gray-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setData(null)}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              &larr; Analyze another repo
            </button>
            <span className="text-gray-500 text-sm">
              {data.repoName} ({data.totalCommits} commits)
            </span>
          </div>
          <Dashboard data={data} />
        </>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 text-white px-6 py-4 rounded-lg shadow-xl backdrop-blur-md animate-fade-in-up max-w-md">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}
    </Layout>
  );
}

export default App;
