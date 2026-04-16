// Service-specific content — addons, process steps, testimonials, tips, checklists
// Used by ServicePage to render rich, unique content per service

// ──────────────────────────────────────────────────────────────
// Add-on Definitions (with descriptions, prices, icons)
// ──────────────────────────────────────────────────────────────

export interface AddonDefinition {
  id: string
  name: string
  description: string
  price: number
  icon: string
  estimatedTime?: string
  availableFor?: string[] // service IDs that can use this addon
}

export const ADDON_DEFINITIONS: Record<string, AddonDefinition> = {
  // Window Cleaning Addons
  fly_screen_cleaning: {
    id: 'fly_screen_cleaning',
    name: 'Fly Screen Cleaning',
    description: 'Remove, wash, and reinstall all fly screens. Eliminates dust, pollen, and allergens trapped in mesh.',
    price: 20,
    icon: '🔲',
    estimatedTime: '+15 min',
    availableFor: ['window'],
  },
  track_cleaning: {
    id: 'track_cleaning',
    name: 'Window Track Cleaning',
    description: 'Deep clean window tracks and sills. Remove built-up dirt, debris, and dead insects for smooth operation.',
    price: 25,
    icon: '🔧',
    estimatedTime: '+20 min',
    availableFor: ['window'],
  },
  high_reach: {
    id: 'high_reach',
    name: 'High Reach / Multi-Storey',
    description: 'Professional water-fed pole system for windows above ground floor. Safe, no-ladder required.',
    price: 50,
    icon: '🏗️',
    estimatedTime: '+30 min',
    availableFor: ['window'],
  },
  hard_water_removal: {
    id: 'hard_water_removal',
    name: 'Hard Water Stain Removal',
    description: 'Professional polish to remove mineral deposits and hard water stains from glass surfaces.',
    price: 45,
    icon: '💧',
    estimatedTime: '+25 min',
    availableFor: ['window'],
  },
  frame_restoration: {
    id: 'frame_restoration',
    name: 'Frame & Sill Restoration',
    description: 'Deep clean, sand, and reseal window frames. Includes silicone replacement for weathered seals.',
    price: 65,
    icon: '🪵',
    estimatedTime: '+45 min',
    availableFor: ['window'],
  },

  // Domestic/Deep Cleaning Addons
  oven_cleaning: {
    id: 'oven_cleaning',
    name: 'Oven Deep Clean',
    description: 'Professional degreasing and restoration of ovens, stovetops, and range hoods. Non-toxic products.',
    price: 80,
    icon: '🔥',
    estimatedTime: '+60 min',
    availableFor: ['domestic', 'endOfLease', 'deep', 'moveInOut'],
  },
  fridge_cleaning: {
    id: 'fridge_cleaning',
    name: 'Fridge & Freezer Clean',
    description: 'Empty, defrost (if needed), deep clean interior and exterior. Sanitize all surfaces.',
    price: 50,
    icon: '🧊',
    estimatedTime: '+30 min',
    availableFor: ['domestic', 'endOfLease', 'deep', 'moveInOut'],
  },
  window_interior: {
    id: 'window_interior',
    name: 'Interior Window Clean',
    description: 'Clean all interior windows, glass doors, and mirrors. Streak-free finish guaranteed.',
    price: 60,
    icon: '🪟',
    estimatedTime: '+30 min',
    availableFor: ['domestic', 'endOfLease', 'deep', 'moveInOut'],
  },
  laundry: {
    id: 'laundry',
    name: 'Laundry Deep Clean',
    description: 'Clean and sanitize laundry area including washing machine exterior, sink, and storage.',
    price: 40,
    icon: '🧺',
    estimatedTime: '+25 min',
    availableFor: ['domestic', 'endOfLease', 'deep', 'moveInOut'],
  },
  stain_treatment: {
    id: 'stain_treatment',
    name: 'Spot & Stain Treatment',
    description: 'Targeted treatment for stubborn stains on carpets, upholstery, and hard surfaces.',
    price: 35,
    icon: '🎯',
    estimatedTime: '+20 min',
    availableFor: ['domestic', 'deep', 'carpet'],
  },
  deodorizing: {
    id: 'deodorizing',
    name: 'Deodorizing Treatment',
    description: 'Neutralize odours with eco-friendly enzyme treatment. Leaves rooms fresh and clean.',
    price: 25,
    icon: '🌸',
    estimatedTime: '+15 min',
    availableFor: ['domestic', 'deep', 'carpet', 'upholstery'],
  },
  pet_hair_removal: {
    id: 'pet_hair_removal',
    name: 'Pet Hair Removal',
    description: 'Specialized tools and techniques for thorough pet hair removal from all surfaces.',
    price: 30,
    icon: '🐾',
    estimatedTime: '+20 min',
    availableFor: ['domestic', 'deep', 'carpet', 'upholstery'],
  },
  fabric_protection: {
    id: 'fabric_protection',
    name: 'Fabric Protection Treatment',
    description: 'Apply Scotchgard or similar protectant to carpets and upholstery. Repels spills and stains.',
    price: 45,
    icon: '🛡️',
    estimatedTime: '+30 min',
    availableFor: ['carpet', 'upholstery'],
  },
  gutter_cleaning: {
    id: 'gutter_cleaning',
    name: 'Gutter Cleaning',
    description: 'Remove leaves, debris, and blockages from all gutters. Prevent water damage and overflow.',
    price: 80,
    icon: '🏠',
    estimatedTime: '+45 min',
    availableFor: ['domestic', 'deep'],
  },
  roof_washing: {
    id: 'roof_washing',
    name: 'Roof Washing',
    description: 'Low-pressure roof wash to remove moss, algae, and accumulated grime.',
    price: 100,
    icon: '🏗️',
    estimatedTime: '+60 min',
    availableFor: ['domestic', 'deep', 'pressure'],
  },
  deck_restoration: {
    id: 'deck_restoration',
    name: 'Deck Cleaning & Restoration',
    description: 'Pressure wash, sand rough spots, and apply sealant to outdoor decks.',
    price: 120,
    icon: '🪵',
    estimatedTime: '+90 min',
    availableFor: ['pressure', 'deep'],
  },

  // Carpet-specific
  carpet_sanitization: {
    id: 'carpet_sanitization',
    name: 'Carpet Sanitization',
    description: 'Hospital-grade disinfectant treatment. Kills 99.9% of bacteria and viruses.',
    price: 40,
    icon: '🦠',
    estimatedTime: '+20 min',
    availableFor: ['carpet'],
  },
  carpet_stretching: {
    id: 'carpet_stretching',
    name: 'Carpet Stretching',
    description: 'Re-stretch loose or buckled carpet sections. Professional power-stretching included.',
    price: 75,
    icon: '📐',
    estimatedTime: '+45 min',
    availableFor: ['carpet'],
  },

  // Pressure washing addons
  driveway_sealing: {
    id: 'driveway_sealing',
    name: 'Driveway Sealing',
    description: 'Apply protective sealant after pressure washing. Extends surface life by 2-3 years.',
    price: 95,
    icon: '🛣️',
    estimatedTime: '+60 min',
    availableFor: ['pressure'],
  },
  graffiti_removal: {
    id: 'graffiti_removal',
    name: 'Graffiti Removal',
    description: 'Specialized chemical treatment and pressure wash to remove graffiti without surface damage.',
    price: 150,
    icon: '🚫',
    estimatedTime: '+45 min',
    availableFor: ['pressure', 'commercial'],
  },
}

