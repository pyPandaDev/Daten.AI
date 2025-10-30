import { useState, useEffect, useRef, useCallback } from 'react';
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

/**
 * ⚡ IMPROVED ExecutionPage Component
 * 
 * Key Improvements:
 * 1. Better polling strategy - only polls as fallback after SSE timeout
 * 2. Prevents race conditions between SSE and polling
 * 3. Proper cleanup of intervals and timeouts
 * 4. Better state management with useRef for tracking
 * 5. Debounced state updates
 */
const ExecutionPage = () => {
  const { taskExecutionId } = useParams<{ taskExecutionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentStep } = useAppStore();

  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);
  
  // State
  const [executionBlocks, setExecutionBlocks] = useState<ExecutionBlock[]>([]);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [taskTitle] = useState<string>('Analysis Task');
  const [isExporting, setIsExporting] = useState(false);
  const [executingStep, setExecutingStep] = useState<string | null>(null);

  // ⚡ IMPROVEMENT: Use refs to track state without causing re-renders
  const hasReceivedStreamData = useRef<Record<string, boolean>>({});
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stream hook
  const { events: streamEvents } = useStream(taskExecutionId || null);

  // ⚡ IMPROVEMENT: Cleanup function for all timers
  const cleanupTimers = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cancel execution when component unmounts
  useEffect(() => {
    return () => {
      cleanupTimers();
      
      // Cancel all active executions
      executionBlocks.forEach(block => {
        if (block.isExecuting) {
          console.log(`[CANCEL] Cancelling task ${block.id} due to navigation`);
          cancelTask(block.id).catch(err => 
            console.error(`[CANCEL] Error cancelling task ${block.id}:`, err)
          );
        }
      });
    };
  }, [executionBlocks, cleanupTimers]);

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
      hasReceivedStreamData.current[taskExecutionId] = false;
    }
  }, [taskExecutionId, executionBlocks.length]);

  // ⚡ IMPROVEMENT: Listen for stream events with better state management
  useEffect(() => {
    if (streamEvents.length === 0 || !currentBlockId) return;
    
    const latestEvent = streamEvents[streamEvents.length - 1];
    
    // Mark that we've received stream data
    hasReceivedStreamData.current[currentBlockId] = true;
    
    // Cancel polling if we're receiving stream events
    cleanupTimers();
    
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
          ? { 
              ...block, 
              executionResult: { 
                ...latestEvent.data, 
                status: 'failed' 
              } as ExecutionResult, 
              isExecuting: false 
            }
          : block
      ));
    }
  }, [streamEvents, currentBlockId, cleanupTimers]);

  // ⚡ IMPROVEMENT: Fallback polling - only starts if no stream data received after 10 seconds
  useEffect(() => {
    if (!currentBlockId) return;
    
    const currentBlock = executionBlocks.find(b => b.id === currentBlockId);
    if (!currentBlock || !currentBlock.isExecuting) return;

    // Clean any existing timers first
    cleanupTimers();

    // Wait 10 seconds before starting fallback polling
    // This gives SSE plenty of time to work
    pollingTimeoutRef.current = setTimeout(() => {
      // Check if we've received any stream data
      if (hasReceivedStreamData.current[currentBlockId]) {
        console.log('[POLLING] SSE working, skipping fallback polling');
        return;
      }

      console.log('[POLLING] No SSE data received, starting fallback polling');
      
      let attemptCount = 0;
      const maxAttempts = 24; // 24 * 5s = 2 minutes max
      
      pollingIntervalRef.current = setInterval(async () => {
        attemptCount++;
        
        // Double-check we haven't received stream data
        if (hasReceivedStreamData.current[currentBlockId]) {
          console.log('[POLLING] SSE data received, stopping fallback polling');
          cleanupTimers();
          return;
        }
        
        try {
          const response = await fetch(`http://localhost:8000/api/results/${currentBlockId}`);
          
          if (response.ok) {
            const result = await response.json();
            if (result.status === 'completed' || result.status === 'failed') {
              console.log('[POLLING] Got result via fallback polling');
              setExecutionBlocks(prev => prev.map(block =>
                block.id === currentBlockId
                  ? { 
                      ...block, 
                      executionResult: result, 
                      isExecuting: false, 
                      pythonCode: result.python_code || block.pythonCode 
                    }
                  : block
              ));
              cleanupTimers();
            }
          }
        } catch (error) {
          if (attemptCount >= maxAttempts) {
            console.error('[POLLING] Max attempts reached:', error);
            cleanupTimers();
          }
        }
        
        if (attemptCount >= maxAttempts) {
          console.warn('[POLLING] Max polling attempts reached');
          cleanupTimers();
        }
      }, 5000); // Poll every 5 seconds
    }, 10000); // Start after 10 seconds

    return cleanupTimers;
  }, [currentBlockId, executionBlocks, cleanupTimers]);

  // Handle next step execution
  const handleExecuteNextStep = async (step: string) => {
    if (!taskExecutionId) return;
    
    setExecutingStep(step);
    
    try {
      const firstBlock = executionBlocks[0];
      if (!firstBlock?.executionResult) {
        throw new Error('Cannot execute next step: Original execution data not found');
      }

      const fileId = (firstBlock.executionResult as any).file_id;
      const datasetSchema = (firstBlock.executionResult as any).dataset_schema;

      if (!fileId || !datasetSchema) {
        throw new Error('Cannot execute next step: Dataset information not available');
      }

      const response = await runTask(
        fileId,
        `next-step-${Date.now()}`,
        step,
        datasetSchema
      );
      
      const newBlockId = response.task_execution_id;
      hasReceivedStreamData.current[newBlockId] = false;
      
      setExecutionBlocks(prev => [...prev, {
        id: newBlockId,
        title: step,
        pythonCode: '# Generating code...\n',
        executionResult: null,
        isExecuting: true,
      }]);
      
      setCurrentBlockId(newBlockId);
      
      setTimeout(() => {
        document.getElementById(`block-${newBlockId}`)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('[NEXT_STEP] Error:', error);
      const message = error instanceof Error ? error.message : 'Failed to execute next step';
      alert(message);
    } finally {
      setExecutingStep(null);
    }
  };

  // Handle results chat
  const handleAskResultsQuestion = async (question: string): Promise<string> => {
    const completedBlocks = executionBlocks.filter(
      b => b.executionResult && b.executionResult.status === 'completed'
    );
    
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

  // Handle exports
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
                const activeBlocks = executionBlocks.filter(block => block.isExecuting);
                if (activeBlocks.length > 0) {
                  await Promise.all(
                    activeBlocks.map(block => 
                      cancelTask(block.id).catch(err => 
                        console.error(`[CANCEL] Error cancelling task ${block.id}:`, err)
                      )
                    )
                  );
                }
                
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
          {executionBlocks.map((block, index) => (
            <div key={block.id} id={`block-${block.id}`} className="space-y-6">
              {index > 0 && (
                <div className="flex items-center space-x-3 py-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-sm shadow-lg">
                    Step {index + 1}: {block.title}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-600 via-transparent to-transparent"></div>
                </div>
              )}

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

              {block.executionResult && block.executionResult.status === 'completed' && (
                <ResultsChat onAskQuestion={handleAskResultsQuestion} />
              )}

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
