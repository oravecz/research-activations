#!/usr/bin/env node

/**
 * Playwright-based Image Downloader for Brand Activations
 *
 * This script uses Playwright MCP to:
 * 1. Search Google Images for relevant activation images
 * 2. Download unique, high-quality images
 * 3. Verify no duplicates using perceptual hashing
 *
 * Usage:
 *   node scripts/playwright-image-downloader.js <event-id>
 */

import fs from 'fs/promises';
import path from 'path';

const BASE_DIR = process.cwd();
const EVENTS_FILE = path.join(BASE_DIR, 'public/events/details.json');

/**
 * Generate optimized search queries for finding activation images
 */
function generateSearchQueries(event) {
  const { brand, title, activation, date, category } = event;
  const year = date.match(/20\d{2}/)?.[0] || '2024';

  // Primary queries - most specific
  const primary = [
    `${brand} ${title} activation photos`,
    `${brand} ${title} event images ${year}`,
  ];

  // Secondary queries - activation-specific
  const secondary = [];

  if (activation.toLowerCase().includes('workshop')) {
    secondary.push(`${brand} workshop retail experience`);
  }
  if (activation.toLowerCase().includes('sustainability') || activation.toLowerCase().includes('repair')) {
    secondary.push(`${brand} sustainability event`, `${brand} repair program`);
  }
  if (activation.toLowerCase().includes('community')) {
    secondary.push(`${brand} community event retail`);
  }
  if (activation.toLowerCase().includes('pop-up') || activation.toLowerCase().includes('popup')) {
    secondary.push(`${brand} pop-up shop ${year}`);
  }
  if (activation.toLowerCase().includes('experience')) {
    secondary.push(`${brand} retail experience center`);
  }

  // Tertiary queries - general brand retail
  const tertiary = [
    `${brand} store activation ${year}`,
    `${brand} retail marketing event`,
    `${brand} in-store experience`,
  ];

  return {
    primary,
    secondary: secondary.length > 0 ? secondary : [],
    tertiary,
    all: [...primary, ...secondary, ...tertiary]
  };
}

/**
 * Instructions for manual Playwright MCP image collection
 */
function generatePlaywrightInstructions(event, needed) {
  const queries = generateSearchQueries(event);
  const brandSlug = event.brand.toLowerCase().replace(/['\s]+/g, '-');
  const imagesDir = path.join('public/events', brandSlug, `event-${event.id}`, 'images');

  const instructions = `
═══════════════════════════════════════════════════════════════════════════════
PLAYWRIGHT IMAGE COLLECTION INSTRUCTIONS
Event ${event.id}: ${event.brand} - ${event.title}
Need ${needed} more images
═══════════════════════════════════════════════════════════════════════════════

📋 SEARCH QUERIES (Use in order of priority):

PRIMARY (Most specific):
${queries.primary.map((q, i) => `  ${i + 1}. "${q}"`).join('\n')}

${queries.secondary.length > 0 ? `SECONDARY (Activation-specific):
${queries.secondary.map((q, i) => `  ${i + 1}. "${q}"`).join('\n')}
` : ''}
TERTIARY (General retail):
${queries.tertiary.map((q, i) => `  ${i + 1}. "${q}"`).join('\n')}

───────────────────────────────────────────────────────────────────────────────
🔍 IMAGE SEARCH WORKFLOW:
───────────────────────────────────────────────────────────────────────────────

1. Start with PRIMARY queries first
2. For EACH query:
   a. Use browser_navigate to search Google Images:
      https://www.google.com/search?q=[QUERY]&tbm=isch

   b. Use browser_snapshot to see the image grid

   c. Use browser_evaluate to extract image URLs:

      () => {
        const images = [];
        // Get large image thumbnails
        document.querySelectorAll('img[src*="gstatic"]').forEach((img, i) => {
          if (i > 0 && i <= 20 && img.src && img.naturalWidth >= 300) {
            images.push({
              src: img.src,
              width: img.naturalWidth,
              height: img.naturalHeight,
              alt: img.alt || ''
            });
          }
        });
        return images;
      }

   d. Download ${needed} best images (high resolution, relevant alt text)
   e. Save to: ${imagesDir}/
   f. Name as: image-N.png (where N is next available number)

3. After downloading, verify relevance:
   - Images should show the actual activation/event
   - Images should feature the ${event.brand} brand
   - Avoid generic product photos or unrelated content

4. Run duplicate check:
   node scripts/enhanced-image-scraper.js ${event.id}

───────────────────────────────────────────────────────────────────────────────
📝 QUALITY CRITERIA:
───────────────────────────────────────────────────────────────────────────────

✅ GOOD:
  - Photos of actual in-store activations
  - Event setup/installation photos
  - Customer participation photos
  - Workshop/experience photos
  - Store-specific branded displays

❌ AVOID:
  - Generic product catalog photos
  - Unrelated brand content
  - Low resolution images (< 300px)
  - Images with watermarks
  - Stock photos
  - Logos only (already have logo as image-0)

───────────────────────────────────────────────────────────────────────────────
💾 DOWNLOAD EXAMPLE:
───────────────────────────────────────────────────────────────────────────────

For each good image found:
1. Right-click image URL from evaluate results
2. Download to temp location
3. Convert to PNG if needed
4. Move to: ${imagesDir}/image-[N].png
5. Or use fetch/download script with extracted URLs

═══════════════════════════════════════════════════════════════════════════════
`;

  return instructions;
}

async function main() {
  const args = process.argv.slice(2);
  const eventId = args[0] ? parseInt(args[0]) : null;

  if (!eventId) {
    console.error('Usage: node scripts/playwright-image-downloader.js <event-id>');
    process.exit(1);
  }

  // Load event data
  const eventsData = JSON.parse(await fs.readFile(EVENTS_FILE, 'utf-8'));
  const event = eventsData.events.find(e => e.id === eventId);

  if (!event) {
    console.error(`Event ${eventId} not found`);
    process.exit(1);
  }

  const brandSlug = event.brand.toLowerCase().replace(/['\s]+/g, '-');
  const imagesDir = path.join(BASE_DIR, 'public/events', brandSlug, `event-${event.id}`, 'images');

  // Count existing unique images
  let existingCount = 0;
  try {
    const files = await fs.readdir(imagesDir);
    existingCount = files.filter(f => /^image-\d+\.(png|jpe?g)$/i.test(f)).length;
  } catch (e) {
    console.error(`Images directory not found: ${imagesDir}`);
    process.exit(1);
  }

  const needed = Math.max(0, 9 - existingCount);
  if (needed === 0) {
    console.log(`✅ Event ${eventId} already has ${existingCount} images (target: 9)`);
    return;
  }

  console.log(generatePlaywrightInstructions(event, needed));

  // Save instructions to file
  const instructionsFile = path.join(imagesDir, 'DOWNLOAD_INSTRUCTIONS.md');
  await fs.writeFile(
    instructionsFile,
    generatePlaywrightInstructions(event, needed)
  );
  console.log(`\n📄 Instructions saved to: ${instructionsFile}`);
}

main().catch(console.error);
