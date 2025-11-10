#!/usr/bin/env node

/**
 * Collect Images with Playwright
 *
 * This script uses Playwright MCP to:
 * 1. Navigate to each event URL
 * 2. Extract brand logo (or download from clearbit/brandfetch)
 * 3. Find and download 8 best promotional images
 * 4. Save to events/[brand]/event-[id]/images/
 * 5. Update imageInventory in events/details.json
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

// Load events
const eventsData = JSON.parse(fs.readFileSync('events/details.json', 'utf-8'));
const events = eventsData.events;

/**
 * Download an image from a URL
 */
async function downloadImage(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(imageUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(outputPath);

    protocol.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(outputPath);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * Try to download logo from Clearbit or Brandfetch
 */
async function downloadBrandLogo(brandName, eventId) {
  const brandSlug = brandName.toLowerCase().replace(/\s+/g, '-');
  const domain = brandName.toLowerCase().replace(/\s+/g, '') + '.com';
  const logoPath = `events/${brandSlug}/event-${eventId}/images/image-0.png`;

  // Try Clearbit first
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;

  try {
    console.log(`  Trying Clearbit for ${brandName}...`);
    await downloadImage(clearbitUrl, logoPath);
    console.log(`  ✓ Downloaded logo from Clearbit`);
    return logoPath;
  } catch (error) {
    console.log(`  ✗ Clearbit failed: ${error.message}`);
  }

  // Try Brandfetch
  try {
    console.log(`  Trying Brandfetch API for ${brandName}...`);
    // Note: This requires manual lookup - Brandfetch API needs authentication
    console.log(`  → Manual fallback needed for ${brandName}`);
    return null;
  } catch (error) {
    console.log(`  ✗ Brandfetch failed: ${error.message}`);
    return null;
  }
}

/**
 * Process a single event with Playwright
 *
 * MANUAL STEP REQUIRED:
 * This function provides instructions for using Playwright MCP tools manually.
 * The MCP tools (mcp__playwright__*) must be called from the main conversation.
 */
function getPlaywrightInstructions(event) {
  const brandSlug = event.brand.toLowerCase().replace(/\s+/g, '-');
  const imagesDir = `events/${brandSlug}/event-${event.id}/images`;

  return {
    eventId: event.id,
    brand: event.brand,
    title: event.title,
    url: event.url,
    imagesDir,
    steps: [
      `1. Navigate to: ${event.url}`,
      `2. Take snapshot to see page structure`,
      `3. Identify 8-10 best promotional images (product photos, store interior, customers, events)`,
      `4. For each image, extract the src URL`,
      `5. Download images to: ${imagesDir}/image-1.png through image-8.png`,
      `6. Try to download logo to: ${imagesDir}/image-0.png`,
      `7. If logo download fails, use Clearbit: https://logo.clearbit.com/${event.brand.toLowerCase().replace(/\s+/g, '')}.com`
    ],
    imageSelection: [
      '- Hero/banner images (high quality, prominent)',
      '- Store interior/exterior photos',
      '- Product displays and merchandising',
      '- Customer experience shots',
      '- Event/activation photos',
      '- Brand messaging visuals',
      '- Avoid: tiny thumbnails, icons, social media buttons'
    ]
  };
}

/**
 * Create directory structure for an event
 */
function createEventDirectories(event) {
  const brandSlug = event.brand.toLowerCase().replace(/\s+/g, '-');
  const eventDir = `events/${brandSlug}/event-${event.id}`;
  const imagesDir = path.join(eventDir, 'images');

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`  Created: ${imagesDir}`);
  }

  return { eventDir, imagesDir };
}

/**
 * Update imageInventory for an event
 */
