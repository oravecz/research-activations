import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

const DETAILS_PATH = './public/events/details.json';
const MAX_IMAGES_PER_EVENT = 9; // Logo + 8 promotional images

// Helper: Calculate image hash for duplicate detection
async function calculateImageHash(imagePath) {
  try {
    const buffer = await fs.readFile(imagePath);
    return createHash('md5').update(buffer).digest('hex');
  } catch (error) {
    console.error(`Error calculating hash for ${imagePath}:`, error.message);
    return null;
  }
}

// Helper: Get existing images and their hashes
async function getExistingImages(imagesDir) {
  const existingHashes = new Set();
  const existingImages = [];

  try {
    const files = await fs.readdir(imagesDir);
    for (const file of files) {
      if (file.match(/^image-\d+\.(png|jpg|jpeg|webp)$/i)) {
        const imagePath = path.join(imagesDir, file);
        const hash = await calculateImageHash(imagePath);
        if (hash) {
          existingHashes.add(hash);
          existingImages.push({
            path: imagePath.replace('./public/', ''),
            order: parseInt(file.match(/\d+/)[0]),
            isLogo: file === 'image-0.png' || file === 'image-0.jpg'
          });
        }
      }
    }
    existingImages.sort((a, b) => a.order - b.order);
  } catch (error) {
    // Directory doesn't exist yet
  }

  return { existingHashes, existingImages };
}

// Generate search queries for brand activation
function generateSearchQueries(event) {
  const queries = [];

  // Primary query: exact event title with brand
  queries.push(`${event.brand} ${event.title}`);

  // Secondary: brand + location + year
  if (event.location && event.date) {
    const year = event.date.match(/\d{4}/)?.[0];
    if (year) {
      queries.push(`${event.brand} ${event.location} ${year} activation`);
    }
  }

  // Tertiary: brand + key activation terms
  const activationKeywords = event.activation
    .toLowerCase()
    .match(/\b(workshop|pop-up|installation|experience|event|series|program|collaboration)\b/g);

  if (activationKeywords && activationKeywords.length > 0) {
    queries.push(`${event.brand} ${activationKeywords[0]} ${event.category}`);
  }

  return queries.slice(0, 2); // Limit to 2 search queries per event
}

// Instructions for manual Playwright operation
function printPlaywrightInstructions(event, queries) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`EVENT ${event.id}: ${event.brand} - ${event.title}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nCurrent image count: ${event.imageInventory?.totalImages || 1}`);
  console.log(`Target: ${MAX_IMAGES_PER_EVENT} images\n`);

  console.log(`📋 PLAYWRIGHT MCP WORKFLOW:\n`);

  console.log(`1. Navigate to event URL:`);
  console.log(`   browser_navigate: ${event.url}\n`);

  console.log(`2. Take snapshot to see page structure:`);
  console.log(`   browser_snapshot\n`);

  console.log(`3. Extract image URLs using JavaScript:`);
  console.log(`   browser_evaluate with function:`);
  console.log(`   () => {`);
  console.log(`     const images = Array.from(document.querySelectorAll('img'));`);
  console.log(`     return images`);
  console.log(`       .filter(img => {`);
  console.log(`         const src = img.src || '';`);
  console.log(`         const width = img.naturalWidth || img.width;`);
  console.log(`         const height = img.naturalHeight || img.height;`);
  console.log(`         // Filter: min 400px width, exclude icons/logos/tracking`);
  console.log(`         return width >= 400 && height >= 300 &&`);
  console.log(`           !src.includes('icon') &&`);
  console.log(`           !src.includes('logo') &&`);
  console.log(`           !src.includes('sprite') &&`);
  console.log(`           !src.includes('pixel');`);
  console.log(`       })`);
  console.log(`       .map(img => ({`);
  console.log(`         src: img.src,`);
  console.log(`         alt: img.alt,`);
  console.log(`         width: img.naturalWidth || img.width,`);
  console.log(`         height: img.naturalHeight || img.height`);
  console.log(`       }))`);
  console.log(`       .slice(0, ${MAX_IMAGES_PER_EVENT - 1});`);
  console.log(`   }\n`);

  console.log(`4. Download images using curl/wget to:`);
  const eventDir = path.join('./public/events', event.brand.toLowerCase().replace(/\s+/g, '-'), `event-${event.id}`, 'images');
  console.log(`   ${eventDir}/image-N.png\n`);

  if (queries.length > 0) {
    console.log(`5. If insufficient images, perform web searches:\n`);
    queries.forEach((query, i) => {
      console.log(`   Search ${i + 1}: "${query}"`);
      console.log(`   - Look for promotional photos, event coverage, press releases`);
      console.log(`   - Download high-quality images related to the activation\n`);
    });
  }

  console.log(`6. Run duplicate detection:`);
  console.log(`   node scripts/remove-duplicates.js ${event.id}\n`);

  console.log(`7. Update inventory:`);
  console.log(`   node scripts/update-image-inventory.js ${event.id}\n`);
}

// Main
async function main() {
  const eventId = process.argv[2];

  // Load events data
  const data = JSON.parse(await fs.readFile(DETAILS_PATH, 'utf8'));
  const events = data.events;

  if (eventId) {
    // Single event mode
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) {
      console.error(`Event ${eventId} not found`);
      process.exit(1);
    }

    const queries = generateSearchQueries(event);
    printPlaywrightInstructions(event, queries);
  } else {
    // All events mode - show summary
    console.log(`\n${'='.repeat(80)}`);
    console.log(`EVENTS NEEDING MORE IMAGES (< ${MAX_IMAGES_PER_EVENT} images)`);
    console.log(`${'='.repeat(80)}\n`);

    const needsImages = events.filter(e => (e.imageInventory?.totalImages || 1) < MAX_IMAGES_PER_EVENT);

    needsImages.forEach(event => {
      const currentCount = event.imageInventory?.totalImages || 1;
      const needed = MAX_IMAGES_PER_EVENT - currentCount;
      console.log(`Event ${event.id}: ${event.brand} - ${event.title}`);
      console.log(`  Current: ${currentCount} images | Need: ${needed} more images`);
      console.log(`  URL: ${event.url}`);
      console.log('');
    });

    console.log(`\nTotal events needing images: ${needsImages.length}`);
    console.log(`\nTo process a specific event, run:`);
    console.log(`  node scripts/scrape-with-playwright.js <event-id>`);
  }
}

main().catch(console.error);
