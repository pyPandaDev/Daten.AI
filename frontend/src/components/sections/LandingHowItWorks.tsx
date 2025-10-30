import React from 'react'

const LandingHowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="bg-neutral-900/60 rounded-2xl shadow-xl py-20 mb-8 border border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-300">Get insights from your data in 4 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
              1
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload Dataset</h3>
            <p className="text-gray-300">Drag & drop your CSV, Excel, or JSON file</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
              2
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
            <p className="text-gray-300">Our AI understands your data structure and patterns</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-pink-600">
              3
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Choose Tasks</h3>
            <p className="text-gray-300">Select from AI-recommended analysis tasks</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
              4
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Get Results</h3>
            <p className="text-gray-300">View visualizations and download reports</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingHowItWorks
