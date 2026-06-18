import { motion } from 'framer-motion'
import { MessageCircle, Mail, Phone, Star } from 'lucide-react'
import { cn, proxyImgUrl, getInitials } from '../../lib/utils'
import { AVATAR_BG } from '../../lib/constants'
import type { Agent } from '../../types/agent'
import { Button } from '../ui/Button'

interface AgentCardProps {
  agent: Agent | null
  className?: string
}

const bgColors = AVATAR_BG

export function AgentCard({ agent, className }: AgentCardProps) {
  if (!agent) return null

  const initials = getInitials(agent.name, agent.last)
  const bgIndex =
    (agent.name.charCodeAt(0) + agent.last.charCodeAt(0)) % bgColors.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        'bg-surface-2 border border-border rounded-lg p-5',
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="flex-shrink-0">
          {agent.avatar ? (
            <img
              src={proxyImgUrl(agent.avatar)}
              alt={`${agent.name} ${agent.last}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-accent/30"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-num text-xl font-bold border-2 border-accent/30"
              style={{ backgroundColor: bgColors[bgIndex] }}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-display text-lg uppercase tracking-tight text-white">
            {agent.name} {agent.last}
          </h3>
          {agent.license_number && (
            <p className="text-2xs font-elegant tracking-wider uppercase text-text-muted mt-0.5">
              Mat. {agent.license_number}
            </p>
          )}
          {agent.specialty && (
            <p className="text-xs text-text-secondary font-desc mt-1 flex items-center justify-center sm:justify-start gap-1">
              <Star className="h-3 w-3 text-accent" />
              {agent.specialty}
            </p>
          )}
          {agent.bio && (
            <p className="text-xs text-text-secondary font-desc mt-2 line-clamp-2">{agent.bio}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
            {agent.whatsapp && (
              <Button variant="whatsapp" size="sm" href={`https://wa.me/${agent.whatsapp}`}>
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </Button>
            )}
            {agent.email && (
              <Button variant="outline" size="sm" href={`mailto:${agent.email}`}>
                <Mail className="h-3.5 w-3.5" />
                Email
              </Button>
            )}
            {agent.phone && (
              <Button variant="ghost" size="sm" href={`tel:${agent.phone}`}>
                <Phone className="h-3.5 w-3.5" />
                Llamar
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
