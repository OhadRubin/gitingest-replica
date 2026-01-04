import React from 'react';
import { BarChart2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans selection:bg-blue-500/30">
        <header className="border-b border-gray-800 bg-[#161b22]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart2 className="w-8 h-8 text-white" />
                    <span className="text-xl font-bold tracking-tight">RepoInsights</span>
                </div>
                <div className="flex items-center gap-4">
                     <span className="text-sm text-gray-500">GitHub Repository Analytics</span>
                </div>
            </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-800 mt-20 py-8 text-center text-gray-500 text-sm">
        <p>RepoInsights - GitHub Repository Analytics</p>
      </footer>
    </div>
  );
};

export default Layout;
