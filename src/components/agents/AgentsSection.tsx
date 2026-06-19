import { motion } from 'framer-motion'
import { useAgents } from '../../hooks/useData'
import { fadeUp, stagger } from '../../animations/variants'
import { getInitials } from '../../utils/cn'

export function AgentsSection() {
  const { data: agents, isLoading, isError } = useAgents()

  return (
    <section className="py-24 px-5" aria-label="Agentes inmobiliarios">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-elegant text-2xs tracking-section uppercase text-accent mb-3 block">
            Nuestro Equipo
          </span>
          <h2 className="font-display text-2xl md:text-3xl uppercase text-white">
            Agentes Inmobiliarios
          </h2>
          <p className="font-desc text-sm text-text-secondary max-w-lg mx-auto mt-3">
            Profesionales certificados, listos para brindarte la mejor asesoría.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-2 border border-border rounded-lg p-6 animate-shimmer">
                <div className="w-20 h-20 rounded-full bg-surface-3 mx-auto mb-4" />
                <div className="h-4 w-2/3 bg-surface-3 rounded mx-auto mb-2" />
                <div className="h-3 w-1/2 bg-surface-3 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="font-desc text-sm text-text-muted">Error al cargar agentes.</p>
          </div>
        ) : agents && agents.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {agents.map((agent) => (
              <motion.article
                key={agent.id}
                variants={fadeUp}
                className="bg-surface-2 border border-border rounded-lg p-6 text-center hover:border-border-medium transition-all duration-300 group"
              >
                {/* Avatar */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  {agent.avatar ? (
                    <img
                      src={agent.avatar}
                      alt={`${agent.name} ${agent.last}`}
                      className="w-full h-full object-cover rounded-full ring-2 ring-border group-hover:ring-accent/30 transition-all"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-accent/20 flex items-center justify-center font-display text-xl text-accent">
                      {getInitials(agent.name, agent.last)}
                    </div>
                  )}
                  {/* Verified badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <h3 className="font-elegant font-semibold text-sm text-white">
                  {agent.name} {agent.last}
                </h3>

                <p className="font-desc text-xs text-text-muted mt-1">
                  {agent.specialty || 'Asesor Inmobiliario'}
                </p>

                {agent.license_number && (
                  <p className="font-desc text-2xs text-text-muted mt-1">
                    Mat. {agent.license_number}
                  </p>
                )}

                {agent.bio && (
                  <p className="font-desc text-xs text-text-secondary mt-3 line-clamp-2 leading-relaxed">
                    {agent.bio}
                  </p>
                )}

                {/* Contact buttons */}
                <div className="flex gap-2 mt-5">
                  {agent.whatsapp && (
                    <a
                      href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25D366] text-black text-xs font-elegant font-semibold py-2 rounded-md hover:bg-[#20bd5a] transition-colors text-center"
                    >
                      WhatsApp
                    </a>
                  )}
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex-1 border border-border text-text-secondary text-xs font-elegant py-2 rounded-md hover:text-white hover:border-text-muted transition-colors text-center"
                    >
                      Llamar
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="font-desc text-sm text-text-muted">No hay agentes disponibles.</p>
          </div>
        )}
      </div>
    </section>
  )
}
