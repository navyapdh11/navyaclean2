import { motion } from 'framer-motion'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="px-4 pt-16 pb-8 text-center">
        <motion.h1 className="text-3xl sm:text-4xl font-black text-gradient mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Privacy Policy
        </motion.h1>
        <p className="text-white/50 text-sm">Last updated: April 16, 2026</p>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-8 space-y-8 text-white/70 leading-relaxed">
        {[
          {
            title: '1. Information We Collect',
            content: 'We collect personal information you provide, including your name, email address, phone number, and property details. This information is used solely for providing cleaning services and communicating with you about your bookings.',
          },
          {
            title: '2. How We Use Your Information',
            content: 'Your information is used to: process quote requests, schedule and deliver cleaning services, send booking confirmations, respond to enquiries, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.',
          },
          {
            title: '3. Data Storage and Security',
            content: 'Your data is stored securely using Supabase (hosted in Sydney, Australia) with encryption at rest and in transit. We implement industry-standard security measures to protect your information.',
          },
          {
            title: '4. Australian Privacy Principles',
            content: 'We comply with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). You have the right to access, correct, or request deletion of your personal data at any time.',
          },
          {
            title: '5. Cookies and Tracking',
            content: 'We use essential cookies for functionality (theme preference, session management). We may use privacy-first analytics (Plausible) that do not set cookies or collect personal data.',
          },
          {
            title: '6. Third-Party Services',
            content: 'We use Supabase for data storage, Resend for email delivery, and Stripe for payment processing. Each provider has their own privacy policy and processes data in accordance with applicable laws.',
          },
          {
            title: '7. Data Retention',
            content: 'We retain your data for as long as necessary to provide services and comply with legal obligations. Inactive accounts may be deleted after 2 years of inactivity.',
          },
          {
            title: '8. Your Rights',
            content: 'You may request access to, correction of, or deletion of your personal data by contacting us at aastacleanpro@gmail.com. We will respond within 30 days as required by Australian law.',
          },
          {
            title: '9. Changes to This Policy',
            content: 'We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last updated" date.',
          },
          {
            title: '10. Contact',
            content: 'For privacy-related enquiries, contact us at aastacleanpro@gmail.com or call 08 6226 6262.',
          },
        ].map((section, i) => (
          <motion.div
            key={section.title}
            className="glass-panel p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
            <p>{section.content}</p>
          </motion.div>
        ))}

        <div className="text-center pt-4">
          <a href="/booking" className="glass-button-neon px-8 py-3 font-bold">Get a Quote →</a>
        </div>
      </article>
    </div>
  )
}
