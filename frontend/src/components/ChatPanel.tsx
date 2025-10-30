import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';

interface ChatPanelProps {
  onSendGoal: (goal: string) => void;
  isLoading?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onSendGoal, isLoading = false }) => {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim() && !isLoading) {
      onSendGoal(goal);
      setGoal('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg p-8 border-2 border-purple-200 animate-scaleIn">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">💭</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          What would you like to analyze?
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="💡 Describe your analysis goals...\n\nExamples:\n• Predict customer churn patterns\n• Find correlations in sales data\n• Identify outliers and anomalies\n• Segment customers by behavior"
          className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none transition-all font-medium text-gray-700"
          rows={5}
          disabled={isLoading}
        />
        
        <button
          type="submit"
          disabled={!goal.trim() || isLoading}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-6 w-6 animate-spin" />
              <span className="text-lg">Generating suggestions...</span>
            </>
          ) : (
            <>
              <Send className="h-6 w-6" />
              <span className="text-lg">Get AI Suggestions ✨</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
