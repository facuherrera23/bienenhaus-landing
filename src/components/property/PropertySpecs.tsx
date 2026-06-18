import React from 'react'
import { motion } from 'framer-motion'
import { Bed, Bath, Maximize } from 'lucide-react'
// import { cn } from '../../lib/utils'
import type { Property, Rental } from '../../types/property'
import { fadeUp, stagger } from '../../animations/variants'

interface PropertySpecsProps {
  property: Property | Rental
}

interface SpecCardProps {
  icon: React.ComponentType<{ className?: string }>
  value: number | string
  label: string
  delay?: number
}

function SpecCard({ icon: Icon, value, label, delay = 0 }: SpecCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className="group relative bg-surface-2 border border-border rounded-lg p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/20"
    >
      <div className="absolute top-0 left-4 right-4 h-0.5 bg-accent/0 group-hover:bg-accent/60 transition-colors duration-300 rounded-full" />
      <div className="flex flex-col items-center text-center gap-2 pt-1">
        <div className="p-2.5 rounded-full bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-num text-xl font-bold text-white">{value}</span>
        <span className="text-2xs font-elegant tracking-wider uppercase text-text-muted">{label}</span>
      </div>
    </motion.div>
  )
}

export function PropertySpecs({ property }: PropertySpecsProps) {
  const features = property.features ?? []

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      <SpecCard icon={Bed} value={property.beds} label="Dormitorios" delay={0} />
      <SpecCard icon={Bath} value={property.baths} label="Baños" delay={0.05} />
      <SpecCard icon={Maximize} value={property.sqm} label="m² Cubiertos" delay={0.1} />
      {features.length > 0 &&
        features.slice(0, 5).map((feature, i) => (
          <motion.div
            key={feature}
            variants={fadeUp}
            custom={0.15 + i * 0.05}
            className="group relative bg-surface-2 border border-border rounded-lg p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/20"
          >
            <div className="absolute top-0 left-4 right-4 h-0.5 bg-accent/0 group-hover:bg-accent/60 transition-colors duration-300 rounded-full" />
            <div className="flex flex-col items-center text-center gap-2 pt-1">
              <div className="p-2.5 rounded-full bg-accent/10 text-accent">
                <span className="text-lg font-bold">+</span>
              </div>
              <span className="text-xs font-desc text-text-secondary leading-tight">{feature}</span>
            </div>
          </motion.div>
        ))}
      {property.expenses && (
        <motion.div
          variants={fadeUp}
          custom={0.3}
          className="group relative bg-surface-2 border border-border rounded-lg p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/20"
        >
          <div className="absolute top-0 left-4 right-4 h-0.5 bg-accent/0 group-hover:bg-accent/60 transition-colors duration-300 rounded-full" />
          <div className="flex flex-col items-center text-center gap-2 pt-1">
            <div className="p-2.5 rounded-full bg-accent/10 text-accent font-num text-lg font-bold">
              $
            </div>
            <span className="font-num text-base font-bold text-white">{property.expenses}</span>
            <span className="text-2xs font-elegant tracking-wider uppercase text-text-muted">Expensas</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
