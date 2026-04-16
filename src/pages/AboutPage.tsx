import { motion } from 'framer-motion'
import { Shield, Users, Award, MapPin, Heart, Clock } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-4 pt-16 pb-12 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-black text-gradient mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          About SparkleClean Pro
        </motion.h1>
        <motion.p
          className="text-lg text-white/70 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Sydney's trusted cleaning service — delivering spotless results with eco-friendly products since 2019.
        </motion.p>
      </section>

      {/* Story */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.div
          className="glass-panel p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-gradient mb-4">Our Story</h2>
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p>
              SparkleClean Pro was founded in 2019 with a simple mission: make professional cleaning 
              accessible, transparent, and eco-friendly for every Sydney household and business.
            </p>
            <p>
              After experiencing firsthand the frustration of opaque pricing, unreliable cleaners, 
              and harsh chemical products, we set out to build something better. Our 3D quote builder 
              gives you instant, GST-inclusive pricing — no surprises, no hidden fees.
            </p>
            <p>
              Today, we serve the entire Greater Sydney Metropolitan area with a team of vetted, 
              police-checked professionals who use only certified eco-friendly products. Our 4.9-star 
              rating from over 300+ reviews speaks for itself.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="px-4 py-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gradient mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Heart className="w-8 h-8" />,
              title: 'Eco-First',
              desc: 'Every product we use is certified by Environmental Choice Australia. Zero toxic residue, zero compromise on quality.',
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'People Matter',
              desc: 'Our cleaners are paid above-award wages, fully insured, and treated with respect. Happy cleaners clean better.',
            },
            {
              icon: <Award className="w-8 h-8" />,
              title: 'Transparent Pricing',
              desc: 'Every dollar accounted for. Our quote builder shows you exactly what you\'re paying for — including GST breakdown.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="glass-panel p-6 text-center hover:glass-glow transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="text-neon-blue mb-3 flex justify-center">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.div
          className="glass-panel p-8 glow-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-gradient mb-6 text-center">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <MapPin className="w-6 h-6" />, value: '50km', label: 'Service Radius' },
              { icon: <Users className="w-6 h-6" />, value: '500+', label: 'Happy Customers' },
              { icon: <Shield className="w-6 h-6" />, value: '$20M', label: 'Insurance Cover' },
              { icon: <Clock className="w-6 h-6" />, value: '4.9★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-neon-blue flex justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl font-black text-gradient">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Coverage */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.div
          className="glass-panel p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-gradient mb-4">Service Areas</h2>
          <p className="text-white/70 mb-4">
            We cover all of Greater Sydney within a 50km radius of the CBD, including:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-white/60">
            {[
              'Sydney CBD', 'Bondi Beach', 'Parramatta', 'Chatswood',
              'Manly', 'Newtown', 'Cronulla', 'Penrith',
              'Eastern Suburbs', 'Inner West', 'North Shore',
              'Western Sydney', 'Sutherland Shire', 'Northern Beaches',
            ].map((area) => (
              <div key={area} className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-neon-green flex-shrink-0" aria-hidden="true" />
                {area}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-4">
            Travel within 50km is included at no extra charge. Beyond 50km? Contact us for a custom quote.
          </p>
        </motion.div>
      </section>
    </div>
  )
}
