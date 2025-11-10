#!/usr/bin/env node

/**
 * Google Images Scraper with Playwright MCP Integration
 *
 * This script generates Google Images search URLs with num parameter
 * and provides step-by-step instructions for automated image collection
 *
 * Usage: node scripts/google-image-scraper.js <event-id>
 */

import fs from 'fs/promises';
import path from 'path';

const BASE_DIR = process.cwd();
const EVENTS_FILE = path.join(BASE_DIR, 'public/events/details.json');

/**
 * Generate optimized search queries for finding activation images
 */
function generateSearchQueries(event) {
  const { brand, title, activation, date } = event;
  const year = date.match(/20\d{2}/)?.[0] || '2024';

  const queries = [];

  // Primary - most specific
  queries.push({
    priority: 'PRIMARY',
    query: `${brand} ${title.substring(0, 50)}`,
    description: 'Most specific - event title'
  });

  // Activation type specific
  if (activation.toLowerCase().includes('workshop')) {
    queries.push({
      priority: 'HIGH',
      query: `${brand} workshop store experience`,
      description: 'Workshop activation photos'
    });
  }

  if (activation.toLowerCase().includes('pop-up') || activation.toLowerCase().includes('popup')) {
    queries.push({
      priority: 'HIGH',
      query: `${brand} pop-up shop ${year}`,
      description: 'Pop-up event photos'
    });
  }

  if (activation.toLowerCase().includes('sustainability') || activation.toLowerCase().includes('repair')) {
    queries.push({
      priority: 'HIGH',
      query: `${brand} sustainability event repair`,
      description: 'Sustainability program photos'
    });
  }

  if (activation.toLowerCase().includes('community')) {
    queries.push({
      priority: 'HIGH',
      query: `${brand} community event store`,
      description: 'Community event photos'
    });
  }

  // General activation queries
  queries.push({
    priority: 'MEDIUM',
    query: `${brand} store activation ${year}`,
    description: 'General store activation'
  });

  queries.push({
    priority: 'MEDIUM',
    query: `${brand} retail experience in-store`,
    description: 'Retail experience photos'
  });

  queries.push({
    priority: 'LOW',
    query: `${brand} experiential retail marketing`,
    description: 'Experiential marketing'
  });

  return queries;
}

/**
 * Create Google Images URL with num parameter
 */
function createGoogleImagesURL(query, numResults = 20) {
  const encodedQuery = encodeURIComponent(query);
  return `https://www.google.com/search?q=${encodedQuery}&tbm=isch&num=${numResults}`;
}

/**
 * Generate complete workflow instructions
 */