// ──────────────────────────────────────────────────────────────
// Service Process Steps (per service type)
// ──────────────────────────────────────────────────────────────

export interface ProcessStep {
  step: number
  title: string
  description: string
  icon: string
  duration?: string
}

export const SERVICE_PROCESS: Record<string, ProcessStep[]> = {
  window: [
    { step: 1, title: 'Inspection & Assessment', description: 'We inspect all windows, frames, and tracks to identify any damage, hard water stains, or special requirements.', icon: '🔍', duration: '5 min' },
    { step: 2, title: 'Dry Pre-Clean', description: 'Remove loose dust, cobwebs, and debris from frames, tracks, and sills before wet cleaning begins.', icon: '🧹', duration: '10 min' },
    { step: 3, title: 'Interior Glass Cleaning', description: 'Professional streak-free cleaning using purified water and microfiber techniques. Both sides of interior glass.', icon: '🪟', duration: '15-30 min' },
    { step: 4, title: 'Exterior Glass Cleaning', description: 'Water-fed pole or traditional squeegee method for exterior glass. Includes frame and sill wiping.', icon: '💧', duration: '15-30 min' },
    { step: 5, title: 'Track & Screen Cleaning', description: 'Deep clean window tracks, remove debris, and wash fly screens (if selected).', icon: '🔧', duration: '10-20 min' },
    { step: 6, title: 'Final Quality Check', description: 'Inspect every window for streaks, missed spots, and ensure smooth operation of all moving parts.', icon: '✅', duration: '5 min' },
  ],
  domestic: [
    { step: 1, title: 'Walk-Through', description: 'Quick assessment of your home to identify priority areas and any special requests.', icon: '🏠', duration: '5 min' },
    { step: 2, title: 'Top-to-Bottom Clean', description: 'Systematic cleaning from highest points (ceiling fans, light fixtures) down to floors.', icon: '🧹', duration: '30-60 min' },
    { step: 3, title: 'Kitchen Deep Clean', description: 'Benchtops, sinks, splashbacks, exterior appliances, and cabinet fronts sanitized.', icon: '🍳', duration: '20-40 min' },
    { step: 4, title: 'Bathroom Sanitization', description: 'Complete bathroom clean including shower, tub, vanity, toilet, mirrors, and floors.', icon: '🚿', duration: '20-30 min' },
    { step: 5, title: 'Bedrooms & Living Areas', description: 'Dusting, vacuuming, mopping, and tidying of all living spaces and bedrooms.', icon: '🛏️', duration: '20-40 min' },
    { step: 6, title: 'Final Inspection', description: 'Walk-through with checklist to ensure every area meets our quality standards.', icon: '✅', duration: '5 min' },
  ],
  endOfLease: [
    { step: 1, title: 'Bond Clean Assessment', description: 'Review your lease agreement requirements and property condition report for specific cleaning obligations.', icon: '📋', duration: '10 min' },
    { step: 2, title: 'Full Property Deep Clean', description: 'Comprehensive clean of every room, cupboard, wardrobe, and storage area throughout the property.', icon: '🏠', duration: '60-120 min' },
    { step: 3, title: 'Kitchen & Bathroom Sanitization', description: 'Professional-grade degreasing and disinfecting of all kitchen and bathroom surfaces.', icon: '🍳', duration: '30-60 min' },
    { step: 4, title: 'Window & Track Cleaning', description: 'Interior windows, tracks, and sills cleaned to rental inspection standards.', icon: '🪟', duration: '20-30 min' },
    { step: 5, title: 'Carpet Steam Cleaning', description: 'Professional hot water extraction carpet cleaning with receipt for your bond claim.', icon: '🧽', duration: '30-60 min' },
    { step: 6, title: 'Bond Guarantee Check', description: 'Final inspection against our 100% bond-back guarantee checklist.', icon: '✅', duration: '10 min' },
  ],
  deep: [
    { step: 1, title: 'Comprehensive Assessment', description: 'Full property walkthrough to identify areas requiring deep cleaning attention.', icon: '🔍', duration: '10 min' },
    { step: 2, title: 'Heavy Dusting & Cobweb Removal', description: 'All surfaces, ceiling corners, light fixtures, vents, and hard-to-reach areas.', icon: '🧹', duration: '20-40 min' },
    { step: 3, title: 'Deep Kitchen & Bathroom', description: 'Behind appliances, inside cupboards, grout scrubbing, and heavy-duty sanitization.', icon: '🍳', duration: '40-60 min' },
    { step: 4, title: 'Floor Deep Clean', description: 'Steam cleaning, scrubbing, and polishing of all floor surfaces throughout the property.', icon: '🧽', duration: '30-60 min' },
    { step: 5, title: 'Detail Work', description: 'Baseboards, door handles, light switches, vents, and all touch points sanitized.', icon: '🎯', duration: '20-30 min' },
    { step: 6, title: 'Quality Assurance', description: 'Manager walkthrough with comprehensive checklist and photo documentation.', icon: '✅', duration: '10 min' },
  ],
  commercial: [
    { step: 1, title: 'Site Assessment', description: 'Evaluate commercial space, identify high-traffic areas, and establish cleaning schedule.', icon: '🏢', duration: '15 min' },
    { step: 2, title: 'High Dusting & Ceilings', description: 'Clean ceiling tiles, vents, light fixtures, and all high surfaces.', icon: '🧹', duration: '20-40 min' },
    { step: 3, title: 'Workspace Cleaning', description: 'Desks, workstations, common areas, and break rooms thoroughly cleaned and sanitized.', icon: '💼', duration: '30-60 min' },
    { step: 4, title: 'Restroom Sanitization', description: 'Deep clean and sanitize all restroom facilities with hospital-grade products.', icon: '🚿', duration: '20-30 min' },
    { step: 5, title: 'Floor Maintenance', description: 'Vacuuming, mopping, and spot treatment of all flooring throughout the commercial space.', icon: '🧽', duration: '30-45 min' },
    { step: 6, title: 'Compliance Documentation', description: 'Provide cleaning report for your WHS records and compliance documentation.', icon: '✅', duration: '10 min' },
  ],
  carpet: [
    { step: 1, title: 'Fibre Assessment', description: 'Identify carpet type, fibre condition, stain types, and any damage areas.', icon: '🔍', duration: '5 min' },
    { step: 2, title: 'Pre-Vacuum', description: 'Thorough vacuuming to remove loose soil, dust, and debris from carpet surface.', icon: '🧹', duration: '10-15 min' },
    { step: 3, title: 'Pre-Treatment', description: 'Apply targeted pre-treatment solution to break down oils, stains, and embedded dirt.', icon: '💧', duration: '10 min' },
    { step: 4, title: 'Hot Water Extraction', description: 'Professional steam cleaning at optimal temperature for deep fibre penetration.', icon: '♨️', duration: '20-40 min' },
    { step: 5, title: 'Spot Treatment', description: 'Targeted treatment for remaining stains with specialized solutions.', icon: '🎯', duration: '10-15 min' },
    { step: 6, title: 'Grooming & Drying', description: 'Carpet grooming for even drying and accelerated airflow setup.', icon: '✅', duration: '10 min' },
  ],
  pressure: [
    { step: 1, title: 'Surface Assessment', description: 'Identify surface type, condition, stains, and appropriate pressure settings.', icon: '🔍', duration: '10 min' },
    { step: 2, title: 'Pre-Treatment', description: 'Apply eco-friendly degreaser or cleaning solution to break down grime.', icon: '💧', duration: '10-15 min' },
    { step: 3, title: 'Pressure Washing', description: 'Professional pressure washing at calibrated PSI for your specific surface type.', icon: '💦', duration: '30-90 min' },
    { step: 4, title: 'Detail Work', description: 'Targeted cleaning of corners, edges, and hard-to-reach areas.', icon: '🎯', duration: '15-30 min' },
    { step: 5, title: 'Rinse & Inspect', description: 'Final rinse and thorough inspection for complete coverage.', icon: '✅', duration: '10 min' },
  ],
  moveInOut: [
    { step: 1, title: 'Property Handover Assessment', description: 'Review current property condition against incoming/outgoing requirements.', icon: '📋', duration: '10 min' },
    { step: 2, title: 'Complete Property Clean', description: 'Every room, cupboard, wardrobe, and storage area thoroughly cleaned.', icon: '🏠', duration: '60-120 min' },
    { step: 3, title: 'Kitchen & Appliance Clean', description: 'All kitchen surfaces, appliances (exterior), and storage areas sanitized.', icon: '🍳', duration: '30-45 min' },
    { step: 4, title: 'Bathroom & Laundry', description: 'Complete sanitization of all wet areas including tiles, grout, and fixtures.', icon: '🚿', duration: '20-30 min' },
    { step: 5, title: 'Floors & Windows', description: 'All floors vacuumed/mopped. Interior windows and tracks cleaned.', icon: '🪟', duration: '20-30 min' },
    { step: 6, title: 'Final Handover Check', description: 'Complete walkthrough ensuring property is move-in ready.', icon: '✅', duration: '10 min' },
  ],
  upholstery: [
    { step: 1, title: 'Fabric Assessment', description: 'Identify upholstery fabric type, condition, stain types, and colourfastness.', icon: '🔍', duration: '5 min' },
    { step: 2, title: 'Pre-Vacuum', description: 'Remove loose dust, crumbs, and debris from all upholstery surfaces.', icon: '🧹', duration: '10 min' },
    { step: 3, title: 'Pre-Treatment', description: 'Apply fabric-safe cleaning solution to break down oils and stains.', icon: '💧', duration: '10 min' },
    { step: 4, title: 'Deep Extraction Clean', description: 'Hot water extraction or dry cleaning method based on fabric type.', icon: '♨️', duration: '20-40 min' },
    { step: 5, title: 'Stain Treatment', description: 'Targeted stain removal for any remaining marks.', icon: '🎯', duration: '10-15 min' },
    { step: 6, title: 'Protection & Drying', description: 'Apply fabric protector (if selected) and setup for accelerated drying.', icon: '✅', duration: '10 min' },
  ],
  builders: [
    { step: 1, title: 'Post-Build Assessment', description: 'Survey construction debris, dust levels, and areas requiring special attention.', icon: '🔍', duration: '15 min' },
    { step: 2, title: 'Debris Removal', description: 'Remove all construction debris, packaging materials, and leftover supplies.', icon: '🗑️', duration: '30-60 min' },
    { step: 3, title: 'Heavy Dust Removal', description: 'Industrial vacuuming and wiping of all surfaces to remove construction dust.', icon: '🧹', duration: '30-60 min' },
    { step: 4, title: 'Window & Glass Clean', description: 'Remove paint splatters, stickers, and construction residue from all glass.', icon: '🪟', duration: '20-40 min' },
    { step: 5, title: 'Deep Surface Clean', description: 'Clean all floors, walls, fixtures, and fittings to handover standard.', icon: '🧽', duration: '30-60 min' },
    { step: 6, title: 'Handover Inspection', description: 'Final walkthrough to ensure property is presentation-ready.', icon: '✅', duration: '10 min' },
  ],
  office: [
    { step: 1, title: 'Office Assessment', description: 'Identify workspace layout, high-traffic zones, and specific cleaning requirements.', icon: '🏢', duration: '10 min' },
    { step: 2, title: 'Desk & Workstation Clean', description: 'Dust and sanitize all desks, monitors (exterior), keyboards, and work surfaces.', icon: '💻', duration: '20-40 min' },
    { step: 3, title: 'Common Area Clean', description: 'Reception, meeting rooms, break rooms, and corridors thoroughly cleaned.', icon: '☕', duration: '20-30 min' },
    { step: 4, title: 'Restroom Sanitization', description: 'Deep clean, disinfect, and restock all restroom facilities.', icon: '🚿', duration: '15-25 min' },
    { step: 5, title: 'Floor Care', description: 'Vacuum carpets, mop hard floors, and spot-clean throughout the office.', icon: '🧽', duration: '20-30 min' },
    { step: 6, title: 'Quality Check', description: 'Manager walkthrough with office cleaning checklist.', icon: '✅', duration: '5 min' },
  ],
  retail: [
    { step: 1, title: 'Store Assessment', description: 'Evaluate retail space, customer areas, stockrooms, and specific requirements.', icon: '🏪', duration: '10 min' },
    { step: 2, title: 'Customer Area Clean', description: 'Display areas, fitting rooms, checkout counters, and entrance cleaned.', icon: '🛍️', duration: '20-30 min' },
    { step: 3, title: 'Window & Display Clean', description: 'All retail windows, glass displays, and mirrors streak-free cleaned.', icon: '🪟', duration: '15-25 min' },
    { step: 4, title: 'Stockroom & Back Office', description: 'Storage areas, staff rooms, and back offices cleaned and organized.', icon: '📦', duration: '15-25 min' },
    { step: 5, title: 'Floor Maintenance', description: 'All flooring types cleaned and polished appropriate to surface.', icon: '🧽', duration: '20-30 min' },
    { step: 6, title: 'Opening-Ready Check', description: 'Ensure store is customer-ready for opening hours.', icon: '✅', duration: '5 min' },
  ],
  strata: [
    { step: 1, title: 'Common Area Assessment', description: 'Identify all common areas, stairwells, lobbies, and shared facilities.', icon: '🏢', duration: '15 min' },
    { step: 2, title: 'Lobby & Entrance Clean', description: 'Main entrances, lobbies, mail areas, and reception areas cleaned.', icon: '🏠', duration: '20-30 min' },
    { step: 3, title: 'Stairwell & Corridor', description: 'All stairwells, corridors, handrails, and common hallways cleaned.', icon: '🪜', duration: '20-30 min' },
    { step: 4, title: 'Shared Facilities', description: 'Laundry rooms, gym areas, pool surrounds, and BBQ areas cleaned.', icon: '🏊', duration: '20-40 min' },
    { step: 5, title: 'Lift & Garage', description: 'Lift interiors, garage areas, and bin rooms cleaned and sanitized.', icon: '🚗', duration: '15-25 min' },
    { step: 6, title: 'Strata Compliance Check', description: 'Document cleaning completion for strata records.', icon: '✅', duration: '10 min' },
  ],
  school: [
    { step: 1, title: 'School Assessment', description: 'Identify classrooms, common areas, admin offices, and specialized areas.', icon: '🏫', duration: '15 min' },
    { step: 2, title: 'Classroom Clean', description: 'Desks, whiteboards, shelves, and floor cleaning in all classrooms.', icon: '📚', duration: '20-40 min' },
    { step: 3, title: 'Common Areas', description: 'Library, cafeteria, gym, and hallways thoroughly cleaned.', icon: '🏀', duration: '20-30 min' },
    { step: 4, title: 'Restroom Sanitization', description: 'All student and staff restrooms deep cleaned and sanitized.', icon: '🚿', duration: '15-25 min' },
    { step: 5, title: 'Admin Areas', description: 'Staff rooms, offices, and reception areas cleaned.', icon: '💼', duration: '15-20 min' },
    { step: 6, title: 'Safety Check', description: 'Ensure all areas are safe for student return.', icon: '✅', duration: '10 min' },
  ],
  medical: [
    { step: 1, title: 'Medical Facility Assessment', description: 'Identify clinical areas, waiting rooms, offices, and specialized cleaning requirements.', icon: '🏥', duration: '15 min' },
    { step: 2, title: 'Clinical Area Clean', description: 'Hospital-grade cleaning of consultation rooms, treatment areas, and equipment surfaces.', icon: '🩺', duration: '30-45 min' },
    { step: 3, title: 'Waiting & Reception', description: 'Patient waiting areas, reception, and common areas thoroughly cleaned.', icon: '🪑', duration: '15-25 min' },
    { step: 4, title: 'Restroom Sanitization', description: 'All restrooms cleaned with medical-grade disinants.', icon: '🚿', duration: '15-20 min' },
    { step: 5, title: 'Floor Disinfection', description: 'All floors cleaned and disinfected with hospital-approved products.', icon: '🧽', duration: '20-30 min' },
    { step: 6, title: 'Compliance Documentation', description: 'Provide cleaning certificates and documentation for medical compliance records.', icon: '✅', duration: '10 min' },
  ],
  industrial: [
    { step: 1, title: 'Industrial Site Assessment', description: 'Evaluate warehouse, factory, or industrial space cleaning requirements.', icon: '🏭', duration: '20 min' },
    { step: 2, title: 'Heavy Debris Removal', description: 'Remove industrial waste, packaging, and accumulated debris.', icon: '🗑️', duration: '30-60 min' },
    { step: 3, title: 'Floor Scrubbing', description: 'Industrial floor scrubbing and degreasing of all work areas.', icon: '🧽', duration: '40-90 min' },
    { step: 4, title: 'Equipment Surface Clean', description: 'Clean exterior surfaces of machinery, shelving, and storage areas.', icon: '⚙️', duration: '20-40 min' },
    { step: 5, title: 'High Dusting', description: 'Ceiling beams, light fixtures, vents, and elevated surfaces cleaned.', icon: '🧹', duration: '20-30 min' },
    { step: 6, title: 'WHS Compliance Check', description: 'Document cleaning for WHS compliance and safety audit records.', icon: '✅', duration: '10 min' },
  ],
  disinfection: [
    { step: 1, title: 'Risk Assessment', description: 'Identify high-touch surfaces, contamination zones, and priority areas.', icon: '🔍', duration: '10 min' },
    { step: 2, title: 'Pre-Clean', description: 'Remove visible dirt and debris before disinfection treatment.', icon: '🧹', duration: '15-20 min' },
    { step: 3, title: 'Electrostatic Application', description: 'Apply hospital-grade disinfectant using electrostatic sprayer for complete coverage.', icon: '💧', duration: '20-40 min' },
    { step: 4, title: 'High-Touch Surface Treatment', description: 'Targeted disinfection of door handles, switches, rails, and counters.', icon: '🎯', duration: '15-25 min' },
    { step: 5, title: 'Dwell Time Monitoring', description: 'Ensure required contact time for disinfectant effectiveness.', icon: '⏱️', duration: '10-15 min' },
    { step: 6, title: 'Verification & Report', description: 'ATP testing (if requested) and completion report for your records.', icon: '✅', duration: '10 min' },
  ],
  tile: [
    { step: 1, title: 'Tile & Grout Assessment', description: 'Evaluate tile type, grout condition, stain types, and sealing needs.', icon: '🔍', duration: '5 min' },
    { step: 2, title: 'Pre-Sweep & Vacuum', description: 'Remove loose dirt, dust, and debris from tile surfaces.', icon: '🧹', duration: '10 min' },
    { step: 3, title: 'Deep Scrub', description: 'Rotary scrubbing with specialized tile cleaner to lift embedded dirt.', icon: '🧽', duration: '20-40 min' },
    { step: 4, title: 'Grout Cleaning', description: 'Targeted grout line cleaning with steam or chemical treatment.', icon: '🎯', duration: '15-30 min' },
    { step: 5, title: 'Extraction & Rinse', description: 'Hot water extraction to remove all cleaning residue and loosened dirt.', icon: '💧', duration: '15-20 min' },
    { step: 6, title: 'Seal & Protect', description: 'Apply grout sealer (if selected) for long-lasting protection.', icon: '✅', duration: '15-20 min' },
  ],
  laundry: [
    { step: 1, title: 'Laundry Assessment', description: 'Evaluate laundry area, appliances, and cleaning requirements.', icon: '🔍', duration: '5 min' },
    { step: 2, title: 'Appliance Exteriors', description: 'Clean and sanitize washing machine, dryer, and iron exteriors.', icon: '🧺', duration: '10-15 min' },
    { step: 3, title: 'Sink & Bench Clean', description: 'Deep clean laundry sink, taps, and benchtop surfaces.', icon: '💧', duration: '10 min' },
    { step: 4, title: 'Cabinet & Storage', description: 'Clean inside and out of all laundry cupboards and storage.', icon: '🗄️', duration: '10-15 min' },
    { step: 5, title: 'Floor Clean', description: 'Scrub and mop laundry room floor with degreaser.', icon: '🧽', duration: '10 min' },
    { step: 6, title: 'Final Check', description: 'Ensure all surfaces are clean, dry, and organized.', icon: '✅', duration: '5 min' },
  ],
  oven: [
    { step: 1, title: 'Oven Assessment', description: 'Evaluate oven type, condition, and level of grease buildup.', icon: '🔍', duration: '5 min' },
    { step: 2, title: 'Component Removal', description: 'Remove racks, trays, and removable components for separate cleaning.', icon: '🔧', duration: '5 min' },
    { step: 3, title: 'Degrease Application', description: 'Apply professional-grade, non-toxic degreaser to all interior surfaces.', icon: '💧', duration: '10 min' },
    { step: 4, title: 'Dwell & Scrub', description: 'Allow degreaser to work, then scrub away baked-on grease and carbon.', icon: '🧽', duration: '20-40 min' },
    { step: 5, title: 'Rinse & Polish', description: 'Thorough rinse and polish of all interior and exterior surfaces.', icon: '✨', duration: '15-20 min' },
    { step: 6, title: 'Reassembly & Test', description: 'Reinstall all components and test oven operation.', icon: '✅', duration: '5 min' },
  ],
}

