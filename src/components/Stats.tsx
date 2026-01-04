import React from 'react';
import { GitCommit, Users, FileText, TrendingUp } from 'lucide-react';
import { AnalyticsData } from '../utils/types';

interface AnalyticsStatsProps {
  data: AnalyticsData;
}

const AnalyticsStats: React.FC<AnalyticsStatsProps> = ({ data }) => {
  const activeContributors = data.contributors.filter((c) => c.commitCount > 0).length;
  const hotFiles = data.files.filter((f) => f.commitCount >= 5).length;

  // Calculate trend (commits in last 4 weeks vs prior 4 weeks)
  const recentWeeks = data.weeklyActivity.slice(-4);
  const priorWeeks = data.weeklyActivity.slice(-8, -4);
  const recentCommits = recentWeeks.reduce((sum, w) => sum + w.commits, 0);
  const priorCommits = priorWeeks.reduce((sum, w) => sum + w.commits, 0);
  const trend =
    priorCommits > 0 ? ((recentCommits - priorCommits) / priorCommits) * 100 : 0;
  const trendDisplay = priorCommits > 0 ? `${trend > 0 ? '+' : ''}${trend.toFixed(0)}%` : 'N/A';

  const stats = [
    {
      icon: GitCommit,
      label: 'Total Commits',
      value: data.totalCommits.toLocaleString(),
      colorClass: 'bg-blue-500/10 text-blue-400',
    },
    {
      icon: Users,
      label: 'Contributors',
      value: activeContributors.toString(),
      colorClass: 'bg-purple-500/10 text-purple-400',
    },
    {
      icon: FileText,
      label: 'Hot Files (5+)',
      value: hotFiles.toString(),
      colorClass: 'bg-orange-500/10 text-orange-400',
    },
    {
      icon: TrendingUp,
      label: '4-Week Trend',
      value: trendDisplay,
      colorClass: 'bg-green-500/10 text-green-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map(({ icon: Icon, label, value, colorClass }) => (
        <div
          key={label}
          className="bg-[#161b22] border border-gray-700 p-4 rounded-lg flex items-center gap-4"
        >
          <div className={`p-3 rounded-full ${colorClass.split(' ')[0]}`}>
            <Icon className={`w-6 h-6 ${colorClass.split(' ')[1]}`} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsStats;
