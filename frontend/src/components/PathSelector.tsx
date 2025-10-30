import React from 'react';
import { BarChart3, Brain, TrendingUp, Sparkles } from 'lucide-react';

interface PathSelectorProps {
  onSelectPath: (path: 'analysis' | 'datascience') => void;
  datasetInfo: {
    filename: string;
    rows: number;
    columns: number;
  };
  isLoadingSuggestions?: boolean;
  selectedPath?: 'analysis' | 'datascience';
}

const PathSelector: React.FC<PathSelectorProps> = ({ 
  onSelectPath, 
  datasetInfo, 
  isLoadingSuggestions,
  selectedPath
}) => {
  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Dataset Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{datasetInfo.filename}</h3>
            <p className="text-sm text-gray-600">
              {datasetInfo.rows.toLocaleString()} rows × {datasetInfo.columns} columns
            </p>
          </div>
        </div>
      </div>

      {/* Path Selection */}
      <div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Data Analysis Path */}
          <button
            onClick={() => onSelectPath('analysis')}
            className="group relative bg-white border-3 border-blue-300 hover:border-blue-500 rounded-2xl p-8 text-left transition-all hover:shadow-2xl hover:scale-105 transform"
          >
            
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-9 w-9 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
                <span>Data Analysis</span>
                <TrendingUp className="h-5 w-5 text-blue-600 group-hover:animate-bounce" />
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4 leading-relaxed">
                Get instant AI-powered insights about your data with interactive analysis options
              </p>

              {/* Features */}
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Automatic summary report</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Summary statistics & EDA</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Data visualization options</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Correlation & outlier detection</span>
                </li>
              </ul>

              {/* CTA */}
              <div className="mt-6 text-blue-600 font-semibold group-hover:text-blue-700 flex items-center space-x-2">
                <span>Start Analysis</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </button>

          {/* Data Science Path */}
          <button
            onClick={() => onSelectPath('datascience')}
            className="group relative bg-white border-3 border-purple-300 hover:border-purple-500 rounded-2xl p-8 text-left transition-all hover:shadow-2xl hover:scale-105 transform"
          >
            
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-9 w-9 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
                <span>Data Science</span>
                <Sparkles className="h-5 w-5 text-purple-600 group-hover:animate-spin" />
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4 leading-relaxed">
                Explore advanced ML workflows and data science pipelines powered by AI
              </p>

              {/* Features */}
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Data cleaning & preprocessing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Feature engineering suggestions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>ML model recommendations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Supervised & unsupervised learning</span>
                </li>
              </ul>

              {/* CTA */}
              <div className="mt-6 text-purple-600 font-semibold group-hover:text-purple-700 flex items-center space-x-2">
                <span>Explore Workflows</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 flex items-start space-x-2">
          <span className="text-lg">💡</span>
          <span>
            <strong>Tip:</strong> Choose <strong className="text-blue-600">Data Analysis</strong> for quick insights and visualizations, 
            or <strong className="text-purple-600">Data Science</strong> for advanced ML workflows and model building.
          </span>
        </p>
      </div>

      {/* Simple Minimal Loading - Show when generating suggestions */}
      {isLoadingSuggestions && selectedPath && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50 animate-fadeIn">
          <div className="text-center space-y-4 p-6">
            {/* Simple spinner */}
            <div className="h-12 w-12 mx-auto border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
            {/* Minimal text */}
            <p className="text-sm text-gray-600 font-medium">
              Generating suggestions...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathSelector;