// ──────────────────────────────────────────────────────────────
// Service Testimonials (per service type)
// ──────────────────────────────────────────────────────────────

export interface Testimonial {
  name: string
  location: string
  rating: number
  text: string
  date: string
  service: string
}

export const SERVICE_TESTIMONIALS: Record<string, Testimonial[]> = {
  window: [
    { name: 'Karen T.', location: 'Bondi, NSW', rating: 5, text: 'They cleaned 23 windows in our two-storey home in under 2 hours. Not a single streak! The high-reach poles meant no ladders needed.', date: '2026-03-28', service: 'window' },
    { name: 'David M.', location: 'Parramatta, NSW', rating: 5, text: 'Our office windows haven\'t looked this good since the building was new. Professional, on-time, and thorough.', date: '2026-03-15', service: 'window' },
    { name: 'Sarah L.', location: 'Manly, NSW', rating: 4, text: 'Great window cleaning including tracks and screens. Saved me a weekend of DIY. Worth every penny.', date: '2026-02-20', service: 'window' },
  ],
  domestic: [
    { name: 'Emma W.', location: 'Sydney CBD', rating: 5, text: 'Regular fortnightly cleans for 6 months now. Our apartment always looks and smells amazing. Highly recommend!', date: '2026-04-10', service: 'domestic' },
    { name: 'James P.', location: 'Cronulla, NSW', rating: 5, text: 'Best domestic cleaning service we\'ve used. They even organize the kids\' toys by colour!', date: '2026-03-22', service: 'domestic' },
  ],
  endOfLease: [
    { name: 'Michael R.', location: 'Chatswood, NSW', rating: 5, text: 'Got my full $3,200 bond back! The agent said it was the cleanest property they\'d ever inspected.', date: '2026-04-05', service: 'endOfLease' },
    { name: 'Lisa C.', location: 'Newtown, NSW', rating: 5, text: 'Bond-back guarantee is real. They came back for a touch-up when the agent found one spot. Amazing service.', date: '2026-03-18', service: 'endOfLease' },
  ],
  carpet: [
    { name: 'Tom H.', location: 'Liverpool, NSW', rating: 5, text: 'My 10-year-old carpets look brand new. The stain treatment removed coffee stains I thought were permanent.', date: '2026-04-01', service: 'carpet' },
  ],
  pressure: [
    { name: 'Rachel K.', location: 'Penrith, NSW', rating: 5, text: 'Our driveway looks like it was just poured. The team removed 5 years of oil stains and tyre marks.', date: '2026-03-25', service: 'pressure' },
  ],
}

