import { memo } from 'react'
import type { ServiceEntry } from '../lib/constants'

interface ServiceCardProps {
  service: ServiceEntry
  isSelected: boolean
  onToggle: () => void
}

const ServiceCard = memo(function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  return (
    <label
      className={`flex items-center gap-2 p-3 glass-input cursor-pointer transition-all ${isSelected ? 'hover:glass-glow' : ''}`}
      style={{ borderColor: isSelected ? service.color : undefined }}
      onClick={onToggle}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="w-4 h-4 neon-checkbox"
        aria-label={`${service.name} cleaning service`}
      />
      <span className="text-sm" aria-hidden="true">{service.icon}</span>
      <span className="text-sm">{service.name}</span>
    </label>
  )
})

export default ServiceCard
