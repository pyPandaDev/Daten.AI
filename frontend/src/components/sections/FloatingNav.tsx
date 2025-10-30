import { motion } from 'framer-motion'

export default function FloatingNav() {
  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.5 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-full shadow-2xl px-8 py-4"
      >
        <div className="flex items-center space-x-8">
          <motion.a
            href="#"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center space-x-2"
          >
            <span className="text-lg">🏠</span>
            <span>Home</span>
          </motion.a>
          <div className="h-6 w-px bg-neutral-800"></div>
          <motion.a
            href="#features"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-300 hover:text-white font-medium transition-colors flex items-center space-x-2"
          >
            <span className="text-lg">✨</span>
            <span>Features</span>
          </motion.a>
          <div className="h-6 w-px bg-neutral-800"></div>
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-300 hover:text-white font-medium transition-colors flex items-center space-x-2"
          >
            <span className="text-lg">⚙️</span>
            <span>How it works</span>
          </motion.a>
          <div className="h-6 w-px bg-neutral-800"></div>
          <motion.a
            href="#about"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-300 hover:text-white font-medium transition-colors flex items-center space-x-2"
          >
            <span className="text-lg">ℹ️</span>
            <span>About</span>
          </motion.a>
        </div>
      </motion.div>
    </motion.nav>
  )
}