// Default testimonials for services without specific ones
export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: 'Alex N.', location: 'Sydney, NSW', rating: 5, text: 'Excellent service from start to finish. Professional team and outstanding results.', date: '2026-04-10', service: '' },
  { name: 'Maria G.', location: 'Melbourne, VIC', rating: 5, text: 'Transparent pricing, no surprises. The online quote builder made it so easy to book.', date: '2026-03-28', service: '' },
]

// ──────────────────────────────────────────────────────────────
// Service Tips / FAQs specific content
// ──────────────────────────────────────────────────────────────

export interface ServiceTip {
  title: string
  content: string
  icon: string
}

export const SERVICE_TIPS: Record<string, ServiceTip[]> = {
  window: [
    { title: 'How often should windows be cleaned?', content: 'For residential properties, we recommend every 3-6 months. Commercial properties in high-dust areas may need quarterly cleaning. Coastal properties should clean every 2-3 months due to salt buildup.', icon: '📅' },
    { title: 'Can you clean windows on rainy days?', content: 'Yes! Rain doesn\'t affect our cleaning quality. We use purified water and professional techniques that work in most weather conditions. Heavy storms may require rescheduling.', icon: '🌧️' },
    { title: 'Do you clean both sides?', content: 'Absolutely. Our standard service includes both interior and exterior window cleaning, plus frame and sill wiping. We also clean glass doors and mirrors.', icon: '🪟' },
  ],
  domestic: [
    { title: 'Should I be home during the clean?', content: 'Not required! Many clients provide a key or code. Our cleaners are police-checked, insured, and GPS-tracked for your peace of mind.', icon: '🏠' },
    { title: 'Do you bring your own supplies?', content: 'Yes, we bring all professional-grade cleaning products and equipment. If you prefer specific eco-friendly products, just let us know.', icon: '🧴' },
  ],
  endOfLease: [
    { title: 'What if the agent isn\'t satisfied?', content: 'Our bond-back guarantee means we\'ll return to re-clean any areas the agent flags, at no additional cost. This applies within 7 days of our initial clean.', icon: '🛡️' },
    { title: 'How long before inspection?', content: 'We recommend booking 1-3 days before your final inspection. This gives you buffer time for any touch-ups if needed.', icon: '📅' },
  ],
  carpet: [
    { title: 'How long until carpets are dry?', content: 'Most carpets are dry within 2-4 hours with proper ventilation. We use hot water extraction which leaves minimal moisture. We can setup air movers for faster drying.', icon: '⏱️' },
    { title: 'Will cleaning shrink my carpet?', content: 'No. Professional hot water extraction at correct temperatures won\'t cause shrinkage. We pre-test all carpets for colourfastness and fibre type.', icon: '📏' },
  ],
  pressure: [
    { title: 'Will pressure washing damage my surface?', content: 'We calibrate PSI for each surface type. Soft washing (500-1200 PSI) for delicate surfaces, medium (1500-2500 PSI) for concrete, and high (3000+ PSI) for industrial surfaces only.', icon: '🛡️' },
    { title: 'How often should I pressure wash?', content: 'Driveways and paths: annually. Building exteriors: every 2-3 years. Decks and fences: annually before sealing. Commercial properties: quarterly.', icon: '📅' },
  ],
}

