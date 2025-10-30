import React from 'react'

const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl shadow-xl py-20 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-300">Everything you need for intelligent data analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-xl border border-blue-800/60 hover:shadow-lg hover:shadow-blue-500/20 transition">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Analysis</h3>
            <p className="text-gray-300">Leverage Advanced AI to automatically understand your data and suggest relevant analysis tasks</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl border border-purple-800/60 hover:shadow-lg hover:shadow-purple-500/20 transition">
            <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real-Time Streaming</h3>
            <p className="text-gray-300">Watch your analysis progress in real-time with live updates and instant feedback</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl border border-green-800/60 hover:shadow-lg hover:shadow-green-500/20 transition">
            <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Beautiful Visualizations</h3>
            <p className="text-gray-300">Automatically generate interactive charts, graphs, and insights from your data</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-xl border border-orange-800/60 hover:shadow-lg hover:shadow-orange-500/20 transition">
            <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Recommendations</h3>
            <p className="text-gray-300">Get intelligent task suggestions tailored to your dataset and analysis goals</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-yellow-900/40 to-amber-900/40 rounded-xl border border-yellow-800/60 hover:shadow-lg hover:shadow-yellow-500/20 transition">
            <div className="h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Export Reports</h3>
            <p className="text-gray-300">Download your analysis results as beautiful PDF reports or CSV files</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-xl border border-cyan-800/60 hover:shadow-lg hover:shadow-cyan-500/20 transition">
            <div className="h-12 w-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Safe & Secure</h3>
            <p className="text-gray-300">Your data is processed securely with controlled code execution and error handling</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingFeatures
