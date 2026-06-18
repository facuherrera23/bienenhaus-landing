import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '../ui/Container'
import { stagger, fadeUp } from '../../animations/variants'

export function CTASection() {
  return (
    <section className="section-block">
      <Container>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="relative bg-gradient-to-br from-surface-2 to-surface-1 border-t border-accent/30 rounded-lg p-12 md:p-20 text-center overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-glow rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent-glow rounded-full blur-3xl opacity-20" />

          <div className="relative z-10">
            <motion.h2
              variants={fadeUp}
              className="font-display text-2xl md:text-4xl uppercase tracking-tight leading-none"
            >
              ¿LISTO PARA ENCONTRAR
              <br />
              TU HOGAR?
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="font-desc text-sm md:text-base text-text-secondary max-w-lg mx-auto mt-5"
            >
              Contactanos hoy y descubrí las mejores propiedades en Córdoba.
              Nuestro equipo está listo para ayudarte.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            >
              <Link
                to="/#contacto"
                className="inline-flex items-center justify-center gap-2 bg-accent text-black font-elegant font-semibold text-sm py-4 px-8 rounded-md hover:bg-accent-dark transition-colors"
              >
                Contactar
              </Link>
              <Link
                to="/venta"
                className="inline-flex items-center justify-center gap-2 border border-border text-text-secondary hover:text-white hover:border-text-muted font-elegant font-semibold text-sm py-4 px-8 rounded-md transition-colors"
              >
                Ver Propiedades
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