// ──────────────────────────────────────────────────────────────
// Service Pricing Notes (per service type)
// ──────────────────────────────────────────────────────────────

export interface PricingNote {
  title: string
  note: string
}

export const SERVICE_PRICING_NOTES: Record<string, PricingNote[]> = {
  window: [
    { title: 'Per-Window Pricing', note: 'Base price is per standard window (up to 1.5m × 1.2m). Larger windows, skylights, and specialty glass may have additional charges.' },
    { title: 'Minimum Call-Out', note: 'Minimum charge applies for jobs under $80 to cover travel and setup costs.' },
    { title: 'Multi-Storey', note: 'Windows above ground floor may require water-fed pole system, included in our high-reach addon.' },
  ],
  domestic: [
    { title: 'Per-Room Pricing', note: 'Base price includes standard rooms. Bathrooms and kitchens have higher base rates due to sanitization requirements.' },
    { title: 'Frequency Discounts', note: 'Weekly: 25% off, Fortnightly: 15% off, Monthly: 10% off. Lock in your schedule for ongoing savings.' },
  ],
  endOfLease: [
    { title: 'Bond-Clean Guarantee', note: 'Includes full bond-back guarantee. We\'ll re-clean any areas flagged by your agent at no extra cost within 7 days.' },
    { title: 'Property Size Pricing', note: '1-bed unit from $350, 2-bed from $450, 3-bed house from $550. Larger properties quoted individually.' },
  ],
  carpet: [
    { title: 'Per-Room Pricing', note: 'Base price per room (up to 15m²). Larger rooms and open-plan areas priced by square metre.' },
    { title: 'Minimum 2 Rooms', note: 'Minimum charge for 2 rooms to cover setup and equipment costs.' },
  ],
  pressure: [
    { title: 'Area-Based Pricing', note: 'Pricing based on total surface area. Driveways, paths, decks, and walls priced separately.' },
    { title: 'Access Requirements', note: 'Ensure water access is available. Properties without external tap access may require water tank setup (+$25).' },
  ],
}

