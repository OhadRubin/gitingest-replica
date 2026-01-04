import React from 'react';
import { ContributorData } from '../utils/types';

interface ContributorStatsProps {
  contributors: ContributorData[];
}

const ContributorStats: React.FC<ContributorStatsProps> = ({ contributors }) => {
  const maxCommits = contributors[0]?.commitCount || 1;

  return (
    <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4 overflow-auto h-[600px]">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
        Contributors
      </h3>

      <div className="space-y-4">
        {contributors.map((contrib, index) => (
          <div key={contrib.login} className="flex items-start gap-4">
            <span className="text-gray-600 w-6 text-right text-sm pt-2">
              {index + 1}
            </span>

            <img
              src={
                contrib.avatarUrl ||
                `https://github.com/${contrib.login}.png?size=40`
              }
              alt={contrib.login}
              className="w-10 h-10 rounded-full bg-gray-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-white font-medium truncate">
                  {contrib.login}
                </span>
                <span className="text-sm text-gray-500">
                  {contrib.commitCount} commits
                </span>
              </div>

              {/* Commit bar */}
              <div className="mt-1 h-1.5 bg-gray-800 rounded overflow-hidden">
                <div
                  className="h-full bg-purple-500/70"
                  style={{
                    width: `${(contrib.commitCount / maxCommits) * 100}%`,
                  }}
                />
              </div>

              {/* Stats row */}
              <div className="mt-2 flex gap-4 text-xs">
                <span className="text-green-400">
                  +{contrib.additions.toLocaleString()}
                </span>
                <span className="text-red-400">
                  -{contrib.deletions.toLocaleString()}
                </span>
                <span className="text-gray-500">
                  Last active: {new Date(contrib.lastActive).toLocaleDateString()}
                </span>
              </div>

              {/* Owned files */}
              {contrib.filesOwned.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Top files: </span>
                  <span className="text-xs text-gray-400">
                    {contrib.filesOwned
                      .slice(0, 3)
                      .map((f) => f.split('/').pop())
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {contributors.length === 0 && (
        <p className="text-gray-500 text-center py-8">No contributors found</p>
      )}
    </div>
  );
};

export default ContributorStats;
