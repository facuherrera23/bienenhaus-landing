import { Phone, MessageCircle } from 'lucide-react'
import type { Agent } from '../../types/agent'
import { proxyImgUrl, getInitials } from '../../lib/utils'

interface AgentBoothProps {
  agent: Agent
}

export function AgentBooth({ agent }: AgentBoothProps) {
  const initials = getInitials(agent.name, agent.last)

  return (
    <div className="flex flex-col md:flex-row gap-8 bg-surface-2 border border-border rounded-lg overflow-hidden hover:border-accent/40 transition-all duration-300 group">
      {/* Visual */}
      <div className="flex-shrink-0 w-full md:w-[280px] min-h-[220px] md:min-h-[320px] overflow-hidden bg-surface-3">
        {agent.avatar ? (
          <img
            src={proxyImgUrl(agent.avatar)}
            alt={`${agent.name} ${agent.last}`}
            className="w-full h-full object-cover grayscale-[40%] brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/10">
            <span className="font-display text-4xl uppercase text-accent tracking-tight">
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-8 flex flex-col justify-center gap-3 flex-1">
        <h3 className="font-display text-3xl uppercase tracking-tight leading-none">
          {agent.name} {agent.last}
        </h3>

        <div className="w-9 h-0.5 bg-accent" />

        {agent.specialty && (
          <div className="text-accent font-elegant text-2xs tracking-badge uppercase">
            {agent.specialty}
          </div>
        )}

        {agent.bio && (
          <p className="font-desc text-[13px] text-text-secondary leading-relaxed line-clamp-3">
            {agent.bio}
          </p>
        )}

        {agent.license_number && (
          <div className="font-elegant text-xs text-text-muted">
            Mat. {agent.license_number}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          {agent.whatsapp && (
            <a
              href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-black text-xs font-semibold py-3 px-6 rounded-md inline-flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          )}
          {agent.phone && (
            <a
              href={`tel:${agent.phone}`}
              className="border border-border text-text-secondary hover:text-white py-3 px-6 rounded-md text-xs inline-flex items-center gap-2 transition-colors"
            >
              <Phone size={16} />
              Llamar
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
