// Script pour générer les icônes PWA avec Sharp
// Usage: node scripts/generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

// SVG de l'icône PronoScope
const iconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#39ff14;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#32e010;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffb347;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)"/>

  <!-- Border glow -->
  <rect x="10" y="10" width="492" height="492" rx="90" fill="none" stroke="url(#neonGrad)" stroke-width="4" filter="url(#glow)"/>

  <!-- Trophy icon -->
  <g transform="translate(156, 100)" filter="url(#glow)">
    <!-- Cup body -->
    <path d="M0 50 L20 180 L180 180 L200 50 Z" fill="url(#goldGrad)"/>
    <!-- Cup handles -->
    <path d="M0 50 Q-40 50 -40 100 Q-40 150 20 150" fill="none" stroke="url(#goldGrad)" stroke-width="20" stroke-linecap="round"/>
    <path d="M200 50 Q240 50 240 100 Q240 150 180 150" fill="none" stroke="url(#goldGrad)" stroke-width="20" stroke-linecap="round"/>
    <!-- Cup base -->
    <rect x="60" y="180" width="80" height="20" fill="url(#goldGrad)"/>
    <rect x="40" y="200" width="120" height="15" rx="5" fill="url(#goldGrad)"/>
    <!-- Star on trophy -->
    <path d="M100 80 L108 105 L135 105 L113 120 L122 145 L100 130 L78 145 L87 120 L65 105 L92 105 Z" fill="url(#neonGrad)"/>
  </g>

  <!-- VIP text -->
  <text x="256" y="380" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="900" fill="url(#neonGrad)" text-anchor="middle" filter="url(#glow)">VIP</text>

  <!-- La Passion text -->
  <text x="256" y="430" font-family="Arial, sans-serif" font-size="32" font-weight="600" fill="#ffffff" text-anchor="middle" opacity="0.8">LA PASSION</text>
</svg>
`;

async function generateIcons() {
  console.log('Generating PWA icons...');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG file
  const svgPath = path.join(publicDir, 'icon.svg');
  fs.writeFileSync(svgPath, iconSVG.trim());
  console.log('Created: icon.svg');

  // Generate PNG icons at different sizes
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);

    try {
      await sharp(Buffer.from(iconSVG))
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`Created: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`Error creating icon-${size}x${size}.png:`, error.message);
    }
  }

  // Generate Apple Touch Icon (180x180)
  try {
    const applePath = path.join(publicDir, 'apple-touch-icon.png');
    await sharp(Buffer.from(iconSVG))
      .resize(180, 180)
      .png()
      .toFile(applePath);
    console.log('Created: apple-touch-icon.png');
  } catch (error) {
    console.error('Error creating apple-touch-icon.png:', error.message);
  }

  // Generate favicon.ico (32x32 PNG as ICO alternative)
  try {
    const faviconPath = path.join(publicDir, 'favicon.png');
    await sharp(Buffer.from(iconSVG))
      .resize(32, 32)
      .png()
      .toFile(faviconPath);
    console.log('Created: favicon.png');
  } catch (error) {
    console.error('Error creating favicon.png:', error.message);
  }

  console.log('\nAll icons generated successfully!');
  console.log('Run: node scripts/generate-icons.js');
}

generateIcons().catch(console.error);
