import { motion } from 'framer-motion'
import { useAgents } from '../../hooks/useAgents'
import { Container } from '../ui/Container'
import { Skeleton } from '../ui/Skeleton'
import { AgentBooth } from '../agent/AgentBooth'
import { stagger, fadeUp } from '../../animations/variants'

function AgentBoothSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-8 bg-surface-2 border border-border rounded-lg overflow-hidden">
      <Skeleton className="w-full md:w-[280px] h-[220px] md:min-h-[320px] rounded-none" />
      <div className="p-8 flex flex-col justify-center gap-3 flex-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-0.5 w-9" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-3 mt-2">
          <Skeleton className="h-12 w-28" />
          <Skeleton className="h-12 w-28" />
        </div>
      </div>
    </div>
  )
}

export function AgentsSection() {
  const { data: agents, isLoading, error } = useAgents()

  return (
    <section id="agentes" className="section-block">
      <Container>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="section-heading"
        >
          <motion.span variants={fadeUp} className="eyebrow">
            EQUIPO
          </motion.span>
          <motion.h2 variants={fadeUp} className="section-title">
            NUESTROS AGENTES
          </motion.h2>
          <motion.div variants={fadeUp} className="section-line" />
        </motion.div>

        {isLoading && (
          <div className="space-y-6">
            <AgentBoothSkeleton />
            <AgentBoothSkeleton />
            <AgentBoothSkeleton />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <span className="text-error font-desc text-sm">
              Error al cargar los agentes. Intentalo de nuevo más tarde.
            </span>
          </div>
        )}

        {agents && agents.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-6"
          >
            {agents.map((agent) => (
              <motion.div key={agent.id} variants={fadeUp}>
                <AgentBooth agent={agent} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {agents && agents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <span className="text-text-muted font-desc text-sm">
              No hay agentes disponibles por el momento.
            </span>
          </div>
        )}
      </Container>
    </section>
  )
}
