import React from 'react'

const LandingAbout: React.FC = () => {
  return (
    <section id="about" className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl shadow-xl py-20 mb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">About Daten.AI</h2>
          <p className="text-xl text-gray-300">Empowering data-driven decisions with AI</p>
        </div>

        <div className="space-y-6 text-gray-300">
          <p className="text-lg leading-relaxed">
            <strong className="text-white">Daten.AI</strong> is an intelligent data analysis platform that combines the power of artificial intelligence with intuitive design to make data analysis accessible to everyone.
          </p>

          <p className="text-lg leading-relaxed">
            Whether you're a data scientist, business analyst, or researcher, our platform helps you quickly understand your data, identify patterns, and make informed decisions without writing complex code.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 bg-blue-900/30 rounded-lg border border-blue-800/50">
              <h3 className="text-lg font-bold text-white mb-2">🎯 Our Mission</h3>
              <p className="text-gray-300">
                To democratize data analysis by making advanced AI-powered insights accessible to everyone, regardless of technical expertise.
              </p>
            </div>

            <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-800/50">
              <h3 className="text-lg font-bold text-white mb-2">💡 Our Vision</h3>
              <p className="text-gray-300">
                A world where data-driven decision making is instant, intuitive, and available to everyone.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border-2 border-blue-800/50">
            <h3 className="text-lg font-bold text-white mb-3">🚀 Powered by Cutting-Edge Technology</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">✓</span>
                <span>Advanced AI for intelligent analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">✓</span>
                <span>Real-time streaming for instant feedback</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">✓</span>
                <span>Modern React frontend with beautiful UI</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-400">✓</span>
                <span>FastAPI backend for high performance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingAbout
