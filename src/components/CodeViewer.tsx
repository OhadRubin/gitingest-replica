import React, { useState } from 'react';
import { Copy, Check, FileJson, FileSpreadsheet } from 'lucide-react';
import { AnalyticsData } from '../utils/types';

interface ExportPanelProps {
  data: AnalyticsData;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const generateCSV = () => {
    const headers = 'File,Commits,Additions,Deletions,Contributors,Last Modified\n';
    const rows = data.files
      .map(
        (f) =>
          `"${f.path}",${f.commitCount},${f.totalAdditions},${f.totalDeletions},"${f.contributors.join(';')}",${f.lastModified}`
      )
      .join('\n');
    return headers + rows;
  };

  const generateJSON = () => JSON.stringify(data, null, 2);

  const handleCopy = async (format: 'json' | 'csv') => {
    const content = format === 'json' ? generateJSON() : generateCSV();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = (format: 'json' | 'csv') => {
    const content = format === 'json' ? generateJSON() : generateCSV();
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repo-analytics.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#161b22] border border-gray-700 rounded-lg p-4">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
        Export Data
      </h3>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload('json')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={() => handleDownload('csv')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
        </div>

        <button
          onClick={() => handleCopy('json')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500 space-y-1">
        <p>
          <span className="text-gray-400">Repo:</span> {data.repoName}
        </p>
        <p>
          <span className="text-gray-400">Commits:</span> {data.totalCommits}
        </p>
        <p>
          <span className="text-gray-400">Period:</span> {data.dateRange.start} to{' '}
          {data.dateRange.end}
        </p>
        <p>
          <span className="text-gray-400">Files:</span> {data.files.length}
        </p>
        <p>
          <span className="text-gray-400">Contributors:</span>{' '}
          {data.contributors.length}
        </p>
      </div>
    </div>
  );
};

export default ExportPanel;
