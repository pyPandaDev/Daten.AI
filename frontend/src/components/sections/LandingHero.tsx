import React from 'react'
import { Database } from 'lucide-react'
import { motion } from 'framer-motion'

const LandingHero: React.FC = () => {
  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="inline-block"
            >
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                Daten.AI
              </h2>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-6xl lg:text-7xl font-bold text-white leading-tight"
            >
              The best way<br />to analyze<br />your data.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-xl text-gray-300 leading-relaxed"
            >
              Upload your dataset and let AI generate insights, visualizations, and recommendations in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToUpload}
                className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 shadow-lg shadow-blue-500/50 transition-all"
              >
                Try for free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, borderColor: 'rgb(156, 163, 175)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-neutral-800/70 border-2 border-neutral-700 text-white rounded-xl font-semibold text-lg hover:bg-neutral-800 hover:shadow-lg transition-all"
              >
                See how it works
              </motion.button>
            </motion.div>
          </div>

          {/* Right Column - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative z-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl shadow-purple-500/50"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex items-center space-x-4"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center"
                    >
                      <Database className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 128 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="h-4 bg-white/30 rounded"
                      ></motion.div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 96 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        className="h-3 bg-white/20 rounded mt-2"
                      ></motion.div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="space-y-3"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.8, delay: 1.5 }}
                      className="h-3 bg-white/20 rounded"
                    ></motion.div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '83.33%' }}
                      transition={{ duration: 0.8, delay: 1.6 }}
                      className="h-3 bg-white/20 rounded"
                    ></motion.div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '66.67%' }}
                      transition={{ duration: 0.8, delay: 1.7 }}
                      className="h-3 bg-white/20 rounded"
                    ></motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    <motion.div whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} className="h-20 bg-white/20 rounded-xl"></motion.div>
                    <motion.div whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} className="h-20 bg-white/20 rounded-xl"></motion.div>
                    <motion.div whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} className="h-20 bg-white/20 rounded-xl"></motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            {/* Decorative elements */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl"
            ></motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl"
            ></motion.div>
          </motion.div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="border-t border-neutral-800 bg-black/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wide mb-8">
            Trusted by data teams and analysts worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            <span className="text-2xl font-bold text-gray-600">Google</span>
            <span className="text-2xl font-bold text-gray-600">Microsoft</span>
            <span className="text-2xl font-bold text-gray-600">Amazon</span>
            <span className="text-2xl font-bold text-gray-600">Meta</span>
            <span className="text-2xl font-bold text-gray-600">Apple</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingHero
