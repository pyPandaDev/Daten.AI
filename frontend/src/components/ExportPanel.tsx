import React from 'react';
import { FileDown, FileSpreadsheet, Loader } from 'lucide-react';

interface ExportPanelProps {
  taskExecutionId: string | null;
  onExportPdf: () => void;
  onExportCsv: () => void;
  isExporting: boolean;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  taskExecutionId,
  onExportPdf,
  onExportCsv,
  isExporting,
}) => {
  if (!taskExecutionId) return null;

  return (
    <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-8 border-2 border-green-200 animate-scaleIn">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📥</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Export Results</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onExportPdf}
          disabled={isExporting}
          className="group px-6 py-5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex flex-col items-center justify-center space-y-2"
        >
          {isExporting ? (
            <>
              <Loader className="h-8 w-8 animate-spin" />
              <span className="text-sm">Exporting...</span>
            </>
          ) : (
            <>
              <FileDown className="h-8 w-8 group-hover:animate-bounce" />
              <span className="text-lg">Export PDF</span>
              <span className="text-xs opacity-90">Formatted report</span>
            </>
          )}
        </button>
        
        <button
          onClick={onExportCsv}
          disabled={isExporting}
          className="group px-6 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex flex-col items-center justify-center space-y-2"
        >
          {isExporting ? (
            <>
              <Loader className="h-8 w-8 animate-spin" />
              <span className="text-sm">Exporting...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-8 w-8 group-hover:animate-bounce" />
              <span className="text-lg">Export CSV</span>
              <span className="text-xs opacity-90">Raw data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportPanel;
