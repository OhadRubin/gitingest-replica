import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import TokenInput from './TokenInput';

interface HeroProps {
  onAnalyze: (url: string, token: string) => void;
  loading: boolean;
}

const Hero: React.FC<HeroProps> = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim(), token.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Repository Insights
      </h1>
      <p className="text-xl text-gray-400 mb-10 max-w-2xl">
        Discover which files change most, who contributes what, and how your codebase evolves over time.
      </p>

      <div className="w-full max-w-xl mx-auto">
        <TokenInput token={token} setToken={setToken} />
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full px-5 py-4 bg-[#161b22] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-lg placeholder-gray-600 transition-all text-white shadow-xl"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Analyze'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Hero;
