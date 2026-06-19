import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fadeUp, stagger } from '../../animations/variants'
import { LOCATION } from '../../constants'

interface HeroContentProps {
  subtitle?: string
}

export function HeroContent({ subtitle }: HeroContentProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="relative z-10 flex flex-col items-center text-center px-5 max-w-4xl mx-auto"
    >
      <motion.span
        variants={fadeUp}
        className="text-accent font-elegant text-2xs tracking-eyebrow uppercase mb-4"
      >
        {LOCATION}
      </motion.span>

      <motion.h1
        variants={fadeUp}
        className="font-display text-[34px] md:text-3xl lg:text-4xl uppercase tracking-tight leading-none text-white"
      >
        BIENENHAUS
      </motion.h1>

      {subtitle && (
        <motion.p
          variants={fadeUp}
          className="font-desc text-sm md:text-base text-text-secondary max-w-xl mt-5"
        >
          {subtitle}
        </motion.p>
      )}

      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mt-10">
        <Link
          to="/#tasacion"
          className="inline-flex items-center justify-center gap-2 bg-accent text-black font-elegant font-semibold text-sm py-4 px-8 rounded-md hover:bg-accent-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Tasar Propiedad
        </Link>
        <Link
          to="/venta"
          className="inline-flex items-center justify-center gap-2 border border-border text-text-secondary hover:text-white hover:border-text-muted font-elegant font-semibold text-sm py-4 px-8 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-muted focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Explorar
        </Link>
      </motion.div>
    </motion.div>
  )
}
