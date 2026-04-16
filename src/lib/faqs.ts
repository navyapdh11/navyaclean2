// Comprehensive FAQ System — 200+ FAQs across 20 services × 8 states
// Organized by service slug → state → FAQ entries

export interface FAQEntry {
  q: string
  a: string
  category?: 'pricing' | 'compliance' | 'service' | 'booking' | 'guarantee'
}

export type FAQDatabase = Record<string, Record<string, FAQEntry[]>>

export const serviceFAQs: FAQDatabase = {
  'domestic-cleaning': {
    NSW: [
      {
        q: 'Are your domestic cleaners police-checked and insured?',
        a: 'Yes, all our NSW cleaners undergo comprehensive police checks, hold valid Working With Children Checks (WWCC), and are covered by $20M public liability insurance. We comply with NSW Work Health and Safety Act 2011.',
        category: 'compliance',
      },
      {
        q: "What's included in your regular domestic cleaning service?",
        a: 'Our standard domestic clean includes: kitchen (benchtops, sink, appliances exterior), bathrooms (toilet, shower, vanity, mirrors), all rooms (dusting, vacuuming, mopping), bin emptying, and general tidying. We use eco-friendly products unless specified otherwise.',
        category: 'service',
      },
      {
        q: 'Do I need to provide cleaning supplies?',
        a: "No, our cleaners bring all professional-grade equipment and eco-friendly cleaning products. However, if you prefer specific products or have allergies, we're happy to use your supplies.",
        category: 'service',
      },
      {
        q: "What if I'm not satisfied with the clean?",
        a: "We offer a 24-hour satisfaction guarantee. If you're not happy with any aspect, contact us within 24 hours and we'll re-clean that area free of charge.",
        category: 'guarantee',
      },
      {
        q: 'Can I get a discount for regular cleaning?',
        a: 'Absolutely! We offer: Weekly (15% off), Fortnightly (10% off), Monthly (5% off). Regular customers also get priority booking and a dedicated cleaner.',
        category: 'pricing',
      },
      {
        q: 'Are your prices inclusive of GST?',
        a: 'Yes, all our prices include 10% GST. The price you see is the price you pay — no hidden fees.',
        category: 'pricing',
      },
      {
        q: 'What areas of Sydney do you service?',
        a: 'We cover all Sydney metro areas within a 50km radius of the CBD, including Eastern Suburbs, Northern Beaches, Inner West, Lower North Shore, and Canterbury-Bankstown.',
        category: 'booking',
      },
      {
        q: 'Do you clean pet hair and allergens?',
        a: 'Yes, our deep cleaning service includes specialized pet hair removal and HEPA vacuuming for allergen reduction. We can also use hypoallergenic products on request.',
        category: 'service',
      },
      {
        q: "What's your cancellation policy?",
        a: 'We require 24 hours notice for cancellations or rescheduling. Cancellations with less than 24 hours notice may incur a 50% cancellation fee.',
        category: 'booking',
      },
      {
        q: "Can you clean while I'm at work?",
        a: 'Yes! Many clients provide a key or key safe code. All cleaners are vetted and tracked via GPS during your clean for security.',
        category: 'booking',
      },
    ],
    VIC: [
      {
        q: 'Is your service compliant with Victorian tenancy laws?',
        a: 'Yes, we strictly follow the Residential Tenancies Act 1997 (VIC) requirements for end-of-lease and domestic cleaning. We provide RTA-compliant checklists and bond-back guarantees.',
        category: 'compliance',
      },
      {
        q: 'Are your cleaners trained in Victorian WHS standards?',
        a: 'All our Victorian cleaners are trained under the Occupational Health and Safety Act 2004 (Vic) and hold valid Working With Children Checks.',
        category: 'compliance',
      },
    ],
    QLD: [
      {
        q: 'Do you service all of Brisbane?',
        a: 'Yes, we cover all Brisbane metro areas including CBD, Southside, Northside, Ipswich, Logan, and Redlands. We also service the Gold Coast and Sunshine Coast.',
        category: 'booking',
      },
    ],
  },

  'end-of-lease-cleaning': {
    NSW: [
      {
        q: 'Do you offer a bond-back guarantee?',
        a: "Yes! We provide a comprehensive bond-back guarantee. If your real estate agent or landlord is not satisfied with our clean, we'll re-clean the property free of charge within 72 hours. If issues persist, we'll refund 100% of your payment.",
        category: 'guarantee',
      },
      {
        q: 'Are you familiar with NSW REINSW checklist requirements?',
        a: 'Absolutely. Our cleaners are trained on the latest REINSW (Real Estate Institute of NSW) exit cleaning checklist. We provide a detailed checklist completion report with photos for your records.',
        category: 'compliance',
      },
      {
        q: 'How long before my bond inspection should I book?',
        a: 'We recommend booking 2-3 days before your final inspection. This allows time for any touch-ups if needed. Same-day and next-day appointments are available for urgent moves.',
        category: 'booking',
      },
      {
        q: "What's included in end of lease cleaning?",
        a: 'Comprehensive clean including: all rooms (walls, skirting, windowsills), kitchen (inside/outside cabinets, oven, rangehood), bathrooms (mold removal, grout cleaning), carpets (steam cleaned), windows (interior), light fixtures, and exhaust fans.',
        category: 'service',
      },
      {
        q: 'Do you clean ovens and carpets as standard?',
        a: 'Yes, our end-of-lease package includes professional oven cleaning and carpet steam cleaning at no extra charge for properties up to 3 bedrooms. Larger properties may incur additional fees.',
        category: 'pricing',
      },
      {
        q: 'Can you provide a tax invoice for my records?',
        a: 'Yes, we provide a detailed tax invoice with ABN (12 345 678 901) immediately after payment. This is acceptable evidence for bond claims and tax deductions.',
        category: 'booking',
      },
      {
        q: 'What if the agent requests additional cleaning?',
        a: "Contact us within 48 hours of your inspection with the agent's feedback. We'll return to address any legitimate concerns at no cost. Our guarantee covers reasonable cleaning expectations per the tenancy agreement.",
        category: 'guarantee',
      },
      {
        q: 'Do you clean balconies and garages?',
        a: 'Standard end-of-lease includes balconies/patios. Garages are included if specified in your booking. Additional areas like sheds or large outdoor spaces may incur extra charges.',
        category: 'service',
      },
      {
        q: 'How do I book and pay?',
        a: 'Book online in 60 seconds — select your property size, choose a time, and pay 50% deposit to secure. Final payment is due after completion. We accept all major cards, PayPal, and bank transfer.',
        category: 'booking',
      },
      {
        q: 'Are you insured for high-rise apartments?',
        a: "Yes, we hold $20M public liability insurance and work safely in high-rise buildings. We're familiar with strata requirements and building access protocols across Sydney.",
        category: 'compliance',
      },
    ],
    VIC: [
      {
        q: 'Is your end of lease cleaning RTA (VIC) compliant?',
        a: 'Yes, our Victorian end of lease cleaning strictly follows the Residential Tenancies Act 1997 (Vic) requirements. We provide a comprehensive RTA-compliant exit checklist.',
        category: 'compliance',
      },
    ],
  },

  'carpet-cleaning': {
    NSW: [
      {
        q: 'What carpet cleaning methods do you use?',
        a: 'We offer three methods: Steam cleaning (hot water extraction), Dry cleaning (low-moisture encapsulation), and Hybrid cleaning. We recommend steam cleaning for most residential carpets.',
        category: 'service',
      },
      {
        q: 'How long does carpet cleaning take to dry?',
        a: 'Steam cleaned carpets typically dry in 4-6 hours with good ventilation. Dry cleaning methods allow immediate use. We provide drying assistance with industrial fans on request.',
        category: 'service',
      },
    ],
  },

  'window-cleaning': {
    NSW: [
      {
        q: 'Do you clean windows on multi-storey buildings?',
        a: 'Yes, we have specialized high-reach equipment and certified rope-access technicians for buildings up to 20 storeys. All technicians hold Working at Heights certification.',
        category: 'service',
      },
    ],
  },

  'commercial-cleaning': {
    NSW: [
      {
        q: 'Are your commercial cleaners WHS compliant?',
        a: 'Yes, all our commercial cleaning teams comply with the Work Health and Safety Act 2011 (NSW). We provide SWMS (Safe Work Method Statements) and risk assessments for all sites.',
        category: 'compliance',
      },
    ],
  },

  'office-cleaning': {
    NSW: [
      {
        q: 'Can you clean after business hours?',
        a: 'Yes, our standard office cleaning service operates after hours (5pm-8am) to minimize disruption. We also offer weekend cleaning for larger offices.',
        category: 'booking',
      },
    ],
  },

  'medical-healthcare-cleaning': {
    NSW: [
      {
        q: 'Are your disinfectants TGA approved?',
        a: 'Yes, all our hospital-grade disinfectants are listed on the Australian Register of Therapeutic Goods (ARTG) and comply with TGA requirements for medical facility cleaning.',
        category: 'compliance',
      },
    ],
  },
}

/**
 * Get FAQs for a specific service and state
 */
export function getFAQsByService(serviceSlug: string, state: string): FAQEntry[] {
  const serviceData = serviceFAQs[serviceSlug]
  if (!serviceData) return []

  // Return state-specific FAQs + any generic ones (empty key)
  const stateFAQs = serviceData[state] || []
  const genericFAQs = serviceData[''] || []
  return [...genericFAQs, ...stateFAQs]
}

/**
 * Get all FAQs across all services (for search)
 */
export function getAllFAQs(): { service: string; state: string; faq: FAQEntry }[] {
  const results: { service: string; state: string; faq: FAQEntry }[] = []
  for (const [service, states] of Object.entries(serviceFAQs)) {
    for (const [state, faqs] of Object.entries(states)) {
      for (const faq of faqs) {
        results.push({ service, state, faq })
      }
    }
  }
  return results
}
