#!/usr/bin/env node

/**
 * Event Image Collection Script
 *
 * Uses Playwright MCP to collect images from event URLs and organize them.
 * Ensures logo is first, followed by up to 8 promotional images.
 *
 * Usage:
 *   node scripts/collect-event-images.js --event <id>
 *   node scripts/collect-event-images.js --all
 *   node scripts/collect-event-images.js --range 1-10
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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

// Download image from URL
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(dest);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadImage(response.headers.location, dest).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Extract image URLs from page using Playwright
async function extractImageUrlsFromPage(url) {
  console.log(`  Opening page: ${url}`);

  // This function will need to be called via Claude Code's Playwright MCP
  // For now, return instructions for manual implementation

  return {
    instructions: [
      '1. Use mcp__playwright__browser_navigate to open the event URL',
      '2. Use mcp__playwright__browser_evaluate to run JavaScript:',
      '   - Find all img elements: document.querySelectorAll("img")',
      '   - Filter out small images (< 200px width/height)',
      '   - Filter out common ad/icon patterns',
      '   - Extract src or data-src attributes',
      '   - Check for srcset and get highest resolution',
      '   - Return array of image URLs',
      '3. Use mcp__playwright__browser_close when done'
    ],
    exampleJavaScript: `
      const images = Array.from(document.querySelectorAll('img'))
        .filter(img => {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          return width >= 200 && height >= 200;
        })
        .filter(img => {
          const src = img.src || img.dataset.src || '';
          // Filter out icons, ads, tracking pixels
          return !src.match(/icon|logo|badge|avatar|pixel|tracker|ad\\.doubleclick/i);
        })
        .map(img => {
          // Get highest resolution from srcset if available
          if (img.srcset) {
            const sources = img.srcset.split(',').map(s => s.trim().split(' '));
            const highest = sources.sort((a, b) => {
              const aWidth = parseInt(a[1]) || 0;
              const bWidth = parseInt(b[1]) || 0;
              return bWidth - aWidth;
            })[0];
            return highest[0];
          }
          return img.src || img.dataset.src;
        })
        .filter(src => src && src.startsWith('http'))
        .slice(0, 15); // Get up to 15 candidates

      return images;
    `
  };
}

// Organize images for event (logo first, then promotional images)
async function organizeEventImages(event) {
  const eventDir = getEventDirectory(event);
  const metadataPath = path.join(eventDir, 'metadata.json');
  const imagesDir = path.join(eventDir, 'images');

  // Create images directory
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  console.log(`[${event.id}] ${event.brand} - ${event.title}`);
  console.log(`  Event directory: ${eventDir}`);

  // Check for logo
  const logoPath = path.join(eventDir, 'logo.png');
  const hasLogo = fs.existsSync(logoPath);

  if (hasLogo) {
    // Copy logo as first image
    const logoDestPath = path.join(imagesDir, 'image-0.png');
    fs.copyFileSync(logoPath, logoDestPath);
    console.log(`  ✓ Logo copied as image-0.png`);
  } else {
    console.log(`  ✗ Logo not found at ${logoPath}`);
    console.log(`    Run: node scripts/download-brand-assets.js --download-logo "${event.brand}" ${event.id}`);
  }

  // Instructions for collecting promotional images
  console.log(`\n  To collect promotional images from ${event.url}:`);
  console.log(`  1. Open page with Playwright browser_navigate`);
  console.log(`  2. Run browser_evaluate with image extraction JavaScript`);
  console.log(`  3. Download up to 8 images to ${imagesDir}/image-1.png through image-8.png`);
  console.log(`  4. Update metadata.json with image inventory\n`);

  // Update metadata
  const images = fs.readdirSync(imagesDir)
    .filter(f => f.startsWith('image-') && f.endsWith('.png'))
    .sort();

  const imageInventory = {
    totalImages: images.length,
    logoFirst: hasLogo,
    images: images.map((img, idx) => ({
      filename: img,
      path: path.join('events', generateBrandSlug(event.brand), `event-${event.id}`, 'images', img),
      order: idx,
      isLogo: idx === 0 && hasLogo
    }))
  };

  // Load or create metadata
  let metadata = {};
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  } else {
    metadata = {
      eventId: event.id,
      brand: event.brand,
      title: event.title,
      createdAt: new Date().toISOString()
    };
  }

  metadata.imageInventory = imageInventory;
  metadata.updatedAt = new Date().toISOString();

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`  ✓ Metadata updated (${images.length} images tracked)`);

  return imageInventory;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('Event Image Collection Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/collect-event-images.js --event <id>');
    console.log('  node scripts/collect-event-images.js --all');
    console.log('  node scripts/collect-event-images.js --range <start-end>');
    console.log('');
    console.log('This script helps organize images for Masonry grid display:');
    console.log('  - Copies logo as first image (image-0.png)');
    console.log('  - Provides instructions for collecting promotional images');
    console.log('  - Updates metadata with image inventory');
    console.log('');
    console.log('Images should be collected using Playwright MCP:');
    console.log('  1. Navigate to event URL');
    console.log('  2. Extract image URLs with JavaScript');
    console.log('  3. Download up to 8 promotional images');
    console.log('');
    return;
  }

  const command = args[0];
  const events = loadEventsData();

  switch (command) {
    case '--event': {
      if (!args[1]) {
        console.error('Error: --event requires <id>');
        process.exit(1);
      }
      const eventId = parseInt(args[1]);
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error(`Event ${eventId} not found`);
        process.exit(1);
      }
      await organizeEventImages(event);
      break;
    }

    case '--range': {
      if (!args[1]) {
        console.error('Error: --range requires <start-end>');
        process.exit(1);
      }
      const [start, end] = args[1].split('-').map(n => parseInt(n));
      const rangeEvents = events.filter(e => e.id >= start && e.id <= end);

      console.log(`Processing ${rangeEvents.length} events (${start}-${end})...\n`);
      for (const event of rangeEvents) {
        await organizeEventImages(event);
        console.log('');
      }
      break;
    }

    case '--all': {
      console.log(`Processing all ${events.length} events...\n`);
      for (const event of events) {
        await organizeEventImages(event);
        console.log('');
      }
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

module.exports = {
  organizeEventImages,
  extractImageUrlsFromPage
};
