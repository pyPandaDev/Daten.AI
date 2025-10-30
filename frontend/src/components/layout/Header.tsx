import { useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentDataset, resetAll } = useAppStore();

  const handleGoHome = () => {
    if (currentDataset && location.pathname !== '/') {
      const confirm = window.confirm('Going home will reset your current session. Continue?');
      if (confirm) {
        resetAll();
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={handleGoHome}
            className="flex items-center space-x-3 group"
          >
            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded uppercase tracking-wide shadow-lg">
              BETA
            </span>
            <h1 className="text-4xl font-bold leading-none bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Daten.AI
            </h1>
          </button>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {currentDataset && (
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">
                  <span className="text-blue-600 font-semibold">{currentDataset.filename}</span> loaded
                </span>
              </div>
            )}
            
            <button
              onClick={handleGoHome}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition font-medium"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
