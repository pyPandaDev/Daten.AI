import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import NotebookView from '../components/NotebookView';
import ResultsChat from '../components/ResultsChat';
import NextStepsPanel from '../components/NextStepsPanel';
import ExportPanel from '../components/ExportPanel';
import { useStream } from '../hooks/useStream';
import { exportToPdf, exportToCsv, ExecutionResult, askResultsQuestion, runTask, cancelTask } from '../services/api';
import { useAppStore } from '../store/useAppStore';

interface ExecutionBlock {
  id: string;
  title: string;
  pythonCode: string;
  executionResult: ExecutionResult | null;
  isExecuting: boolean;
}

const ExecutionPage: React.FC = () => {
  const { taskExecutionId } = useParams<{ taskExecutionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentStep } = useAppStore();

  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);
  
  // Multiple execution blocks for continuous flow
  const [executionBlocks, setExecutionBlocks] = useState<ExecutionBlock[]>([]);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  
  const [taskTitle] = useState<string>('Analysis Task');
  const [isExporting, setIsExporting] = useState(false);
  const [executingStep, setExecutingStep] = useState<string | null>(null);

  // Stream hook for first execution
  const { events: streamEvents } = useStream(taskExecutionId || null);

  // Cancel execution when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      // Cancel all active executions when leaving the page
      executionBlocks.forEach(block => {
        if (block.isExecuting) {
          console.log(`[CANCEL] Cancelling task ${block.id} due to navigation`);
          cancelTask(block.id).catch(err => 
            console.error(`[CANCEL] Error cancelling task ${block.id}:`, err)
          );
        }
      });
    };
  }, [executionBlocks]);

  // Initialize first execution block
  useEffect(() => {
    if (taskExecutionId && executionBlocks.length === 0) {
      setExecutionBlocks([{
        id: taskExecutionId,
        title: 'Initial Analysis',
        pythonCode: '# Generating code...\n',
        executionResult: null,
        isExecuting: true,
      }]);
      setCurrentBlockId(taskExecutionId);
    }
  }, [taskExecutionId]);

  // Listen for stream events
  useEffect(() => {
    if (streamEvents.length === 0 || !currentBlockId) return;
    
    const latestEvent = streamEvents[streamEvents.length - 1];
    
    // Update code
    if (latestEvent.event === 'code_generation' && latestEvent.data?.python_code) {
      setExecutionBlocks(prev => prev.map(block =>
        block.id === currentBlockId
          ? { ...block, pythonCode: latestEvent.data.python_code }
          : block
      ));
    }
    
    // Handle completion
    if (latestEvent.event === 'complete') {
      setExecutionBlocks(prev => prev.map(block =>
        block.id === currentBlockId
          ? { ...block, executionResult: latestEvent.data as ExecutionResult, isExecuting: false }
          : block
      ));
    }
    
    // Handle error
    if (latestEvent.event === 'error') {
      setExecutionBlocks(prev => prev.map(block =>
        block.id === currentBlockId
          ? { ...block, executionResult: { ...latestEvent.data, status: 'failed' } as ExecutionResult, isExecuting: false }
          : block
      ));
    }
  }, [streamEvents, currentBlockId]);

  // Polling for results - Only as fallback, less aggressive
  useEffect(() => {
    if (!currentBlockId) return;
    
    const currentBlock = executionBlocks.find(b => b.id === currentBlockId);
    if (!currentBlock || !currentBlock.isExecuting) return;

    let pollInterval: NodeJS.Timeout | null = null;
    let isCancelled = false;

    // Wait 3 seconds before starting to poll (give stream time to work)
    const startDelay = setTimeout(() => {
      if (isCancelled) return;
      
      let attemptCount = 0;
      const maxAttempts = 20; // Max 20 attempts = 100 seconds
      
      pollInterval = setInterval(async () => {
        if (isCancelled) {
          if (pollInterval) clearInterval(pollInterval);
          return;
        }
        
        attemptCount++;
        
        try {
          const response = await fetch(`http://localhost:8000/api/results/${currentBlockId}`);
          
          if (response.ok) {
            const result = await response.json();
            if (result.status === 'completed' || result.status === 'failed') {
              setExecutionBlocks(prev => prev.map(block =>
                block.id === currentBlockId
                  ? { ...block, executionResult: result, isExecuting: false, pythonCode: result.python_code || block.pythonCode }
                  : block
              ));
              if (pollInterval) clearInterval(pollInterval);
            }
          } else if (response.status === 404) {
            // 404 is expected while task is executing, don't log it
            if (attemptCount >= maxAttempts) {
              console.warn('[POLLING] Max attempts reached, stopping poll');
              if (pollInterval) clearInterval(pollInterval);
            }
          }
        } catch (error) {
          // Only log non-404 errors
          if (attemptCount >= maxAttempts) {
            console.error('[POLLING] Error after max attempts:', error);
            if (pollInterval) clearInterval(pollInterval);
          }
        }
      }, 5000); // Poll every 5 seconds (less aggressive)
    }, 3000); // Wait 3 seconds before starting

    return () => {
      isCancelled = true;
      clearTimeout(startDelay);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentBlockId, executionBlocks]);

  // Handle next step execution
  const handleExecuteNextStep = async (step: string) => {
    if (!taskExecutionId) return;
    
    setExecutingStep(step);
    
    try {
      // Get the original file_id and dataset_schema from first block's result
      const firstBlock = executionBlocks[0];
      if (!firstBlock?.executionResult) {
        alert('Cannot execute next step: Original execution data not found');
        setExecutingStep(null);
        return;
      }

      // Extract file_id and dataset_schema from the stored result
      const fileId = (firstBlock.executionResult as any).file_id;
      const datasetSchema = (firstBlock.executionResult as any).dataset_schema;

      if (!fileId || !datasetSchema) {
        alert('Cannot execute next step: Dataset information not available');
        setExecutingStep(null);
        return;
      }

      console.log('[NEXT_STEP] Executing with file_id:', fileId);

      // Create a new task for this step
      const response = await runTask(
        fileId, // Use the stored file_id
        `next-step-${Date.now()}`,
        step,
        datasetSchema // Use the stored dataset_schema
      );
      
      const newBlockId = response.task_execution_id;
      
      // Add new execution block
      setExecutionBlocks(prev => [...prev, {
        id: newBlockId,
        title: step,
        pythonCode: '# Generating code...\n',
        executionResult: null,
        isExecuting: true,
      }]);
      
      setCurrentBlockId(newBlockId);
      
      // Scroll to new block
      setTimeout(() => {
        document.getElementById(`block-${newBlockId}`)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('[NEXT_STEP] Error:', error);
      alert('Failed to execute next step. Please try again.');
    } finally {
      setExecutingStep(null);
    }
  };

  // Handle results chat
  const handleAskResultsQuestion = async (question: string): Promise<string> => {
    // Get the most recent completed execution
    const completedBlocks = executionBlocks.filter(b => b.executionResult && b.executionResult.status === 'completed');
    if (completedBlocks.length === 0) {
      throw new Error('No completed results to ask about');
    }
    
    const latestResult = completedBlocks[completedBlocks.length - 1];
    
    try {
      const answer = await askResultsQuestion(
        question,
        latestResult.executionResult,
        latestResult.pythonCode
      );
      return answer;
    } catch (error) {
      console.error('[RESULTS_CHAT] Error:', error);
      throw error;
    }
  };

  // Handle exports (using first/main execution)
  const handleExportPdf = async () => {
    if (!taskExecutionId) return;
    setIsExporting(true);
    try {
      const response = await exportToPdf(taskExecutionId);
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${response.download.data}`;
      link.download = response.download.name;
      link.click();
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = async () => {
    if (!taskExecutionId) return;
    setIsExporting(true);
    try {
      const response = await exportToCsv(taskExecutionId);
      const link = document.createElement('a');
      link.href = `data:text/csv;base64,${response.download.data}`;
      link.download = response.download.name;
      link.click();
    } catch (error) {
      console.error('CSV export error:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const hasCompletedResults = executionBlocks.some(b => b.executionResult?.status === 'completed');

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 shadow-lg sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={async () => {
                // Cancel all active executions IMMEDIATELY before navigation
                const activeBlocks = executionBlocks.filter(block => block.isExecuting);
                if (activeBlocks.length > 0) {
                  console.log(`[CANCEL] Cancelling ${activeBlocks.length} active task(s) before navigation`);
                  await Promise.all(
                    activeBlocks.map(block => 
                      cancelTask(block.id).catch(err => 
                        console.error(`[CANCEL] Error cancelling task ${block.id}:`, err)
                      )
                    )
                  );
                }
                
                // Use location state if available, otherwise go back
                const state = location.state as any;
                if (state?.previousPath) {
                  navigate(state.previousPath);
                } else {
                  navigate(-1);
                }
              }}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">
                Continuous Analysis Flow
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {executionBlocks.length} analysis block{executionBlocks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportPdf}
                disabled={!hasCompletedResults || isExporting}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={handleExportCsv}
                disabled={!hasCompletedResults || isExporting}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Render all execution blocks */}
          {executionBlocks.map((block, index) => (
            <div key={block.id} id={`block-${block.id}`} className="space-y-6">
              {/* Block Header */}
              {index > 0 && (
                <div className="flex items-center space-x-3 py-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-sm shadow-lg">
                    Step {index + 1}: {block.title}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-600 via-transparent to-transparent"></div>
                </div>
              )}

              {/* Notebook View */}
              <NotebookView
                taskTitle={index === 0 ? taskTitle : block.title}
                pythonCode={block.pythonCode}
                isExecuting={block.isExecuting}
                executionResult={block.executionResult}
                streamEvents={block.id === currentBlockId ? streamEvents : []}
                onReExecute={() => {
                  alert('⚠️ Code re-execution feature is planned for a future update.');
                }}
              />

              {/* Results Chat - Show for completed blocks */}
              {block.executionResult && block.executionResult.status === 'completed' && (
                <ResultsChat onAskQuestion={handleAskResultsQuestion} />
              )}

              {/* Next Steps Panel - Only show for the last completed block */}
              {block.executionResult &&
                block.executionResult.status === 'completed' &&
                block.executionResult.followups &&
                block.executionResult.followups.length > 0 &&
                index === executionBlocks.length - 1 &&
                !block.isExecuting && (
                  <NextStepsPanel
                    followups={block.executionResult.followups}
                    onExecuteStep={handleExecuteNextStep}
                    executingStep={executingStep}
                  />
                )}
            </div>
          ))}

          {/* Export Panel - Show at bottom */}
          {hasCompletedResults && (
            <ExportPanel
              taskExecutionId={taskExecutionId || null}
              onExportPdf={handleExportPdf}
              onExportCsv={handleExportCsv}
              isExporting={isExporting}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ExecutionPage;
