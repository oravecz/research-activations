#!/usr/bin/env node

/**
 * Slide Image Generator
 *
 * Generates 16:9 slide images from brand logos for all events.
 * Creates professional-looking slide backgrounds with brand logo prominently displayed.
 *
 * Usage:
 *   node scripts/generate-slide-images.js --all
 *   node scripts/generate-slide-images.js --range 1-25
 *   node scripts/generate-slide-images.js --event <id>
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Load events data
function loadEventsData() {
  const eventsPath = path.join(process.cwd(), 'events', 'details.json');
  const data = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
  return data.events || [];
}

// Generate brand slug
function generateBrandSlug(brandName) {
  return brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Get event directory
function getEventDirectory(event) {
  const brandSlug = generateBrandSlug(event.brand);
  return path.join(process.cwd(), 'events', brandSlug, `event-${event.id}`);
}

// Brand color schemes (based on common brand colors)
const BRAND_COLORS = {
  'Nike': { bg: '#000000', accent: '#FFFFFF' },
  'adidas': { bg: '#000000', accent: '#FFFFFF' },
  'On Running': { bg: '#FFFFFF', accent: '#000000' },
  'Foot Locker': { bg: '#000000', accent: '#FFFFFF' },
  'Crocs': { bg: '#FFFFFF', accent: '#F05A28' },
  'New Balance': { bg: '#FFFFFF', accent: '#D32F2F' },
  'Allbirds': { bg: '#FFFFFF', accent: '#212121' },
  'Vans': { bg: '#000000', accent: '#FFFFFF' },
  'Converse': { bg: '#000000', accent: '#FFFFFF' },
  'Patagonia': { bg: '#FFFFFF', accent: '#004D40' },
  'Lululemon': { bg: '#D32F2F', accent: '#FFFFFF' },
  'Zara': { bg: '#FFFFFF', accent: '#000000' },
  'Target': { bg: '#CC0000', accent: '#FFFFFF' },
  'REI': { bg: '#2D5C3F', accent: '#FFFFFF' },
  'Apple': { bg: '#000000', accent: '#FFFFFF' },
  'Warby Parker': { bg: '#3D5A99', accent: '#FFFFFF' },
  'Dick\'s Sporting Goods': { bg: '#FFFFFF', accent: '#004990' },
  'Sephora': { bg: '#000000', accent: '#FFFFFF' },
  'Ulta Beauty': { bg: '#FFFFFF', accent: '#E91E63' },
  'Anthropologie': { bg: '#FFFFFF', accent: '#5D4037' },
  'Urban Outfitters': { bg: '#000000', accent: '#FFFFFF' },
  'Gap': { bg: '#003A70', accent: '#FFFFFF' },
  'Old Navy': { bg: '#003A70', accent: '#FFFFFF' },
  'H&M': { bg: '#E50010', accent: '#FFFFFF' },
  'Everlane': { bg: '#FFFFFF', accent: '#000000' },
  'Madewell': { bg: '#FFFFFF', accent: '#424242' },
  'Nordstrom': { bg: '#000000', accent: '#FFFFFF' },
  'Best Buy': { bg: '#0046BE', accent: '#FFFF00' },
  'Whole Foods Market': { bg: '#00674B', accent: '#FFFFFF' },
  'Trader Joe\'s': { bg: '#FFFFFF', accent: '#D32F2F' },
  'IKEA': { bg: '#0051BA', accent: '#FFDB00' },
  'West Elm': { bg: '#FFFFFF', accent: '#795548' },
  'CB2': { bg: '#000000', accent: '#FFFFFF' },
  'Williams Sonoma': { bg: '#FFFFFF', accent: '#8D6E63' },
  'Sunglass Hut': { bg: '#000000', accent: '#FFFFFF' },
  'Alo Yoga': { bg: '#FFFFFF', accent: '#000000' },
  'Outdoor Voices': { bg: '#FFFFFF', accent: '#FF6B6B' },
  'Athleta': { bg: '#FFFFFF', accent: '#6A1B9A' },
  'Free People Movement': { bg: '#FFFFFF', accent: '#8D6E63' },
  'Vuori': { bg: '#FFFFFF', accent: '#424242' }
};

// Get brand colors or use default
function getBrandColors(brand) {
  return BRAND_COLORS[brand] || { bg: '#FFFFFF', accent: '#000000' };
}

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

// Generate slide image from logo
async function generateSlideImage(event) {
  const eventDir = getEventDirectory(event);
  const logoPath = path.join(eventDir, 'logo.png');
  const outputPath = path.join(eventDir, 'slide-image.png');

  if (!fs.existsSync(logoPath)) {
    console.log(`  ✗ Logo not found: ${logoPath}`);
    return false;
  }

  const colors = getBrandColors(event.brand);
  const bgColor = hexToRgb(colors.bg);

  try {
    // Target dimensions for 16:9
    const width = 1920;
    const height = 1080;

    // Create background
    const background = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: bgColor
      }
    }).png().toBuffer();

    // Prepare logo for compositing
    // Logo should take up about 40% of the width and be centered
    const logoMaxWidth = Math.floor(width * 0.4);
    const logoMaxHeight = Math.floor(height * 0.5);

    const logoBuffer = await sharp(logoPath)
      .resize({
        width: logoMaxWidth,
        height: logoMaxHeight,
        fit: 'inside',
        withoutEnlargement: false
      })
      .toBuffer();

    // Get resized logo dimensions
    const logoMeta = await sharp(logoBuffer).metadata();

    // Center the logo
    const logoX = Math.floor((width - logoMeta.width) / 2);
    const logoY = Math.floor((height - logoMeta.height) / 2);

    // Composite logo onto background
    await sharp(background)
      .composite([{
        input: logoBuffer,
        top: logoY,
        left: logoX
      }])
      .toFile(outputPath);

    console.log(`  ✓ Generated slide image: ${outputPath}`);

    // Update metadata
    const metadataPath = path.join(eventDir, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      metadata.assets.collage.generatedAt = new Date().toISOString();
      metadata.assets.collage.status = 'generated';
      metadata.assets.collage.method = 'logo-centered';
      metadata.assets.collage.dimensions = { width, height };
      metadata.updatedAt = new Date().toISOString();
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }

    return true;

  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    return false;
  }
}

// Batch generate slide images
async function batchGenerateSlideImages(startId, endId) {
  const events = loadEventsData();
  const filteredEvents = events.filter(e =>
    (startId === undefined || e.id >= startId) &&
    (endId === undefined || e.id <= endId)
  );

  console.log('='.repeat(80));
  console.log(`GENERATING SLIDE IMAGES (Events ${startId || 1}-${endId || 50})`);
  console.log('='.repeat(80));
  console.log('');
  console.log(`Processing ${filteredEvents.length} events...`);
  console.log('');

  const results = [];

  for (const event of filteredEvents) {
    console.log(`[${event.id}] ${event.brand} - ${event.title}`);
    const success = await generateSlideImage(event);
    results.push({ event, success });
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('GENERATION SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log('');

  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('Slide Image Generator');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/generate-slide-images.js --all');
    console.log('  node scripts/generate-slide-images.js --range <start-end>');
    console.log('  node scripts/generate-slide-images.js --event <id>');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/generate-slide-images.js --all');
    console.log('  node scripts/generate-slide-images.js --range 1-25');
    console.log('  node scripts/generate-slide-images.js --range 26-50');
    console.log('  node scripts/generate-slide-images.js --event 1');
    console.log('');
    return;
  }

  const command = args[0];

  switch (command) {
    case '--all':
      await batchGenerateSlideImages(1, 50);
      break;

    case '--range': {
      if (!args[1]) {
        console.error('Error: --range requires <start-end>');
        process.exit(1);
      }
      const [start, end] = args[1].split('-').map(n => parseInt(n));
      await batchGenerateSlideImages(start, end);
      break;
    }

    case '--event': {
      if (!args[1]) {
        console.error('Error: --event requires <id>');
        process.exit(1);
      }
      const eventId = parseInt(args[1]);
      const events = loadEventsData();
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error(`Event ${eventId} not found`);
        process.exit(1);
      }
      console.log(`Generating slide image for event ${eventId}...`);
      const success = await generateSlideImage(event);
      process.exit(success ? 0 : 1);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateSlideImage, batchGenerateSlideImages };
