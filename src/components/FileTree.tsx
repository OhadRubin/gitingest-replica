import React, { useState } from 'react';
import { FileCode, TrendingUp, TrendingDown } from 'lucide-react';
import { FileStats } from '../utils/types';

interface RankedFileListProps {
  files: FileStats[];
  limit?: number;
}

type SortBy = 'commits' | 'additions' | 'deletions';

const RankedFileList: React.FC<RankedFileListProps> = ({ files, limit = 50 }) => {
  const [sortBy, setSortBy] = useState<SortBy>('commits');

  const sorted = React.useMemo(() => {
    return [...files]
      .sort((a, b) => {
        switch (sortBy) {
          case 'commits':
            return b.commitCount - a.commitCount;
          case 'additions':
            return b.totalAdditions - a.totalAdditions;
          case 'deletions':
            return b.totalDeletions - a.totalDeletions;
          default:
            throw new Error(`Unknown sort type: ${sortBy}`);
        }
      })
      .slice(0, limit);
  }, [files, sortBy, limit]);

  const maxCommits = sorted[0]?.commitCount || 1;

  return (
    <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4 overflow-auto h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
          Most Changed Files
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="bg-[#0d1117] border border-gray-700 rounded px-2 py-1 text-sm text-gray-300"
        >
          <option value="commits">By Commits</option>
          <option value="additions">By Additions</option>
          <option value="deletions">By Deletions</option>
        </select>
      </div>

      <div className="space-y-2">
        {sorted.map((file, index) => (
          <div key={file.path} className="group">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600 w-6 text-right">{index + 1}</span>
              <FileCode className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-300 truncate flex-1" title={file.path}>
                {file.path}
              </span>
              <div className="flex items-center gap-2 text-xs flex-shrink-0">
                <span className="text-gray-500">{file.commitCount} commits</span>
                <span className="text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />+{file.totalAdditions}
                </span>
                <span className="text-red-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />-{file.totalDeletions}
                </span>
              </div>
            </div>
            {/* Visual bar showing relative activity */}
            <div className="ml-9 mt-1 h-1 bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-blue-500/50"
                style={{ width: `${(file.commitCount / maxCommits) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <p className="text-gray-500 text-center py-8">No file changes found</p>
      )}
    </div>
  );
};

export default RankedFileList;
