import React, { useState } from 'react';
import { MessageSquare, Send, Loader, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface ResultsChatProps {
  onAskQuestion: (question: string) => Promise<string>;
}

const ResultsChat: React.FC<ResultsChatProps> = ({ onAskQuestion }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAsk = async () => {
    if (!currentQuestion.trim() || isAsking) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setIsAsking(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: question }]);

    try {
      const answer = await onAskQuestion(question);
      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const suggestedQuestions = [
    "What do these results mean?",
    "Are there any outliers in this data?",
    "What should I investigate next?",
    "Explain the visualizations",
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-indigo-100/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-800">Ask About These Results</h3>
            <p className="text-sm text-gray-600">Get clarifications and insights from AI</p>
          </div>
        </div>
        <span className="text-2xl text-indigo-600">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* Chat Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Quick questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(q)}
                    className="text-left px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  >
                    💡 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${
                    msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-indigo-600' : 'bg-white border-2 border-indigo-200'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <div
                    className={`flex-1 px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-indigo-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask anything about these results..."
              className="flex-1 px-4 py-3 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              disabled={isAsking}
            />
            <button
              onClick={handleAsk}
              disabled={!currentQuestion.trim() || isAsking}
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              {isAsking ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsChat;
