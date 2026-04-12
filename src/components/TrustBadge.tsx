import { memo } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'

interface TrustBadgeProps {
  icon: keyof typeof Icons
  title: string
  desc: string
  color: string
  index: number
}

const TrustBadge = memo(function TrustBadge({ icon, title, desc, color, index }: TrustBadgeProps) {
  const IconComponent = Icons[icon] as React.ElementType

  if (!IconComponent) return null

  return (
    <motion.div
      className="glass-panel p-5 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <IconComponent className="w-8 h-8 mx-auto mb-2" style={{ color }} aria-hidden="true" />
      <h4 className="font-bold text-sm">{title}</h4>
      <p className="text-xs text-white/70">{desc}</p>
    </motion.div>
  )
})

export default TrustBadge
