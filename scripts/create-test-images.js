#!/usr/bin/env node

/**
 * Create test images for collage generation testing
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createTestImages() {
  const outputDir = 'scripts/test-collage';

  // Create logo (400x200, white background with text)
  await sharp({
    create: {
      width: 400,
      height: 200,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .png()
  .toFile(path.join(outputDir, 'logo.png'));

  console.log('Created logo.png');

  // Create 3 promotional images with different colors
  const colors = [
    { r: 255, g: 100, b: 100 }, // Red
    { r: 100, g: 255, b: 100 }, // Green
    { r: 100, g: 100, b: 255 }  // Blue
  ];

  for (let i = 0; i < 3; i++) {
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: colors[i]
      }
    })
    .jpeg()
    .toFile(path.join(outputDir, `promo-${i + 1}.jpg`));

    console.log(`Created promo-${i + 1}.jpg`);
  }

  console.log('\nTest images created successfully in scripts/test-collage/');
}

createTestImages().catch(error => {
  console.error('Error creating test images:', error);
  process.exit(1);
});
