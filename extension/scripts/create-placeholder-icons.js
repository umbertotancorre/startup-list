#!/usr/bin/env node

/**
 * Creates simple placeholder PNG icons for the extension
 * This is a fallback if ImageMagick is not available
 */

const fs = require('fs');
const path = require('path');

// Simple function to create a minimal valid PNG
function createPlaceholderPNG(size, color) {
  const Canvas = require('canvas');
  const canvas = Canvas.createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Blue background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // White checkmark
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = size / 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(size * 0.25, size * 0.5);
  ctx.lineTo(size * 0.4, size * 0.65);
  ctx.lineTo(size * 0.75, size * 0.35);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

async function generateIcons() {
  try {
    // Check if canvas is available
    require.resolve('canvas');
  } catch (e) {
    console.log('⚠️  Canvas module not found. Installing...');
    console.log('Run: npm install canvas --save-dev');
    console.log('\nOr use the shell script instead:');
    console.log('  ./scripts/generate-icons.sh');
    process.exit(1);
  }

  const iconsDir = path.join(__dirname, '../icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [
    { size: 16, name: 'icon16.png' },
    { size: 48, name: 'icon48.png' },
    { size: 128, name: 'icon128.png' },
  ];

  console.log('Generating placeholder PNG icons...\n');

  for (const { size, name } of sizes) {
    const buffer = createPlaceholderPNG(size, '#3B82F6');
    const filePath = path.join(iconsDir, name);
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Created ${name} (${size}x${size})`);
  }

  console.log('\n✓ All placeholder icons generated successfully!');
  console.log('\nYou can now build the extension with: npm run build');
}

generateIcons().catch(console.error);

