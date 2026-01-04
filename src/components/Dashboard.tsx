import React, { useState } from 'react';
import { AnalyticsData } from '../utils/types';
import AnalyticsStats from './Stats';
import RankedFileList from './FileTree';
import ContributorStats from './ContributorStats';
import ActivityHeatmap from './ActivityHeatmap';
import ExportPanel from './CodeViewer';

interface DashboardProps {
  data: AnalyticsData;
}

type TabId = 'files' | 'contributors' | 'activity';

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<TabId>('files');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'files', label: 'Hot Files' },
    { id: 'contributors', label: 'Contributors' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="animate-fade-in-up">
      <AnalyticsStats data={data} />

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'files' && <RankedFileList files={data.files} />}
          {activeTab === 'contributors' && (
            <ContributorStats contributors={data.contributors} />
          )}
          {activeTab === 'activity' && (
            <ActivityHeatmap weeklyData={data.weeklyActivity} />
          )}
        </div>
        <div className="lg:col-span-1">
          <ExportPanel data={data} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
