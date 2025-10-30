import React from 'react'
import FileUploader from '../FileUploader'

interface LandingUploadProps {
  onFileUpload: (file: File, userGoal?: string) => Promise<void>
  isUploading: boolean
}

const LandingUpload: React.FC<LandingUploadProps> = ({ onFileUpload, isUploading }) => {
  return (
    <section id="upload-section" className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl shadow-xl py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Get Started in Seconds</h2>
          <p className="text-xl text-gray-300">Upload your dataset to unlock AI-powered insights</p>
        </div>
        <FileUploader onFileUpload={onFileUpload} isUploading={isUploading} />
      </div>
    </section>
  )
}

export default LandingUpload
