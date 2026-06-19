import { motion } from 'framer-motion'
import { useSettings } from '../../hooks/useData'
import { fadeUp, stagger } from '../../animations/variants'

const timeline = [
  { year: '2018', label: 'Fundación', desc: 'Nace Bienenhaus con la visión de transformar el mercado inmobiliario en Córdoba.' },
  { year: '2020', label: 'Expansión', desc: 'Incorporamos tecnología y expandimos nuestra cartera de propiedades premium.' },
  { year: '2022', label: 'Innovación', desc: 'Lanzamos nuestra plataforma digital con tasaciones online y CRM integrado.' },
  { year: '2024', label: 'Liderazgo', desc: 'Nos consolidamos como referentes en el mercado premium de Córdoba.' },
]

export function AboutSection() {
  const { data: settings } = useSettings()

  return (
    <section className="py-24 px-5 bg-surface-1" aria-label="Sobre nosotros">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-elegant text-2xs tracking-section uppercase text-accent mb-3 block">
            Nuestra Historia
          </span>
          <h2 className="font-display text-2xl md:text-3xl uppercase text-white">
            Sobre Nosotros
          </h2>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {timeline.map((item) => (
            <motion.div
              key={item.year}
              variants={fadeUp}
              className="relative text-center p-6 bg-surface-2 border border-border rounded-lg"
            >
              <span className="font-display text-2xl md:text-3xl text-accent/30 block mb-2">{item.year}</span>
              <h3 className="font-elegant font-semibold text-sm text-white mb-2">{item.label}</h3>
              <p className="font-desc text-xs text-text-secondary leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission / Vision / Values */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div variants={fadeUp} className="p-8 bg-surface-2 border border-border rounded-lg">
            <h3 className="font-elegant font-semibold text-sm text-accent uppercase tracking-section mb-4">Misión</h3>
            <p className="font-desc text-sm text-text-secondary leading-relaxed">
              {settings?.about_mission || 'Brindar asesoramiento inmobiliario premium, combinando tecnología de vanguardia con un servicio personalizado que supere las expectativas de nuestros clientes.'}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="p-8 bg-surface-2 border border-border rounded-lg">
            <h3 className="font-elegant font-semibold text-sm text-accent uppercase tracking-section mb-4">Visión</h3>
            <p className="font-desc text-sm text-text-secondary leading-relaxed">
              {settings?.about_vision || 'Ser la inmobiliaria de referencia en Córdoba, reconocida por nuestra innovación, transparencia y compromiso con la excelencia.'}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="p-8 bg-surface-2 border border-border rounded-lg">
            <h3 className="font-elegant font-semibold text-sm text-accent uppercase tracking-section mb-4">Valores</h3>
            <p className="font-desc text-sm text-text-secondary leading-relaxed">
              {settings?.about_values || 'Integridad, innovación, compromiso, transparencia y excelencia en cada servicio que ofrecemos.'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
