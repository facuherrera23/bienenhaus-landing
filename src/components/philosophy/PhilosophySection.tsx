import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../animations/variants'

const values = [
  {
    title: 'Integridad',
    desc: 'Actuamos con honestidad y transparencia en cada operación, construyendo relaciones de confianza a largo plazo.',
    icon: '◆',
  },
  {
    title: 'Innovación',
    desc: 'Integramos tecnología de vanguardia para ofrecer soluciones inteligentes que transforman la experiencia inmobiliaria.',
    icon: '◇',
  },
  {
    title: 'Excelencia',
    desc: 'Nos esforzamos por superar las expectativas en cada servicio, manteniendo los más altos estándares de calidad.',
    icon: '○',
  },
  {
    title: 'Compromiso',
    desc: 'Nos dedicamos con pasión a cada proyecto, acompañando a nuestros clientes en cada paso del camino.',
    icon: '●',
  },
]

export function PhilosophySection() {
  return (
    <section className="py-24 px-5" aria-label="Nuestra filosofía">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-elegant text-2xs tracking-section uppercase text-accent mb-3 block">
            Nuestra Filosofía
          </span>
          <h2 className="font-display text-2xl md:text-3xl uppercase text-white">
            Así Trabajamos
          </h2>
          <p className="font-desc text-sm text-text-secondary max-w-2xl mx-auto mt-4 leading-relaxed">
            En Bienenhaus creemos que el mercado inmobiliario merece un enfoque diferente.
            Combinamos tecnología, expertise y un trato humano para crear experiencias
            que transforman la manera de comprar, vender y alquilar propiedades.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-4 gap-6"
        >
          {values.map((v) => (
            <motion.div
              key={v.title}
              variants={fadeUp}
              className="text-center p-8 bg-surface-2 border border-border rounded-lg hover:border-accent/20 transition-all duration-500 group"
            >
              <span className="text-2xl text-accent/60 group-hover:text-accent transition-colors duration-500 block mb-4">
                {v.icon}
              </span>
              <h3 className="font-elegant font-semibold text-sm text-white mb-3">{v.title}</h3>
              <p className="font-desc text-xs text-text-secondary leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
