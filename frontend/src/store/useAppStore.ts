import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DatasetSchema, TaskSuggestion, StatisticsSummary } from '../services/api';

// Types
export interface UploadedDataset {
  fileId: string;
  filename: string;
  datasetSchema: DatasetSchema;
  geminiInsights?: string;
  tablePreview?: Record<string, any>[];
  statisticsSummary?: StatisticsSummary;
  uploadedAt: number;
}

export interface AppState {
  // Dataset state
  currentDataset: UploadedDataset | null;
  
  // Workflow state
  selectedPath: 'analysis' | 'datascience' | null;
  selectedMode: 'manual' | 'automatic' | null;
  suggestions: TaskSuggestion[];
  
  // UI state
  isUploading: boolean;
  isLoadingSuggestions: boolean;
  currentStep: number;
  
  // Execution state
  currentExecutionId: string | null;
  executedTaskIds: string[];
  
  // Actions
  setDataset: (dataset: UploadedDataset) => void;
  clearDataset: () => void;
  setPath: (path: 'analysis' | 'datascience') => void;
  setMode: (mode: 'manual' | 'automatic') => void;
  setSuggestions: (suggestions: TaskSuggestion[]) => void;
  setIsUploading: (loading: boolean) => void;
  setIsLoadingSuggestions: (loading: boolean) => void;
  setCurrentStep: (step: number) => void;
  setCurrentExecutionId: (id: string | null) => void;
  addExecutedTaskId: (id: string) => void;
  resetWorkflow: () => void;
  resetAll: () => void;
}

const initialState = {
  currentDataset: null,
  selectedPath: null,
  selectedMode: null,
  suggestions: [],
  isUploading: false,
  isLoadingSuggestions: false,
  currentStep: 1,
  currentExecutionId: null,
  executedTaskIds: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      // Dataset actions
      setDataset: (dataset) =>
        set({
          currentDataset: dataset,
          currentStep: 2,
        }),

      clearDataset: () =>
        set({
          currentDataset: null,
          currentStep: 1,
        }),

      // Workflow actions
      setPath: (path) =>
        set({
          selectedPath: path,
          currentStep: 3,
        }),

      setMode: (mode) =>
        set({
          selectedMode: mode,
          currentStep: 4,
        }),

      setSuggestions: (suggestions) =>
        set({
          suggestions,
          currentStep: 5,
        }),

      // UI actions
      setIsUploading: (isUploading) => set({ isUploading }),
      setIsLoadingSuggestions: (isLoadingSuggestions) => set({ isLoadingSuggestions }),
      setCurrentStep: (currentStep) => set({ currentStep }),

      // Execution actions
      setCurrentExecutionId: (currentExecutionId) => set({ currentExecutionId }),
      
      addExecutedTaskId: (id) =>
        set((state) => ({
          executedTaskIds: [...state.executedTaskIds, id],
        })),

      // Reset actions
      resetWorkflow: () =>
        set({
          selectedPath: null,
          selectedMode: null,
          suggestions: [],
          currentStep: 2,
          currentExecutionId: null,
        }),

      resetAll: () => set(initialState),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentDataset: state.currentDataset,
        selectedPath: state.selectedPath,
        selectedMode: state.selectedMode,
        suggestions: state.suggestions,
        currentStep: state.currentStep,
        executedTaskIds: state.executedTaskIds,
      }),
    }
  )
);
