import React, { useState } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { TaskSuggestion } from '../services/api';

interface TaskEditorProps {
  suggestions: TaskSuggestion[];
  onUpdateSuggestions: (suggestions: TaskSuggestion[]) => void;
  onClose: () => void;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ suggestions, onUpdateSuggestions, onClose }) => {
  const [tasks, setTasks] = useState<TaskSuggestion[]>(suggestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TaskSuggestion>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<TaskSuggestion>>({
    title: '',
    description: '',
    category: 'eda',
    priority: 'medium',
    estimated_time: '2-3 minutes',
  });

  const handleRemove = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleEdit = (task: TaskSuggestion) => {
    setEditingId(task.id);
    setEditForm(task);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? { ...t, ...editForm } : t));
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleAddTask = () => {
    if (newTask.title && newTask.description) {
      const task: TaskSuggestion = {
        id: `custom_${Date.now()}`,
        title: newTask.title!,
        description: newTask.description!,
        category: newTask.category || 'eda',
        priority: newTask.priority || 'medium',
        estimated_time: newTask.estimated_time || '2-3 minutes',
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        category: 'eda',
        priority: 'medium',
        estimated_time: '2-3 minutes',
      });
      setShowAddForm(false);
    }
  };

  const handleSave = () => {
    onUpdateSuggestions(tasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Edit2 className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Edit Analysis Tasks</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Task List */}
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
            >
              {editingId === task.id ? (
                // Edit Form
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Task title"
                  />
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    rows={2}
                    placeholder="Task description"
                  />
                  <div className="flex gap-3">
                    <select
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="eda">EDA</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="visualization">Visualization</option>
                      <option value="modeling">Modeling</option>
                      <option value="feature_engineering">Feature Engineering</option>
                      <option value="statistical_testing">Statistical Testing</option>
                    </select>
                    <select
                      value={editForm.priority || ''}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {task.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                        {task.estimated_time}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRemove(task.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove task"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add New Task */}
          {showAddForm ? (
            <div className="border-2 border-dashed border-purple-300 rounded-xl p-4 bg-purple-50">
              <h3 className="font-semibold text-gray-800 mb-3">Add Custom Task</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Task title (e.g., 'Custom Correlation Analysis')"
                />
                <textarea
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={2}
                  placeholder="Task description (what should this analysis do?)"
                />
                <div className="flex gap-3">
                  <select
                    value={newTask.category || ''}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="flex-1 px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="eda">EDA</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="visualization">Visualization</option>
                    <option value="modeling">Modeling</option>
                    <option value="feature_engineering">Feature Engineering</option>
                    <option value="statistical_testing">Statistical Testing</option>
                  </select>
                  <select
                    value={newTask.priority || ''}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Task</span>
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-purple-600"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add Custom Task</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} • Changes will apply immediately
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;
