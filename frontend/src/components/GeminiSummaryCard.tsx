import React from 'react';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

interface StatisticsSummary {
  numeric_columns?: Array<{
    name: string;
    count: number;
    mean: number | null;
    median: number | null;
    std: number | null;
    min: number | null;
    max: number | null;
    missing: number;
  }>;
  categorical_columns?: Array<{
    name: string;
    unique_values: number;
    most_common: Array<{ value: string; count: number }>;
    missing: number;
  }>;
  datetime_columns?: Array<{
    name: string;
    min: string | null;
    max: string | null;
    missing: number;
  }>;
}

interface GeminiSummaryCardProps {
  insights: string;
  datasetName: string;
  rows: number;
  columns: number;
  statisticsSummary?: StatisticsSummary;
  onAskQuestion?: (question: string) => Promise<string>;
}

const GeminiSummaryCard: React.FC<GeminiSummaryCardProps> = ({
  insights,
  datasetName,
  rows,
  columns,
  statisticsSummary,
}) => {
  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-t-2xl p-6">
        <div className="flex items-center space-x-3">
          <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <span>AI Analysis</span>
            </h2>
            <p className="text-purple-100 text-sm font-medium">
              Initial dataset intelligence report
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-2xl shadow-2xl border-2 border-purple-200 p-8 space-y-6">
        {/* Dataset Info Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{datasetName}</h3>
                <p className="text-sm text-gray-600">
                  {rows.toLocaleString()} rows × {columns} columns
                </p>
              </div>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Data Quality Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">Dataset Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{rows.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Columns</p>
              <p className="text-2xl font-bold text-gray-900">{columns}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Data Quality</p>
              <p className="text-2xl font-bold text-green-600">✓ Ready</p>
            </div>
          </div>
        </div>

        {/* AI Insights - Detailed Analysis */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">Key Insights from AI</h3>
          </div>
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-2 border-purple-200 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {insights.split('\n').filter(line => line.trim()).map((line, idx) => {
                const trimmedLine = line.trim();
                // Check if line is a header (contains colon or is short)
                const isHeader = trimmedLine.endsWith(':') || (trimmedLine.length < 50 && !trimmedLine.includes(','));
                
                if (isHeader && trimmedLine) {
                  return (
                    <div key={idx} className="mt-4 first:mt-0">
                      <h4 className="text-md font-bold text-purple-700 flex items-center space-x-2">
                        <span className="text-purple-500">▸</span>
                        <span>{trimmedLine}</span>
                      </h4>
                    </div>
                  );
                }
                
                if (trimmedLine) {
                  return (
                    <div key={idx} className="flex items-start space-x-3 ml-4">
                      <span className="text-purple-500 font-bold mt-1 text-xs">●</span>
                      <p className="text-gray-700 leading-relaxed flex-1">{trimmedLine}</p>
                    </div>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        {statisticsSummary && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">📈</span>
              <h3 className="text-lg font-bold text-gray-800">Statistical Summary:</h3>
            </div>
            
            {/* Numeric Columns */}
            {statisticsSummary.numeric_columns && statisticsSummary.numeric_columns.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Numeric Columns</h4>
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Column</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Count</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mean</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Median</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Std Dev</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Min</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Max</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Missing</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {statisticsSummary.numeric_columns.map((col, idx) => (
                          <tr key={idx} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">{col.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{col.count.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{col.mean !== null ? col.mean.toFixed(2) : 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{col.median !== null ? col.median.toFixed(2) : 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{col.std !== null ? col.std.toFixed(2) : 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{col.min !== null ? col.min.toFixed(2) : 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{col.max !== null ? col.max.toFixed(2) : 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <span className={col.missing > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                {col.missing}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Categorical Columns */}
            {statisticsSummary.categorical_columns && statisticsSummary.categorical_columns.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Categorical Columns</h4>
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-purple-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Column</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Unique Values</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Top 3 Values</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Missing</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {statisticsSummary.categorical_columns.map((col, idx) => (
                          <tr key={idx} className="hover:bg-purple-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">{col.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{col.unique_values.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {col.most_common.map((item, i) => (
                                <div key={i} className="text-xs">
                                  <span className="font-medium">{item.value}</span>: {item.count}
                                </div>
                              ))}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <span className={col.missing > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                {col.missing}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}



      </div>
    </div>
  );
};

export default GeminiSummaryCard;
