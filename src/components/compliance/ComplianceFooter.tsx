// State-Specific Compliance Footer Component
// Displays WHS, tenancy legislation, and consumer rights per state

import { PHONE_DISPLAY, PHONE_LINK, EMAIL_DISPLAY, EMAIL_LINK } from '../../lib/constants'
import type { ServiceDefinition, AustralianState } from '../../lib/services-au'
import { STATE_CONFIG } from '../../lib/services-au'

interface ComplianceFooterProps {
  state?: AustralianState
  service?: ServiceDefinition
  businessDetails?: {
    abn: string
    insurance: string
    whs: boolean
  }
}

const STATE_AUTHORITIES: Record<AustralianState, {
  legislation: string
  authority: string
  tenancy: string
  fairTrading: string
  fairTradingUrl: string
}> = {
  NSW: {
    legislation: 'Work Health and Safety Act 2011 (NSW)',
    authority: 'SafeWork NSW',
    tenancy: 'Residential Tenancies Act 2010 (NSW)',
    fairTrading: 'NSW Fair Trading',
    fairTradingUrl: 'https://www.fairtrading.nsw.gov.au',
  },
  VIC: {
    legislation: 'Occupational Health and Safety Act 2004 (Vic)',
    authority: 'WorkSafe Victoria',
    tenancy: 'Residential Tenancies Act 1997 (Vic)',
    fairTrading: 'Consumer Affairs Victoria',
    fairTradingUrl: 'https://www.consumer.vic.gov.au',
  },
  QLD: {
    legislation: 'Work Health and Safety Act 2011 (Qld)',
    authority: 'WorkSafe Queensland',
    tenancy: 'Residential Tenancies and Rooming Accommodation Act 2008',
    fairTrading: 'Queensland Fair Trading',
    fairTradingUrl: 'https://www.qld.gov.au/law/fair-trading',
  },
  WA: {
    legislation: 'Work Health and Safety Act 2020 (WA)',
    authority: 'WorkSafe WA',
    tenancy: 'Residential Tenancies Act 1987 (WA)',
    fairTrading: 'Consumer Protection WA',
    fairTradingUrl: 'https://www.commerce.wa.gov.au/consumer-protection',
  },
  SA: {
    legislation: 'Work Health and Safety Act 2012 (SA)',
    authority: 'SafeWork SA',
    tenancy: 'Residential Tenancies Act 1995 (SA)',
    fairTrading: 'Consumer and Business Services SA',
    fairTradingUrl: 'https://www.cbs.sa.gov.au',
  },
  TAS: {
    legislation: 'Work Health and Safety Act 2012 (Tas)',
    authority: 'WorkSafe Tasmania',
    tenancy: 'Residential Tenancy Act 1997 (Tas)',
    fairTrading: 'Consumer Affairs and Fair Trading Tasmania',
    fairTradingUrl: 'https://www.consumer.tas.gov.au',
  },
  ACT: {
    legislation: 'Work Health and Safety Act 2011 (ACT)',
    authority: 'WorkSafe ACT',
    tenancy: 'Residential Tenancies Act 1997 (ACT)',
    fairTrading: 'Access Canberra',
    fairTradingUrl: 'https://www.accesscanberra.act.gov.au',
  },
  NT: {
    legislation: 'Work Health and Safety (National Uniform Legislation) Act 2011 (NT)',
    authority: 'NT WorkSafe',
    tenancy: 'Residential Tenancies Act (NT)',
    fairTrading: 'NT Consumer Affairs',
    fairTradingUrl: 'https://consumeraffairs.nt.gov.au',
  },
}

export default function ComplianceFooter({
  state = 'NSW',
  service,
  businessDetails = {
    abn: '12 345 678 901',
    insurance: 'Public Liability $20M',
    whs: true,
  },
}: ComplianceFooterProps) {
  const compliance = STATE_AUTHORITIES[state]
  const stateConfig = STATE_CONFIG[state]

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 text-sm mt-16" aria-label="Compliance information">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Business Details */}
          <div>
            <h4 className="font-bold text-white mb-4">Business Details</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-gray-500 text-xs">ABN</dt>
                <dd className="text-white">{businessDetails.abn}</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-xs">Insurance</dt>
                <dd className="text-white">{businessDetails.insurance}</dd>
              </div>
              {businessDetails.whs && (
                <div>
                  <dt className="text-gray-500 text-xs">WHS Compliant</dt>
                  <dd className="text-neon-green font-semibold">✓ Yes</dd>
                </div>
              )}
              <div className="pt-2 border-t border-gray-700">
                <dt className="text-gray-500 text-xs">Contact</dt>
                <dd>
                  <a href={PHONE_LINK} className="text-neon-blue hover:underline block">
                    {PHONE_DISPLAY}
                  </a>
                  <a href={EMAIL_LINK} className="text-neon-blue hover:underline block mt-1">
                    {EMAIL_DISPLAY}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* State Compliance */}
          <div>
            <h4 className="font-bold text-white mb-4">{state} Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">•</span>
                <span>{compliance.legislation}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">•</span>
                <span>Registered with {compliance.authority}</span>
              </li>
              {service?.category === 'residential' && (
                <li className="flex items-start gap-2">
                  <span className="text-neon-blue mt-0.5">•</span>
                  <span>{compliance.tenancy} compliant</span>
                </li>
              )}
              {stateConfig?.complianceNotes && (
                <li className="flex items-start gap-2">
                  <span className="text-neon-blue mt-0.5">•</span>
                  <span>{stateConfig.complianceNotes}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Certifications */}
          {service?.certifications && service.certifications.length > 0 && (
            <div>
              <h4 className="font-bold text-white mb-4">Certifications</h4>
              <ul className="space-y-2">
                {service.certifications.map((cert, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-neon-green">✓</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Consumer Rights */}
          <div>
            <h4 className="font-bold text-white mb-4">Consumer Rights</h4>
            <p className="text-xs mb-3">
              As a {state} consumer, you're protected by Australian Consumer Law including:
            </p>
            <ul className="space-y-1 text-xs mb-4">
              <li className="flex items-start gap-2">
                <span className="text-neon-green mt-0.5">✓</span>
                <span>Right to satisfactory quality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-green mt-0.5">✓</span>
                <span>Clear pricing and no hidden fees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-green mt-0.5">✓</span>
                <span>Fair cancellation terms</span>
              </li>
            </ul>
            <a
              href={compliance.fairTradingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-blue text-xs hover:underline inline-flex items-center gap-1"
            >
              Learn more at {compliance.fairTrading}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-xs">
          <p>
            © {new Date().getFullYear()} SparkleClean Pro Australia. All rights reserved.
          </p>
          <p className="mt-2">
            All prices include 10% GST. Terms and conditions apply. | 
            <a href="/privacy" className="text-gray-400 hover:text-white ml-1">Privacy Policy</a> | 
            <a href="/terms" className="text-gray-400 hover:text-white ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
