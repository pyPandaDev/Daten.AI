import React, { useState } from 'react';
import { Play, Clock, CheckCircle, XCircle, Code, TrendingUp, AlertTriangle, Copy, MessageSquare, Send, Edit3, X } from 'lucide-react';

interface NotebookViewProps {
  taskTitle: string;
  pythonCode: string;
  isExecuting: boolean;
  executionResult: any;
  streamEvents: any[];
  onReExecute?: (code: string) => void;
}

const NotebookView: React.FC<NotebookViewProps> = ({
  taskTitle,
  pythonCode,
  isExecuting,
  executionResult,
  streamEvents,
  onReExecute,
}) => {
  const [editableCode, setEditableCode] = useState(pythonCode);
  const [isEditing, setIsEditing] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Update editable code when pythonCode prop changes
  React.useEffect(() => {
    if (!isEditing) {
      setEditableCode(pythonCode);
    }
  }, [pythonCode, isEditing]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    alert('✅ Code copied to clipboard!');
  };

  const handleRunCode = () => {
    if (onReExecute && editableCode.trim()) {
      onReExecute(editableCode);
      setIsEditing(false);
    } else {
      alert('⚠️ Code re-execution feature coming soon!');
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsSendingChat(true);

    try {
      // Send chat request to backend (endpoint to be created)
      const response = await fetch('http://localhost:8000/api/chat/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          execution_result: executionResult,
          code: pythonCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error analyzing your results. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: '💬 Chat with AI about your analysis results! Ask questions like "What do these results mean?" or "What should I do next?"' }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const getArtifactExplanation = (artifact: any, index: number) => {
    if (artifact.type === 'plot') {
      // Extract meaningful info from plot name
      const name = artifact.name || `plot_${index + 1}`;
      if (name.toLowerCase().includes('distribution')) {
        return `📊 This distribution plot shows how values are spread across your dataset. Look for the shape (normal, skewed, bimodal), central tendency, and any outliers.`;
      } else if (name.toLowerCase().includes('correlation') || name.toLowerCase().includes('heatmap')) {
        return `📊 This correlation visualization reveals relationships between variables. Darker/brighter colors indicate stronger correlations, helping identify which features influence each other.`;
      } else if (name.toLowerCase().includes('scatter')) {
        return `📊 This scatter plot displays the relationship between two variables. Look for linear trends, clusters, or outliers that might indicate interesting patterns.`;
      } else if (name.toLowerCase().includes('box')) {
        return `📊 This box plot shows the distribution including median, quartiles, and outliers. The box represents the middle 50% of data, with whiskers extending to typical values.`;
      } else {
        return `📊 This visualization reveals patterns and trends in your data. Analyze the shapes, clusters, and any anomalies to gain insights about your dataset.`;
      }
    } else if (artifact.type === 'table') {
      const name = artifact.name || 'Data Summary';
      if (name.toLowerCase().includes('missing')) {
        return `📋 This table identifies missing data points. High percentages may require imputation or removal strategies before further analysis.`;
      } else if (name.toLowerCase().includes('statistic')) {
        return `📋 This statistical summary provides key metrics like mean, median, and standard deviation. Compare these values across columns to understand data characteristics.`;
      } else {
        return `📋 This table presents detailed information in a structured format. Review specific values to understand patterns and validate your analysis assumptions.`;
      }
    } else if (artifact.type === 'metrics') {
      return `📈 These metrics provide quantitative insights into your dataset. Use these numbers to make data-driven decisions and track analysis outcomes.`;
    }
    return '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-fadeIn">
      {/* Notebook Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Analysis Notebook</h2>
              <p className="text-sm text-gray-300">{taskTitle}</p>
            </div>
          </div>
          {executionResult && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-300" />
              <span className="text-gray-300">{executionResult.execution_time?.toFixed(2)}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Notebook Cell - Code Input (EDITABLE) */}
      <div className="border-l-4 border-blue-500">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-gray-500">In [1]:</span>
            <span className="text-xs font-semibold text-gray-700">Python Code</span>
            {isExecuting && (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-600 font-medium">Executing...</span>
              </div>
            )}
          </div>
          
          {/* Code Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              title="Copy code"
            >
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition"
              title="Edit code"
            >
              <Edit3 className="h-3 w-3" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
            {isEditing && (
              <button
                onClick={handleRunCode}
                disabled={isExecuting}
                className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Run edited code"
              >
                <Play className="h-3 w-3" />
                <span>Run</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white px-6 py-4">
          {isEditing ? (
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              className="w-full h-64 text-sm font-mono text-gray-800 bg-gray-50 border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit your Python code here..."
            />
          ) : (
            <pre className="text-sm font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap">
              <code>{pythonCode === '# Generating code...\n' && isExecuting ? '# Generating code...\n' : pythonCode}</code>
            </pre>
          )}
        </div>
      </div>

      {/* Execution Progress */}
      {isExecuting && streamEvents.length > 0 && (
        <div className="border-l-4 border-yellow-500 bg-yellow-50">
          <div className="px-6 py-4 space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">Execution Log</span>
            </div>
            {streamEvents.slice(-5).map((event, idx) => {
              const message = event.data?.message || event.event;
              const isAutoFix = message.includes('Auto-fixing') || message.includes('Error detected');
              
              return (
                <div key={idx} className="flex items-start space-x-2 text-sm">
                  <span className="text-yellow-600 mt-0.5">▸</span>
                  <span className={isAutoFix ? 'text-orange-700 font-medium' : 'text-yellow-700'}>
                    {message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notebook Cell - Output */}
      {executionResult && (
        <div className="border-l-4 border-green-500">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-gray-500">Out [1]:</span>
              <span className="text-xs font-semibold text-gray-700">Output</span>
              {executionResult.status === 'completed' ? (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Success</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">Error</span>
                </div>
              )}
            </div>
            
            {/* Chat Button */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-300 rounded-lg hover:bg-purple-100 transition"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Error Display */}
          {executionResult.error && (
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <div className="flex items-start space-x-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">Execution Error</p>
                  <pre className="text-xs font-mono text-red-700 whitespace-pre-wrap">
                    {executionResult.error}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* AI Summary */}
          {executionResult.summary && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">AI Summary</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{executionResult.summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Artifacts with Explanations */}
          {executionResult.artifacts?.map((artifact: any, idx: number) => (
            <div key={`artifact-${idx}`} className="border-b border-gray-200">
              {/* Artifact */}
              {artifact.type === 'table' && (
                <div className="px-6 py-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{artifact.name || 'Data Table'}</h4>
                  <div className="overflow-x-auto rounded-lg border border-gray-300 mb-3">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          {artifact.data[0]?.map((header: string, headerIdx: number) => (
                            <th
                              key={headerIdx}
                              className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {artifact.data.slice(1).map((row: any[], rowIdx: number) => (
                          <tr key={rowIdx} className="hover:bg-gray-50">
                            {row.map((cell: any, cellIdx: number) => (
                              <td key={cellIdx} className="px-4 py-2 text-gray-700">
                                {typeof cell === 'number' ? cell.toFixed(4) : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Explanation */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-800">💡 What this means: </span>
                      {getArtifactExplanation(artifact, idx)}
                    </p>
                  </div>
                </div>
              )}

              {artifact.type === 'plot' && (
                <div className="px-6 py-4 bg-white">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">{artifact.name || `plot_${idx + 1}`}</h4>
                  <div className="flex justify-center bg-gray-50 rounded-lg p-4 mb-3">
                    <img
                      src={`data:image/png;base64,${artifact.data}`}
                      alt={artifact.name || `plot_${idx + 1}`}
                      className="w-full max-w-4xl h-auto rounded shadow-lg"
                      style={{ minHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                  {/* Explanation */}
                  <div className="bg-green-50 border-l-4 border-green-400 px-4 py-3 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-green-800">💡 What this means: </span>
                      {getArtifactExplanation(artifact, idx)}
                    </p>
                  </div>
                </div>
              )}

              {artifact.type === 'metrics' && (
                <div className="px-6 py-4 bg-gradient-to-br from-purple-50 to-pink-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 Key Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {artifact.items?.map((metric: any, metricIdx: number) => (
                      <div
                        key={metricIdx}
                        className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <p className="text-xs font-semibold text-gray-600 uppercase">
                            {metric.name}
                          </p>
                        </div>
                        <p className="text-xl font-bold text-gray-800">
                          {typeof metric.value === 'number'
                            ? metric.value.toFixed(4)
                            : metric.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Explanation */}
                  <div className="bg-purple-50 border-l-4 border-purple-400 px-4 py-3 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-purple-800">💡 What this means: </span>
                      {getArtifactExplanation(artifact, idx)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Follow-up Suggestions */}
          {executionResult.followups && executionResult.followups.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-br from-green-50 to-teal-50">
              <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center space-x-2">
                <span>💡</span>
                <span>Next Steps</span>
              </h4>
              <ul className="space-y-2">
                {executionResult.followups.map((followup: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5">▸</span>
                    <span>{followup}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* AI Chat Panel */}
      {isChatOpen && (
        <div className="border-t-4 border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-purple-900 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Ask AI About Your Results</span>
              </h4>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="bg-white rounded-lg border border-purple-200 p-4 mb-3 max-h-64 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  💬 Ask questions about your analysis results!
                  <br />
                  <span className="text-xs">Examples: "What do these results mean?" • "What should I do next?"</span>
                </p>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isSendingChat && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-500">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask a question about the results..."
                className="flex-1 px-4 py-2 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSendingChat}
              />
              <button
                onClick={handleSendChat}
                disabled={isSendingChat || !chatInput.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notebook Footer */}
      <div className="bg-gray-100 px-6 py-3 border-t border-gray-300 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Python 3.x</span>
          <span>•</span>
          <span>Pandas, Matplotlib, Seaborn</span>
        </div>
        {executionResult && (
          <div className="flex items-center space-x-2">
            <Play className="h-3 w-3" />
            <span>Executed: {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookView;
