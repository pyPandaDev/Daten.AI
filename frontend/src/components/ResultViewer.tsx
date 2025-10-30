import React, { useState } from 'react';
import { ExecutionResult } from '../services/api';
import { CheckCircle, XCircle, Clock, TrendingUp, Copy, Check } from 'lucide-react';

interface ResultViewerProps {
  result: ExecutionResult | null;
  isLoading: boolean;
  streamEvents?: any[];
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <details className="border border-gray-200 rounded-lg overflow-hidden">
      <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between">
        <span>💻 View Generated Python Code</span>
      </summary>
      <div className="relative bg-gray-900 border-t border-gray-200">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors z-10"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-300" />
          )}
        </button>
        <pre className="px-4 py-4 overflow-x-auto text-xs text-gray-100 font-mono leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </details>
  );
};

const ResultViewer: React.FC<ResultViewerProps> = ({ result, isLoading, streamEvents = [] }) => {
  if (isLoading && !result) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-10 border border-gray-200 animate-fadeIn">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-gray-800">
              🔍 Executing Analysis...
            </h3>
            {streamEvents.length > 0 && (
              <div className="text-sm space-y-2 max-w-md mx-auto">
                {streamEvents.slice(-3).map((event, idx) => {
                  const message = event.data?.message || event.event;
                  const isAutoFix = message.includes('Auto-fixing') || message.includes('auto-fix') || message.includes('Error detected');
                  
                  return (
                    <div key={idx} className={`flex items-center justify-center space-x-2 animate-slideIn ${
                      isAutoFix ? 'bg-yellow-50 border border-yellow-300 rounded-lg p-2' : ''
                    }`}>
                      <div className={`h-2 w-2 rounded-full animate-pulse ${
                        isAutoFix ? 'bg-yellow-600' : 'bg-blue-500'
                      }`}></div>
                      <p className={`font-medium ${
                        isAutoFix ? 'text-yellow-800' : 'text-gray-600'
                      }`}>{message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 ${result.status === 'completed' ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {result.status === 'completed' ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <h2 className="text-xl font-bold text-gray-800">
              {result.status === 'completed' ? 'Analysis Complete' : 'Analysis Failed'}
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{result.execution_time.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Error */}
        {result.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-sm text-red-700 font-mono">{result.error}</p>
          </div>
        )}

        {/* Summary */}
        {result.summary && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Executive Summary</h3>
            <p className="text-gray-700 leading-relaxed">{result.summary}</p>
          </div>
        )}

        {/* Plan */}
        {result.plan && result.plan.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Analysis Plan</h3>
            <ol className="list-decimal list-inside space-y-2">
              {result.plan.map((step, idx) => (
                <li key={idx} className="text-gray-700">{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Artifacts */}
        {result.artifacts && result.artifacts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Results</h3>
            <div className="space-y-4">
              {result.artifacts.map((artifact, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  {artifact.type === 'table' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {artifact.data[0]?.map((header: string, headerIdx: number) => (
                              <th
                                key={headerIdx}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {artifact.data.slice(1).map((row: any[], rowIdx: number) => (
                            <tr key={rowIdx}>
                              {row.map((cell: any, cellIdx: number) => (
                                <td key={cellIdx} className="px-4 py-2 text-sm text-gray-700">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {artifact.type === 'plot' && (
                    <div className="p-4">
                      <img
                        src={`data:image/png;base64,${artifact.data}`}
                        alt={artifact.name}
                        className="max-w-full h-auto"
                      />
                    </div>
                  )}

                  {artifact.type === 'metrics' && (
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {artifact.items?.map((metric: any, metricIdx: number) => (
                          <div
                            key={metricIdx}
                            className="bg-primary-50 rounded-lg p-4 border border-primary-200"
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-primary-600" />
                              <p className="text-xs font-medium text-gray-600 uppercase">
                                {metric.name}
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">
                              {typeof metric.value === 'number'
                                ? metric.value.toFixed(4)
                                : metric.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-ups */}
        {result.followups && result.followups.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Suggested Next Steps</h3>
            <ul className="list-disc list-inside space-y-2">
              {result.followups.map((followup, idx) => (
                <li key={idx} className="text-gray-700">{followup}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Python Code */}
        {result.python_code && <CodeBlock code={result.python_code} />}
      </div>
    </div>
  );
};

export default ResultViewer;
