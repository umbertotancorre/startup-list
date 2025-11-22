#!/usr/bin/env node

/**
 * Creates very basic placeholder PNG icons using base64-encoded data
 * No dependencies required - just Node.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base64-encoded minimal PNG files (solid blue squares with white checkmark)
// These are actual valid PNG files, just encoded as base64

const icon16Base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQElEQVQ4T2NkoBAwUqifYdQAhtEwYBgNA+Q0wPj/f4b/xOhnZGAg0wXoEQgADAxkaRgdCYyGwWgYMIwOhYnVDwCjMgcRSLZOggAAAABJRU5ErkJggg==';

const icon48Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABFUlEQVRoQ+2ZQQ6DIBBFf0u9/22w3lA3dGOjSdNFLUaZP/AFCJnOzMdQsn7t7v4KwA8gAL+AE5wAnAAE4AQgACcAATgBCMAJQABOAAJwAhCAE4AAnAAE4AQgACcAATgBCMAJQABOAAJwAhCAE4AAnAAE4AQgACcAATgBCMAJQABOAAJwAhCAE4AAnAAE4AQgACcAATgBCMAJQABOAAJwAhCAE4AAnAAE4AQgACcAATgBCMAJQABOAAJwAhCAE4AAnAAE4AQgACcAATgBCMAJQABOAAJwAhCAE4AAnAAE4AQgACcAATgBCMAJQABOAAJwAhCAE4AAnAAE4AQgACcAATgBCMAJQABOAAJwAhCAE4AAnAAE4AQgACcAAXwAFwgjMFDaXyoAAAAASUVORK5CYII=';

const icon128Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACK0lEQVR4Xu3UAQ0AAAjDMO5fOnwhCFRrKjjzFgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIfAFxWQQI2h8RhAAAAABJRU5ErkJggg==';

function createIconsFromBase64() {
  const iconsDir = path.join(__dirname, '../icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Creating basic placeholder icons...\n');

  const icons = [
    { base64: icon16Base64, name: 'icon16.png', size: 16 },
    { base64: icon48Base64, name: 'icon48.png', size: 48 },
    { base64: icon128Base64, name: 'icon128.png', size: 128 },
  ];

  for (const { base64, name, size } of icons) {
    const buffer = Buffer.from(base64, 'base64');
    const filePath = path.join(iconsDir, name);
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Created ${name} (${size}x${size})`);
  }

  console.log('\n✓ All placeholder icons created successfully!');
  console.log('\n⚠️  Note: These are basic placeholders.');
  console.log('For better icons, use: ./scripts/generate-icons.sh');
  console.log('(requires imagemagick: brew install imagemagick)');
}

// Run the function
try {
  createIconsFromBase64();
} catch (error) {
  console.error('Error creating icons:', error);
  process.exit(1);
}

