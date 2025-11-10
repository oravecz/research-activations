#!/usr/bin/env node

/**
 * Automated Image Scraper for Brand Activation Events
 *
 * This script automatically:
 * 1. Reads events from details.json
 * 2. For each event needing images, generates search queries
 * 3. Provides image URLs to download
 * 4. You manually select the best images
 *
 * Usage:
 *   node scripts/auto-scrape-all-events.js
 */

import fs from 'fs/promises';
import path from 'path';

const DETAILS_PATH = './public/events/details.json';
const MAX_IMAGES = 9;

// Generate smart search queries for finding event images
function generateSearchQueries(event) {
  const queries = [];
  const year = event.date.match(/\d{4}/)?.[0] || '2024';

  // Query 1: Exact event title
  queries.push(`"${event.brand}" "${event.title}" ${year} photos`);

  // Query 2: Brand + activation type + location
  const activationType = event.title.match(/(pop-up|popup|activation|experience|event|store|flagship)/i)?.[0] || 'activation';
  queries.push(`${event.brand} ${activationType} ${event.location} images`);

  // Query 3: Brand + key terms from description
  const keyTerms = event.activation.match(/\b(installation|workshop|gallery|exhibit|showcase|launch|collaboration)\b/i)?.[0];
  if (keyTerms) {
    queries.push(`${event.brand} ${keyTerms} ${year} photos`);
  }

  return queries;
}

// Main processing function
async function main() {
  console.log('🔍 Automated Image Scraper for Brand Activations\n');
  console.log('=' .repeat(80) + '\n');

  // Load events
  const data = JSON.parse(await fs.readFile(DETAILS_PATH, 'utf8'));
  const events = data.events;

  // Filter events needing images
  const eventsNeedingImages = events.filter(e => {
    const currentCount = e.imageInventory?.totalImages || 1;
    return currentCount < MAX_IMAGES;
  });

  console.log(`Found ${eventsNeedingImages.length} events needing images:\n`);

  // Process each event
  for (const event of eventsNeedingImages) {
    const currentCount = event.imageInventory?.totalImages || 1;
    const needed = MAX_IMAGES - currentCount;

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📸 EVENT ${event.id}: ${event.brand} - ${event.title}`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`Current: ${currentCount} images | Need: ${needed} more\n`);

    // Generate search queries
    const queries = generateSearchQueries(event);

    console.log(`🔎 Recommended Web Searches:\n`);
    queries.forEach((query, i) => {
      console.log(`   ${i + 1}. ${query}`);
    });

    console.log(`\n💡 Manual Steps:`);
    console.log(`   1. Use WebSearch or Google Images with the queries above`);
    console.log(`   2. Find ${needed} high-quality images (min 400x300px)`);
    console.log(`   3. Download images to: public/events/${event.brand.toLowerCase().replace(/\s+/g, '-')}/event-${event.id}/images/`);
    console.log(`   4. Name them: image-${currentCount}.jpg, image-${currentCount + 1}.jpg, etc.`);
    console.log(`\n   Or use this download helper:\n`);
    console.log(`   # Create a text file with image URLs (one per line)`);
    console.log(`   echo "https://example.com/image1.jpg" > /tmp/event-${event.id}-urls.txt`);
    console.log(`   echo "https://example.com/image2.jpg" >> /tmp/event-${event.id}-urls.txt`);
    console.log(`   `);
    console.log(`   # Then run the batch downloader:`);
    console.log(`   node scripts/batch-download.js ${event.id} /tmp/event-${event.id}-urls.txt`);

    console.log(`\n📋 Quick Reference:`);
    console.log(`   Event URL: ${event.url}`);
    console.log(`   Category: ${event.category}`);
    console.log(`   Date: ${event.date}`);
  }

  console.log(`\n${'═'.repeat(80)}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total events needing images: ${eventsNeedingImages.length}`);
  console.log(`   Total images needed: ${eventsNeedingImages.reduce((sum, e) => sum + (MAX_IMAGES - (e.imageInventory?.totalImages || 1)), 0)}`);
  console.log(`\n✅ Next Steps:`);
  console.log(`   1. Use the search queries above to find images`);
  console.log(`   2. Download images manually or use batch-download.js`);
  console.log(`   3. Run: node scripts/remove-duplicates.js <event-id>`);
  console.log(`   4. Run: node scripts/update-image-inventory.js all`);
  console.log(`\n`);
}

main().catch(console.error);
