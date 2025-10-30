import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

// Components
import Header from '../components/layout/Header';
import ProgressIndicator from '../components/layout/ProgressIndicator';

const RootLayout = () => {
  const { currentStep, currentDataset } = useAppStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Progress Indicator - Show only when dataset is uploaded and not on home page */}
      {currentDataset && currentStep > 1 && (
        <ProgressIndicator currentStep={currentStep} />
      )}

      {/* Main Content */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Brand/Info */}
            <div className="text-center md:text-left space-y-2">
              <p className="text-sm text-gray-600">Built with React, TypeScript, FastAPI & Tailwind CSS</p>
              <p className="text-xs text-gray-500">v2.0.0</p>
            </div>

            {/* Contact */}
            <div className="text-center space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
              <p className="text-sm text-gray-600">
                Email: <a href="mailto:mayankt1713@gmail.com" className="text-blue-600 hover:underline">mayankt1713@gmail.com</a>
              </p>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-500">© 2025 Daten.AI</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
