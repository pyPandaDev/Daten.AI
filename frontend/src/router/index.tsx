import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

// Layouts
import RootLayout from '../layouts/RootLayout';

// Pages
import HomePage from '../pages/Home';
import SummaryPage from '../pages/Summary';
import PathSelectionPage from '../pages/PathSelection';
import TasksPage from '../pages/Tasks';
import ExecutionPage from '../pages/ExecutionPage';
import AutoResultsPage from '../pages/AutoResultsPage';

// Protected Route Component
const ProtectedRoute = ({ children, requireDataset = false }: { children: React.ReactNode; requireDataset?: boolean }) => {
  const { currentDataset } = useAppStore();

  if (requireDataset && !currentDataset) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'summary',
        element: (
          <ProtectedRoute requireDataset>
            <SummaryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'path-selection',
        element: (
          <ProtectedRoute requireDataset>
            <PathSelectionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks',
        element: (
          <ProtectedRoute requireDataset>
            <TasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'execution/:taskExecutionId',
        element: <ExecutionPage />,
      },
      {
        path: 'auto-results',
        element: <AutoResultsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
