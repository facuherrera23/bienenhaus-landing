import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../animations/variants'
import { getInitials } from '../../utils/cn'

const testimonials = [
  {
    id: 1,
    name: 'María García',
    role: 'Propietaria',
    content: 'Excelente servicio. Encontraron la propiedad ideal para mi familia en tiempo récord. Profesionalismo y calidez humana.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Carlos López',
    role: 'Inversor',
    content: 'Asesoramiento experto en inversiones inmobiliarias. Su conocimiento del mercado me ayudó a tomar las mejores decisiones.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Ana Martínez',
    role: 'Vendedora',
    content: 'Vendí mi propiedad en menos de lo que esperaba. El equipo de Bienenhaus se encargó de todo el proceso con total transparencia.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-5 bg-surface-1" aria-label="Testimonios">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-elegant text-2xs tracking-section uppercase text-accent mb-3 block">
            Testimonios
          </span>
          <h2 className="font-display text-2xl md:text-3xl uppercase text-white">
            Lo Que Dicen Nuestros Clientes
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              className="bg-surface-2 border border-border rounded-lg p-6 hover:border-border-medium transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4" aria-label={`${t.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={i < t.rating ? '#20b8ab' : 'none'}
                    stroke={i < t.rating ? '#20b8ab' : '#555'}
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              <p className="font-desc text-sm text-text-secondary leading-relaxed mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-display text-sm text-accent">
                  {getInitials(t.name)}
                </div>
                <div>
                  <p className="font-elegant font-semibold text-xs text-white">{t.name}</p>
                  <p className="font-desc text-2xs text-text-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
