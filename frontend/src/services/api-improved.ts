import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ⚡ IMPROVEMENT: Add request timeout and retry logic
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ⚡ IMPROVEMENT: Retry logic for transient failures
const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const axiosError = error as AxiosError;
      
      // Don't retry on 4xx errors (client errors)
      if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
        throw error;
      }
      
      // Only retry on network errors or 5xx errors
      if (i < maxRetries - 1) {
        console.log(`[RETRY] Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// ⚡ IMPROVEMENT: Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚡ IMPROVEMENT: Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = getErrorMessage(error);
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

// ⚡ IMPROVEMENT: Better error messages
const getErrorMessage = (error: AxiosError): string => {
  if (error.response) {
    const data = error.response.data as any;
    return data?.detail || data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    return 'No response from server. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred';
};

// Types (unchanged)
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

// ⚡ IMPROVEMENT: File size validation (50MB limit)
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 50MB`,
    };
  }
  
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
  ];
  
  if (!allowedTypes.includes(file.type) && 
      !file.name.endsWith('.csv') && 
      !file.name.endsWith('.xlsx') && 
      !file.name.endsWith('.json')) {
    return {
      valid: false,
      error: 'Only CSV, Excel (.xlsx), and JSON files are supported',
    };
  }
  
  return { valid: true };
};

// Upload dataset with retry logic
export const uploadDataset = async (
  file: File,
  userGoal?: string
): Promise<UploadResponse> => {
  // Validate file before upload
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  return retryRequest(async () => {
    const formData = new FormData();
    formData.append('file', file);
    if (userGoal) {
      formData.append('user_goal', userGoal);
    }

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 1 minute for file upload
    });

    return response.data;
  });
};

// Get task suggestions with retry
export const getSuggestions = async (
  fileId: string,
  datasetSchema: DatasetSchema,
  userGoal?: string,
  path?: 'analysis' | 'datascience'
): Promise<SuggestResponse> => {
  return retryRequest(async () => {
    const response = await api.post<SuggestResponse>('/suggest', {
      file_id: fileId,
      dataset_schema: datasetSchema,
      user_goal: userGoal,
      path: path,
    });
    return response.data;
  });
};

// Get AI recommendation
export const getAIRecommendation = async (
  fileId: string,
  datasetSchema: DatasetSchema
): Promise<RecommendResponse> => {
  return retryRequest(async () => {
    const response = await api.post<RecommendResponse>('/recommend', {
      file_id: fileId,
      dataset_schema: datasetSchema,
    });
    return response.data;
  });
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
  return retryRequest(async () => {
    const response = await api.post<ExportResponse>('/export/pdf', {
      task_execution_id: taskExecutionId,
      export_type: 'pdf',
      result_data: resultData,
    });
    return response.data;
  });
};

// Export to CSV
export const exportToCsv = async (
  taskExecutionId: string,
  resultData?: any
): Promise<ExportResponse> => {
  return retryRequest(async () => {
    const response = await api.post<ExportResponse>('/export/csv', {
      task_execution_id: taskExecutionId,
      export_type: 'csv',
      result_data: resultData,
    });
    return response.data;
  });
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
  return retryRequest(async () => {
    const response = await api.post<FeatureRecommendation>('/recommend-features', {
      file_id: fileId,
      dataset_schema: datasetSchema,
      path: selectedPath,
    });
    return response.data;
  });
};

// ⚡ NEW: Health check endpoint
export const healthCheck = async (): Promise<{ status: string; system: any }> => {
  const response = await api.get('/health');
  return response.data;
};

export { getErrorMessage };
export default api;
