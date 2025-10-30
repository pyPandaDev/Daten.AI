import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DatasetSchema {
  columns: string[];
  dtypes: Record<string, string>;
  shape: number[];
  sample_rows: Record<string, any>[];
  null_counts: Record<string, number>;
  memory_usage: string;
}

export interface StatisticsSummary {
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

export interface UploadResponse {
  file_id: string;
  filename: string;
  dataset_schema: DatasetSchema;
  message: string;
  gemini_insights?: string;
  user_goal?: string;
  table_preview?: Record<string, any>[];
  statistics_summary?: StatisticsSummary;
}

export interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_time: string;
  priority: string;
}

export interface SuggestResponse {
  suggestions: TaskSuggestion[];
  assumptions: string[];
}

export interface AIRecommendation {
  recommended_path: 'analysis' | 'datascience';
  confidence: number;
  reasoning: string;
  suggested_tasks: string[];
  data_characteristics: string[];
}

export interface RecommendResponse {
  recommendation: AIRecommendation;
}

export interface FeatureRecommendation {
  feature_ids: string[];
  reasoning: string;
  data_insights: string[];
}

export interface RunResponse {
  task_execution_id: string;
  status: string;
  message: string;
}

export interface ExecutionResult {
  task_execution_id: string;
  status: string;
  plan: string[];
  assumptions: string[];
  python_code: string;
  artifacts: any[];
  summary: string;
  followups: string[];
  error?: string;
  execution_time: number;
}

export interface ExportResponse {
  download: {
    type: string;
    name: string;
    data: string;
  };
}

// Upload dataset
export const uploadDataset = async (
  file: File,
  userGoal?: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (userGoal) {
    formData.append('user_goal', userGoal);
  }

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Get task suggestions
export const getSuggestions = async (
  fileId: string,
  datasetSchema: DatasetSchema,
  userGoal?: string,
  path?: 'analysis' | 'datascience'
): Promise<SuggestResponse> => {
  const response = await api.post<SuggestResponse>('/suggest', {
    file_id: fileId,
    dataset_schema: datasetSchema,
    user_goal: userGoal,
    path: path,
  });

  return response.data;
};

// Get AI recommendation
export const getAIRecommendation = async (
  fileId: string,
  datasetSchema: DatasetSchema
): Promise<RecommendResponse> => {
  const response = await api.post<RecommendResponse>('/recommend', {
    file_id: fileId,
    dataset_schema: datasetSchema,
  });

  return response.data;
};

// Run task
export const runTask = async (
  fileId: string,
  taskId: string,
  taskTitle: string,
  datasetSchema: DatasetSchema,
  parameters?: Record<string, any>
): Promise<RunResponse> => {
  const response = await api.post<RunResponse>('/run', {
    file_id: fileId,
    task_id: taskId,
    task_title: taskTitle,
    dataset_schema: datasetSchema,
    parameters: parameters || {},
  });

  return response.data;
};

// Cancel task execution
export const cancelTask = async (taskExecutionId: string): Promise<void> => {
  await api.delete(`/run/${taskExecutionId}`);
};

// Get stream URL
export const getStreamUrl = (taskExecutionId: string): string => {
  return `${API_BASE_URL}/stream/${taskExecutionId}`;
};

// Export to PDF
export const exportToPdf = async (
  taskExecutionId: string,
  resultData?: any
): Promise<ExportResponse> => {
  const response = await api.post<ExportResponse>('/export/pdf', {
    task_execution_id: taskExecutionId,
    export_type: 'pdf',
    result_data: resultData,
  });

  return response.data;
};

// Export to CSV
export const exportToCsv = async (
  taskExecutionId: string,
  resultData?: any
): Promise<ExportResponse> => {
  const response = await api.post<ExportResponse>('/export/csv', {
    task_execution_id: taskExecutionId,
    export_type: 'csv',
    result_data: resultData,
  });

  return response.data;
};

// Ask question about dataset
export const askDatasetQuestion = async (
  fileId: string,
  message: string,
  datasetSchema: DatasetSchema
): Promise<string> => {
  const response = await api.post<{ response: string }>('/chat/dataset', {
    file_id: fileId,
    message: message,
    dataset_schema: datasetSchema,
  });

  return response.data.response;
};

// Ask question about execution results
export const askResultsQuestion = async (
  message: string,
  executionResult: any,
  pythonCode?: string
): Promise<string> => {
  const response = await api.post<{ response: string }>('/chat/results', {
    message: message,
    execution_result: executionResult,
    python_code: pythonCode,
  });

  return response.data.response;
};

// Get AI feature recommendations for manual mode
export const getFeatureRecommendations = async (
  fileId: string,
  datasetSchema: DatasetSchema,
  selectedPath: 'analysis' | 'datascience'
): Promise<FeatureRecommendation> => {
  const response = await api.post<FeatureRecommendation>('/recommend-features', {
    file_id: fileId,
    dataset_schema: datasetSchema,
    path: selectedPath,
  });

  return response.data;
};

export default api;
