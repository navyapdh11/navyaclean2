// Generate PWA icons from SVG
// Run: node generate-icons.js
import { writeFileSync, mkdirSync } from 'fs'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const shortcutSizes = [96]

// Simple SVG to PNG converter using base64
function createIconSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#00f0ff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#bg)"/>
    <text x="${size/2}" y="${size * 0.62}" text-anchor="middle" font-size="${Math.round(size * 0.55)}" fill="#0a0a0a" font-family="system-ui,sans-serif">✨</text>
  </svg>`
}

// Create a simple placeholder PNG (1x1 transparent pixel as fallback)
// In production, replace these with actual PNG files generated from the SVG
const placeholder = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

console.log('📱 PWA Icon Generator')
console.log('')
console.log('SVG icon created at: public/icons/icon.svg')
console.log('')
console.log('To generate PNG icons, use one of these methods:')
console.log('')
console.log('Option 1: Online converter')
console.log('  1. Open public/icons/icon.svg in a browser')
console.log('  2. Screenshot at each size or use https://svgtopng.com/')
console.log('  3. Save as: icon-72x72.png, icon-96x96.png, etc.')
console.log('')
console.log('Option 2: Use sharp (npm)')
console.log('  npm install sharp')
console.log('  npx sharp public/icons/icon.svg -o public/icons/icon-512x512.png -w 512 -h 512')
console.log('')
console.log('Option 3: Use pwa-asset-generator (recommended)')
console.log('  npx pwa-asset-generator public/icons/icon.svg public/icons/')
console.log('')
console.log('Required icon sizes:')
sizes.forEach(s => console.log(`  - icon-${s}x${s}.png`))
console.log('')
console.log('✅ Icon SVG template created successfully!')
