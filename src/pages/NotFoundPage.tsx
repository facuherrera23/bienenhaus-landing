import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <span className="font-display text-6xl text-accent/30 block mb-4">404</span>
        <h1 className="font-display text-2xl uppercase text-white mb-4">
          Página no encontrada
        </h1>
        <p className="font-desc text-sm text-text-secondary mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-accent text-black font-elegant font-semibold text-sm py-3 px-6 rounded-md hover:bg-accent-dark transition-colors"
        >
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  )
}
