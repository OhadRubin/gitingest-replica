import React from 'react';
import { WeeklyActivity } from '../utils/types';

interface ActivityHeatmapProps {
  weeklyData: WeeklyActivity[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ weeklyData }) => {
  const maxCommits = Math.max(...weeklyData.map((w) => w.commits), 1);

  const getIntensity = (commits: number): string => {
    if (commits === 0) return 'bg-gray-800';
    const ratio = commits / maxCommits;
    if (ratio > 0.75) return 'bg-green-500';
    if (ratio > 0.5) return 'bg-green-600/80';
    if (ratio > 0.25) return 'bg-green-700/60';
    return 'bg-green-800/40';
  };

  // Group by month for display
  const monthGroups = React.useMemo(() => {
    const groups: Map<string, WeeklyActivity[]> = new Map();
    for (const week of weeklyData) {
      const month = week.weekStart.slice(0, 7); // YYYY-MM
      if (!groups.has(month)) groups.set(month, []);
      groups.get(month)!.push(week);
    }
    return Array.from(groups.entries());
  }, [weeklyData]);

  // Total stats
  const totals = weeklyData.reduce(
    (acc, w) => ({
      commits: acc.commits + w.commits,
      additions: acc.additions + w.additions,
      deletions: acc.deletions + w.deletions,
    }),
    { commits: 0, additions: 0, deletions: 0 }
  );

  return (
    <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4 overflow-auto h-[600px]">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
        Activity Timeline
      </h3>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div>
          <p className="text-2xl font-bold text-white">{totals.commits}</p>
          <p className="text-xs text-gray-500">Total Commits</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-400">
            +{totals.additions.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Additions</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400">
            -{totals.deletions.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Deletions</p>
        </div>
      </div>

      {/* Heatmap by month */}
      <div className="space-y-4">
        {monthGroups.map(([month, weeks]) => (
          <div key={month}>
            <p className="text-sm text-gray-400 mb-2">
              {new Date(month + '-01').toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <div className="flex gap-1 flex-wrap">
              {weeks.map((week) => (
                <div
                  key={week.weekStart}
                  className={`w-6 h-6 rounded-sm ${getIntensity(week.commits)} cursor-pointer transition-transform hover:scale-110`}
                  title={`Week of ${week.weekStart}: ${week.commits} commits, +${week.additions}/-${week.deletions}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="w-4 h-4 rounded-sm bg-gray-800" />
        <div className="w-4 h-4 rounded-sm bg-green-800/40" />
        <div className="w-4 h-4 rounded-sm bg-green-700/60" />
        <div className="w-4 h-4 rounded-sm bg-green-600/80" />
        <div className="w-4 h-4 rounded-sm bg-green-500" />
        <span>More</span>
      </div>

      {weeklyData.length === 0 && (
        <p className="text-gray-500 text-center py-8">No activity data found</p>
      )}
    </div>
  );
};

export default ActivityHeatmap;
