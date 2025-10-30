import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Sparkles, BarChart3, Brain, Zap, Shield } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { uploadDataset } from '../services/api';

// Components
import FileUploader from '../components/FileUploader';

const HomePage = () => {
  const navigate = useNavigate();
  const { setDataset, setIsUploading, isUploading, resetAll, setCurrentStep } = useAppStore();

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleFileUpload = useCallback(
    async (file: File, userGoal?: string) => {
      setIsUploading(true);
      try {
        const response = await uploadDataset(file, userGoal);
        
        setDataset({
          fileId: response.file_id,
          filename: response.filename,
          datasetSchema: response.dataset_schema,
          geminiInsights: response.gemini_insights,
          tablePreview: response.table_preview,
          statisticsSummary: response.statistics_summary,
          uploadedAt: Date.now(),
        });

        // Navigate to summary page
        navigate('/summary');
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [setDataset, setIsUploading, navigate]
  );

  // Reset state when visiting home
  const handleReset = () => {
    resetAll();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Data
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Into Insights
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Upload your dataset and let AI generate visualizations, analysis, and predictions in seconds.
              No coding required.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all inline-flex items-center space-x-2"
            >
              <Upload className="h-5 w-5" />
              <span>Get Started Free</span>
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'AI understands your data and suggests relevant tasks',
                gradient: 'from-yellow-500 to-orange-500',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Get insights in seconds with real-time streaming',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your data is processed securely and never stored permanently',
                gradient: 'from-green-500 to-emerald-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition shadow-sm hover:shadow-md"
              >
                <div className={`inline-flex p-3 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Analyzing Your Data
            </h2>
            <p className="text-xl text-gray-600">
              Upload a CSV, Excel, or JSON file to begin
            </p>
          </motion.div>

          <FileUploader onFileUpload={handleFileUpload} isUploading={isUploading} />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get insights in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '📤', title: 'Upload', desc: 'Upload your dataset' },
              { icon: '🤖', title: 'AI Analysis', desc: 'AI analyzes your data' },
              { icon: '🎯', title: 'Choose Path', desc: 'Select analysis or data science' },
              { icon: '📊', title: 'Get Results', desc: 'View insights & visualizations' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