function updateImageInventory(eventId) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  const brandSlug = event.brand.toLowerCase().replace(/\s+/g, '-');
  const imagesDir = `events/${brandSlug}/event-${event.id}/images`;

  // Find all images
  const imageFiles = fs.existsSync(imagesDir)
    ? fs.readdirSync(imagesDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i)).sort()
    : [];

  const images = imageFiles.map((file, index) => ({
    path: `${imagesDir}/${file}`,
    order: index,
    isLogo: file === 'image-0.png' || file.includes('logo')
  }));

  event.imageInventory = {
    totalImages: images.length,
    logoFirst: images.length > 0 && images[0].isLogo,
    images
  };

  // Update events data
  fs.writeFileSync('events/details.json', JSON.stringify(eventsData, null, 2));
  console.log(`  ✓ Updated imageInventory for event ${eventId}`);
}

/**
 * Main execution
 */
async function main() {
  const mode = process.argv[2] || 'instructions';
  const eventId = process.argv[3] ? parseInt(process.argv[3]) : null;

  if (mode === 'instructions') {
    console.log('='.repeat(80));
    console.log('PLAYWRIGHT IMAGE COLLECTION - INSTRUCTIONS');
    console.log('='.repeat(80));
    console.log('');
    console.log('This script helps organize the manual Playwright image collection process.');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/collect-images-playwright.js instructions [event-id]');
    console.log('  node scripts/collect-images-playwright.js setup [event-id]');
    console.log('  node scripts/collect-images-playwright.js update-inventory [event-id]');
    console.log('  node scripts/collect-images-playwright.js download-logo [event-id]');
    console.log('');

    if (eventId) {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error(`Event ${eventId} not found`);
        process.exit(1);
      }

      const instructions = getPlaywrightInstructions(event);
      console.log(`Event [${instructions.eventId}]: ${instructions.brand} - ${instructions.title}`);
      console.log('');
      console.log('STEPS:');
      instructions.steps.forEach(step => console.log(step));
      console.log('');
      console.log('IMAGE SELECTION CRITERIA:');
      instructions.imageSelection.forEach(criteria => console.log(criteria));
      console.log('');
      console.log('OUTPUT DIRECTORY:');
      console.log(`  ${instructions.imagesDir}/`);
      console.log('');
    } else {
      console.log('All 50 events ready for image collection:');
      console.log('');
      events.forEach(event => {
        const brandSlug = event.brand.toLowerCase().replace(/\s+/g, '-');
        const imagesDir = `events/${brandSlug}/event-${event.id}/images`;
        const hasImages = fs.existsSync(imagesDir) && fs.readdirSync(imagesDir).length > 0;
        const status = hasImages ? '✓' : ' ';
        console.log(`  [${status}] Event ${event.id}: ${event.brand} - ${event.title}`);
      });
      console.log('');
      console.log('To get instructions for a specific event:');
      console.log('  node scripts/collect-images-playwright.js instructions <event-id>');
    }
  }

  else if (mode === 'setup') {
    if (!eventId) {
      // Setup all events
      console.log('Creating directory structure for all 50 events...');
      events.forEach(event => {
        createEventDirectories(event);
      });
      console.log('✓ All event directories created');
    } else {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error(`Event ${eventId} not found`);
        process.exit(1);
      }
      createEventDirectories(event);
    }
  }

  else if (mode === 'update-inventory') {
    if (!eventId) {
      console.log('Updating imageInventory for all events with images...');
      events.forEach(event => {
        updateImageInventory(event.id);
      });
      console.log('✓ All inventories updated');
    } else {
      updateImageInventory(eventId);
    }
  }

  else if (mode === 'download-logo') {
    if (!eventId) {
      console.log('Downloading logos for all events...');
      for (const event of events) {
        console.log(`\n[${event.id}] ${event.brand}:`);
        await downloadBrandLogo(event.brand, event.id);
      }
      console.log('\n✓ Logo download complete');
    } else {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error(`Event ${eventId} not found`);
        process.exit(1);
      }
      console.log(`Downloading logo for ${event.brand}...`);
      await downloadBrandLogo(event.brand, event.id);
    }
  }

  else {
    console.error(`Unknown mode: ${mode}`);
    console.log('Valid modes: instructions, setup, update-inventory, download-logo');
    process.exit(1);
  }
}

main().catch(console.error);