// ──────────────────────────────────────────────────────────────
// Helper: Get addon definitions for a specific service
// ──────────────────────────────────────────────────────────────

export function getAddonsForService(serviceId: string): AddonDefinition[] {
  return Object.values(ADDON_DEFINITIONS).filter(
    (addon) => !addon.availableFor || addon.availableFor.includes(serviceId)
  )
}

// ──────────────────────────────────────────────────────────────
// Helper: Get testimonials for a specific service
// ──────────────────────────────────────────────────────────────

export function getTestimonialsForService(serviceId: string): Testimonial[] {
  const specific = SERVICE_TESTIMONIALS[serviceId]
  if (specific && specific.length > 0) return specific
  // Return random subset of default testimonials
  return DEFAULT_TESTIMONIALS.slice(0, 2)
}

// ──────────────────────────────────────────────────────────────
// Helper: Get tips for a specific service
// ──────────────────────────────────────────────────────────────

export function getTipsForService(serviceId: string): ServiceTip[] {
  return SERVICE_TIPS[serviceId] || []
}

// ──────────────────────────────────────────────────────────────
// Helper: Get pricing notes for a specific service
// ──────────────────────────────────────────────────────────────

export function getPricingNotesForService(serviceId: string): PricingNote[] {
  return SERVICE_PRICING_NOTES[serviceId] || []
}