async function generateWorkflow(eventId) {
  // Load event data
  const eventsData = JSON.parse(await fs.readFile(EVENTS_FILE, 'utf-8'));
  const event = eventsData.events.find(e => e.id === eventId);

  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  const brandSlug = event.brand.toLowerCase().replace(/['\s]+/g, '-');
  const imagesDir = path.join('public/events', brandSlug, `event-${event.id}`, 'images');

  // Count existing images
  let existingCount = 0;
  try {
    const files = await fs.readdir(path.join(BASE_DIR, imagesDir));
    existingCount = files.filter(f => /^image-\d+\.(png|jpe?g)$/i.test(f)).length;
  } catch (e) {
    console.error(`⚠️  Images directory not found: ${imagesDir}`);
  }

  const needed = Math.max(0, 9 - existingCount);
  const queries = generateSearchQueries(event);

  console.log(`
${'='.repeat(80)}
GOOGLE IMAGES SCRAPING WORKFLOW
Event ${event.id}: ${event.brand} - ${event.title}
${'='.repeat(80)}

📊 STATUS:
  - Current images: ${existingCount}
  - Target: 9 images
  - Need: ${needed} more images

${'='.repeat(80)}
🔍 SEARCH QUERIES (${queries.length} queries generated)
${'='.repeat(80)}
`);

  queries.forEach((q, i) => {
    const url = createGoogleImagesURL(q.query, 20);
    console.log(`
${i + 1}. [${q.priority}] ${q.description}
   Query: "${q.query}"
   URL: ${url}
`);
  });

  console.log(`
${'='.repeat(80)}
🤖 PLAYWRIGHT MCP WORKFLOW
${'='.repeat(80)}

For EACH search URL above, follow these steps:

STEP 1: Navigate to Google Images
────────────────────────────────────────────────────────────────────────────
Use: browser_navigate
URL: [Copy URL from above]

Example:
  await page.goto('${createGoogleImagesURL(queries[0].query, 20)}');


STEP 2: Extract Image URLs
────────────────────────────────────────────────────────────────────────────
Use: browser_evaluate

Execute this JavaScript to extract high-quality image URLs:

() => {
  const images = [];

  // Method 1: Get images from search results
  document.querySelectorAll('img[src]').forEach((img) => {
    const src = img.src;
    // Skip small icons, base64, and google UI elements
    if (src &&
        !src.includes('data:image') &&
        !src.includes('gstatic') &&
        !src.includes('google') &&
        img.naturalWidth >= 200) {
      images.push({
        url: src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        alt: img.alt || ''
      });
    }
  });

  // Method 2: Check for high-res image links
  document.querySelectorAll('a[href*="imgurl"]').forEach((link) => {
    const url = new URL(link.href);
    const imgurl = url.searchParams.get('imgurl');
    if (imgurl) {
      images.push({
        url: imgurl,
        width: 'unknown',
        height: 'unknown',
        alt: link.title || ''
      });
    }
  });

  // Remove duplicates and return top 10
  const unique = [...new Map(images.map(img => [img.url, img])).values()];
  return unique.slice(0, 10);
}

This will return an array of image objects with URLs.


STEP 3: Save URLs to File
────────────────────────────────────────────────────────────────────────────
Copy the extracted URLs and save them to a text file:

  ${imagesDir}/urls-query-${queries[0].priority.toLowerCase()}.txt

One URL per line.


STEP 4: Download Images
────────────────────────────────────────────────────────────────────────────
Use the auto-download script:

  node scripts/auto-download-images.js ${eventId} ${imagesDir}/urls-query-${queries[0].priority.toLowerCase()}.txt

The script will:
  ✓ Download each image
  ✓ Convert to PNG format
  ✓ Check for duplicates automatically
  ✓ Save with sequential numbering


STEP 5: Verify Results
────────────────────────────────────────────────────────────────────────────
Check for duplicates and count:

  node scripts/enhanced-image-scraper.js ${eventId}

If you have 9 unique images, you're done! Otherwise, continue with next query.

${'='.repeat(80)}
💡 QUICK WORKFLOW EXAMPLE
${'='.repeat(80)}

# 1. Navigate to first Google Images search
browser_navigate("${createGoogleImagesURL(queries[0].query, 20)}")

# 2. Extract URLs
browser_evaluate("() => { /* paste extract code above */ }")

# 3. Copy URLs and download
echo "url1
url2
url3" > ${imagesDir}/urls.txt
node scripts/auto-download-images.js ${eventId} ${imagesDir}/urls.txt

# 4. Check progress
node scripts/enhanced-image-scraper.js ${eventId}

${'='.repeat(80)}
📝 IMAGE SELECTION CRITERIA
${'='.repeat(80)}

✅ PREFER:
  - In-store activation photos
  - Event setup/installation
  - Customer participation
  - Workshop/class photos
  - Store displays
  - Event signage
  - Multiple angles
  - High resolution

❌ AVOID:
  - Product catalog photos
  - Unrelated events
  - Low resolution
  - Watermarked images
  - Stock photos
  - Just logos
  - Other brands

${'='.repeat(80)}
🎯 SUCCESS METRICS
${'='.repeat(80)}

Target: ${needed} more unique, relevant images
Quality: High-resolution activation photos
Diversity: Different angles and aspects of the event
Relevance: Must show ${event.brand} ${event.title}

${'='.repeat(80)}
`);

  return queries.map(q => createGoogleImagesURL(q.query, 20));
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(`
Usage: node scripts/google-image-scraper.js <event-id>

Example:
  node scripts/google-image-scraper.js 22

This will generate:
  - Optimized Google Images search URLs (with num=20 parameter)
  - Complete Playwright MCP workflow
  - Image extraction JavaScript
  - Download and verification commands
`);
    process.exit(1);
  }

  const eventId = parseInt(args[0]);
  await generateWorkflow(eventId);
}

main().catch(console.error);
