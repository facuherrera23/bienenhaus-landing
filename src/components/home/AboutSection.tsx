import { motion } from 'framer-motion'
import { useSettings } from '../../hooks/useSettings'
import { Container } from '../ui/Container'
import { stagger, fadeUp, scaleIn } from '../../animations/variants'

const cards = [
  {
    key: 'mission',
    label: 'MISIÓN',
    field: 'about_mission' as const,
    defaultText:
      'Brindar soluciones inmobiliarias de alta calidad, conectando personas con propiedades que superen sus expectativas.',
  },
  {
    key: 'vision',
    label: 'VISIÓN',
    field: 'about_vision' as const,
    defaultText:
      'Ser la inmobiliaria líder en Córdoba, reconocida por nuestra excelencia, transparencia y compromiso con cada cliente.',
  },
  {
    key: 'values',
    label: 'VALORES',
    field: 'about_values' as const,
    defaultText:
      'Transparencia, profesionalismo, dedicación y confianza son los pilares que guían cada operación que realizamos.',
  },
]

export function AboutSection() {
  const { data: settings } = useSettings()

  return (
    <section id="quienes" className="section-block">
      <Container>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="section-heading"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            QUIÉNES SOMOS
          </motion.span>
          <motion.h2 variants={fadeUp} className="section-title">
            BIENENHAUS
          </motion.h2>
          <motion.p variants={fadeUp} className="section-sub">
            Premium real estate en Córdoba, Argentina. Especialistas en propiedades
            de alta gama con un enfoque moderno y transparente.
          </motion.p>
          <motion.div variants={fadeUp} className="section-line" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.key}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15 }}
              className="bg-surface-2 border border-border rounded-lg p-8 hover:border-accent/30 transition-colors group"
            >
              <div className="w-12 h-0.5 bg-accent mb-6 group-hover:w-20 transition-all duration-300" />
              <h3 className="font-display text-xl uppercase tracking-tight mb-4">
                {card.label}
              </h3>
              <p className="font-desc text-sm text-text-secondary leading-relaxed">
                {settings?.[card.field] || card.defaultText}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
