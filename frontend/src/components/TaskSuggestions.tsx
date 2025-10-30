import React, { useMemo, useState } from 'react';
import { TaskSuggestion } from '../services/api';
import { 
  BarChart3, 
  Sparkles, 
  Eye, 
  Wrench, 
  TrendingUp, 
  FlaskConical,
  Zap,
  Brain,
  Target,
  Activity,
  Layers,
  GitBranch
} from 'lucide-react';

interface TaskSuggestionsProps {
  suggestions: TaskSuggestion[];
  onSelectTask: (task: TaskSuggestion) => void;
  selectedTaskId?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  exploratory_data_analysis: <Eye className="h-5 w-5" />,
  eda: <Eye className="h-5 w-5" />,
  data_cleaning_preprocessing: <Wrench className="h-5 w-5" />,
  cleaning: <Wrench className="h-5 w-5" />,
  data_visualization: <BarChart3 className="h-5 w-5" />,
  visualization: <BarChart3 className="h-5 w-5" />,
  feature_engineering: <Sparkles className="h-5 w-5" />,
  data_transformation_encoding: <Zap className="h-5 w-5" />,
  statistical_analysis: <FlaskConical className="h-5 w-5" />,
  statistical_testing: <FlaskConical className="h-5 w-5" />,
  feature_selection: <Target className="h-5 w-5" />,
  ml_regression: <TrendingUp className="h-5 w-5" />,
  ml_classification: <Brain className="h-5 w-5" />,
  ml_clustering: <GitBranch className="h-5 w-5" />,
  modeling: <TrendingUp className="h-5 w-5" />,
  dimensionality_reduction: <Layers className="h-5 w-5" />,
  time_series: <Activity className="h-5 w-5" />,
  model_interpretation: <Eye className="h-5 w-5" />,
  advanced_analytics: <Brain className="h-5 w-5" />,
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
};

const TaskSuggestions: React.FC<TaskSuggestionsProps> = ({
  suggestions,
  onSelectTask,
  selectedTaskId,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'title'>('priority');

  const categories = useMemo(() => {
    const set = new Set<string>(['all']);
    suggestions.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [suggestions]);

  const filtered = useMemo(() => {
    const prioRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const timeToMinutes = (t: string) => {
      // expects formats like "1-2 minutes", "3-5 minutes"
      const m = t?.match(/(\d+)(?:-(\d+))?\s*min/);
      if (!m) return 999;
      const a = parseInt(m[1], 10);
      const b = m[2] ? parseInt(m[2], 10) : a;
      return (a + b) / 2;
    };

    let list = suggestions.filter((s) => {
      const matchesQuery = !query ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === 'all' || s.category === activeCategory;
      return matchesQuery && matchesCat;
    });

    list = list.sort((a, b) => {
      if (sortBy === 'priority') return prioRank[a.priority] - prioRank[b.priority];
      if (sortBy === 'time') return timeToMinutes(a.estimated_time) - timeToMinutes(b.estimated_time);
      return a.title.localeCompare(b.title);
    });

    return list;
  }, [suggestions, query, activeCategory, sortBy]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search tasks..."
          className="w-full md:w-1/2 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
        />

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          >
            <option value="priority">Priority</option>
            <option value="time">Estimated time</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-600 shadow-md scale-105'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
            title={cat === 'all' ? 'All categories' : cat.replace('_', ' ')}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((task) => (
          <div
            key={task.id}
            onClick={() => onSelectTask(task)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-102 hover:shadow-xl ${
              selectedTaskId === task.id
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-102'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1 text-primary-600">
                {categoryIcons[task.category] || <Eye className="h-5 w-5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {task.title}
                  </h3>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {task.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{task.category.replace('_', ' ')}</span>
                  <span>{task.estimated_time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskSuggestions;
