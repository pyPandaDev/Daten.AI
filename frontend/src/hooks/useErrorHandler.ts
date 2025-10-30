import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ErrorState {
  error: string | null;
  isError: boolean;
}

/**
 * ⚡ IMPROVEMENT: Centralized error handling hook
 * Provides consistent error handling across the app
 */
export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
  });

  const handleError = useCallback((error: unknown) => {
    console.error('[useErrorHandler]', error);

    let errorMessage = 'An unexpected error occurred';

    if (error instanceof AxiosError) {
      if (error.response) {
        const data = error.response.data as any;
        errorMessage = data?.detail || data?.message || `Error ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    setErrorState({
      error: errorMessage,
      isError: true,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
    });
  }, []);

  const resetError = clearError; // Alias for clarity

  return {
    error: errorState.error,
    isError: errorState.isError,
    handleError,
    clearError,
    resetError,
  };
};

/**
 * ⚡ IMPROVEMENT: Async operation wrapper with error handling
 */
export const useAsyncHandler = <T extends any[], R>(
  asyncFunction: (...args: T) => Promise<R>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { error, isError, handleError, clearError } = useErrorHandler();

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      setIsLoading(true);
      clearError();

      try {
        const result = await asyncFunction(...args);
        return result;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction, handleError, clearError]
  );

  return {
    execute,
    isLoading,
    error,
    isError,
    clearError,
  };
};
