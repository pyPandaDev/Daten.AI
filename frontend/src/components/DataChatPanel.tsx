import React, { useState } from 'react';
import { MessageSquare, Send, Loader } from 'lucide-react';

interface DataChatPanelProps {
  fileId: string;
  onAskQuestion: (question: string) => Promise<string>;
}

const DataChatPanel: React.FC<DataChatPanelProps> = ({ fileId, onAskQuestion }) => {
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setIsAskingQuestion(true);

    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', text: question }]);

    try {
      const answer = await onAskQuestion(question);
      
      // Format response to be concise and organized
      const formattedAnswer = formatResponse(answer);
      setChatMessages(prev => [...prev, { role: 'ai', text: formattedAnswer }]);
    } catch (error) {
      setChatMessages(prev => [
        ...prev,
        { role: 'ai', text: '❌ Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsAskingQuestion(false);
    }
  };

  // Format AI response to be concise and organized
  const formatResponse = (text: string): string => {
    // Limit length and organize into bullet points if possible
    const lines = text.split('\n').filter(line => line.trim());
    
    // If response is long, take first 5 key points
    if (lines.length > 5) {
      const keyPoints = lines.slice(0, 5).map((line, idx) => {
        const cleaned = line.replace(/^\d+\.\s*|^-\s*|^\*\s*/, '').trim();
        return `${idx + 1}. ${cleaned}`;
      });
      return keyPoints.join('\n');
    }
    
    // If response is too long, truncate
    if (text.length > 500) {
      return text.substring(0, 500) + '...';
    }
    
    return text;
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 shadow-2xl">
      {/* Chatbot Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <MessageSquare className="h-7 w-7 text-white animate-pulse" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Data Assistant</h3>
          <p className="text-blue-100 text-sm">Chat with your data in real-time</p>
        </div>
      </div>
      
      {/* Chat Messages Area */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 mb-4 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🤖</span>
            </div>
            <p className="text-white font-medium mb-2">Ask me about your data</p>
            <p className="text-blue-100 text-sm mb-4">Get instant insights and analysis</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={() => setCurrentQuestion("What are the key patterns?")}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition"
              >
                📊 Key patterns
              </button>
              <button
                onClick={() => setCurrentQuestion("Which columns have missing values?")}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition"
              >
                🔍 Missing values
              </button>
              <button
                onClick={() => setCurrentQuestion("What relationships exist?")}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition"
              >
                🔗 Relationships
              </button>
              <button
                onClick={() => setCurrentQuestion("Suggest analysis approaches")}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition"
              >
                💡 Analysis ideas
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-white text-gray-800'
                      : 'bg-blue-500/30 backdrop-blur-sm text-white border border-white/20'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-base flex-shrink-0">
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </span>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {isAskingQuestion && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-blue-500/30 backdrop-blur-sm text-white border border-white/20 p-3 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
          placeholder="Ask me anything about your data..."
          className="flex-1 px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-500 text-sm font-medium shadow-lg"
          disabled={isAskingQuestion}
        />
        <button
          onClick={handleAskQuestion}
          disabled={!currentQuestion.trim() || isAskingQuestion}
          className="px-5 py-3 bg-white hover:bg-gray-100 text-blue-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isAskingQuestion ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default DataChatPanel;
