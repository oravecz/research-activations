#!/usr/bin/env node

/**
 * Visual Asset Processing Automation
 *
 * Automates Task Group 3: Visual Asset Creation
 * - Creates event directories
 * - Downloads brand logos
 * - Downloads promotional images
 * - Manages metadata
 * - Orchestrates screenshot capture and collage generation
 *
 * Usage:
 *   node scripts/process-visual-assets.js --setup-dirs
 *   node scripts/process-visual-assets.js --create-metadata
 *   node scripts/process-visual-assets.js --download-logos
 *   node scripts/process-visual-assets.js --download-images --range 1-25
 *   node scripts/process-visual-assets.js --download-images --range 26-50
 *   node scripts/process-visual-assets.js --generate-collages --range 1-25
 *   node scripts/process-visual-assets.js --generate-collages --range 26-50
 *   node scripts/process-visual-assets.js --update-inventory
 */

const fs = require('fs');
const path = require('path');

// Load events data
function loadEventsData() {
  const eventsPath = path.join(process.cwd(), 'events', 'details.json');
  if (!fs.existsSync(eventsPath)) {
    console.error('Error: events/details.json not found');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
  return data.events || [];
}

// Generate brand slug from brand name
function generateBrandSlug(brandName) {
  return brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Generate event directory path
function getEventDirectory(event) {
  const brandSlug = generateBrandSlug(event.brand);
  return path.join(process.cwd(), 'events', brandSlug, `event-${event.id}`);
}

// Task 3.1: Set up brand-specific event directories
function setupEventDirectories() {
  const events = loadEventsData();

  console.log('='.repeat(80));
  console.log('TASK 3.1: Setting up brand-specific event directories');
  console.log('='.repeat(80));
  console.log('');

  const results = [];

  for (const event of events) {
    const eventDir = getEventDirectory(event);

    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true });
      console.log(`[${event.id}] Created: ${eventDir}`);
      results.push({ event, created: true, path: eventDir });
    } else {
      console.log(`[${event.id}] Exists: ${eventDir}`);
      results.push({ event, created: false, path: eventDir });
    }
  }

  console.log('');
  console.log('Summary:');
  console.log(`  Total directories: ${results.length}`);
  console.log(`  Created: ${results.filter(r => r.created).length}`);
  console.log(`  Already existed: ${results.filter(r => !r.created).length}`);
  console.log('');

  return results;
}

// Initialize metadata.json in event directories
function createMetadataFiles() {
  const events = loadEventsData();

  console.log('='.repeat(80));
  console.log('TASK 3.1: Initializing metadata.json files');
  console.log('='.repeat(80));
  console.log('');

  const results = [];

  for (const event of events) {
    const eventDir = getEventDirectory(event);
    const metadataPath = path.join(eventDir, 'metadata.json');

    if (!fs.existsSync(eventDir)) {
      console.log(`[${event.id}] Skipping - directory not found: ${eventDir}`);
      continue;
    }

    const metadata = {
      eventId: event.id,
      brand: event.brand,
      title: event.title,
      sourceUrl: event.url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assets: {
        logo: {
          filename: 'logo.png',
          sourceUrl: null,
          fetchedAt: null,
          status: 'pending'
        },
        promotionalImages: [],
        screenshot: {
          filename: 'screenshot.png',
          sourceUrl: event.url,
          capturedAt: null,
          status: 'pending'
        },
        collage: {
          filename: 'slide-image.png',
          generatedAt: null,
          status: 'pending'
        }
      },
      notes: []
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`[${event.id}] Created metadata: ${metadataPath}`);
    results.push({ event, metadataPath });
  }

  console.log('');
  console.log(`Total metadata files created: ${results.length}`);
  console.log('');

  return results;
}

// Generate download plan for brand logos
function generateLogoDownloadPlan() {
  const events = loadEventsData();

  console.log('='.repeat(80));
  console.log('TASK 3.2: Brand Logo Download Plan');
  console.log('='.repeat(80));
  console.log('');

  const logoPlans = [];
  const uniqueBrands = new Map();

  for (const event of events) {
    if (!uniqueBrands.has(event.brand)) {
      uniqueBrands.set(event.brand, []);
    }
    uniqueBrands.get(event.brand).push(event);
  }

  console.log(`Total events: ${events.length}`);
  console.log(`Unique brands: ${uniqueBrands.size}`);
  console.log('');
  console.log('Brand Logo Sources:');
  console.log('');

  for (const [brand, brandEvents] of uniqueBrands.entries()) {
    const brandSlug = generateBrandSlug(brand);
    const sampleEvent = brandEvents[0];
    const eventDir = getEventDirectory(sampleEvent);
    const logoPath = path.join(eventDir, 'logo.png');

    // Generate suggested logo source URLs
    const logoSources = [
      `https://logo.clearbit.com/${brandSlug}.com`,
      `https://www.${brandSlug}.com/logo.png`,
      `https://www.${brandSlug}.com/assets/logo.png`,
      `https://brandfetch.com/${brandSlug}`,
      `Manual search: "${brand} logo transparent PNG high resolution"`
    ];

    console.log(`${brand} (${brandEvents.length} events):`);
    console.log(`  Slug: ${brandSlug}`);
    console.log(`  Sample destination: ${logoPath}`);
    console.log(`  Suggested sources:`);
    logoSources.forEach(src => console.log(`    - ${src}`));
    console.log('');

    logoPlans.push({
      brand,
      brandSlug,
      eventCount: brandEvents.length,
      events: brandEvents,
      logoSources,
      destinations: brandEvents.map(e => path.join(getEventDirectory(e), 'logo.png'))
    });
  }

  // Save plan to file
  const planPath = path.join(process.cwd(), 'scripts', 'logo-download-plan.json');
  fs.writeFileSync(planPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalBrands: uniqueBrands.size,
    totalEvents: events.length,
    brands: logoPlans
  }, null, 2));

  console.log('='.repeat(80));
  console.log(`Logo download plan saved to: ${planPath}`);
  console.log('');
  console.log('Next Steps:');
  console.log('1. Download logos for each brand from suggested sources');
  console.log('2. Save each logo as PNG format');
  console.log('3. Copy logo to all event directories for that brand');
  console.log('4. Update metadata.json with source URL and fetch timestamp');
  console.log('');

  return logoPlans;
}

// Generate promotional image download plan
function generatePromoImagePlan(startId, endId) {
  const events = loadEventsData();
  const filteredEvents = events.filter(e => e.id >= startId && e.id <= endId);

  console.log('='.repeat(80));
  console.log(`TASK 3.3/3.4: Promotional Images Download Plan (Events ${startId}-${endId})`);
  console.log('='.repeat(80));
  console.log('');

  const plans = [];

  for (const event of filteredEvents) {
    const eventDir = getEventDirectory(event);

    console.log(`[${event.id}] ${event.brand} - ${event.title}`);
    console.log(`  Event URL: ${event.url}`);
    console.log(`  Directory: ${eventDir}`);
    console.log(`  Target: 3-5 promotional images`);
    console.log(`  Destinations: promo-1.jpg, promo-2.jpg, promo-3.jpg, etc.`);
    console.log('');

    plans.push({
      eventId: event.id,
      brand: event.brand,
      title: event.title,
      sourceUrl: event.url,
      eventDir,
      targetImages: '3-5',
      imageFormat: 'jpg',
      filePattern: 'promo-{n}.jpg'
    });
  }

  const planPath = path.join(process.cwd(), 'scripts', `promo-images-plan-${startId}-${endId}.json`);
  fs.writeFileSync(planPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    eventRange: `${startId}-${endId}`,
    totalEvents: plans.length,
    events: plans
  }, null, 2));

  console.log('='.repeat(80));
  console.log(`Promotional images plan saved to: ${planPath}`);
  console.log('');
  console.log('Manual Download Process:');
  console.log('1. Visit each event URL');
  console.log('2. Right-click and save 3-5 high-quality promotional images');
  console.log('3. Save to event directory as promo-1.jpg, promo-2.jpg, etc.');
  console.log('4. Update metadata.json with image sources and timestamps');
  console.log('5. Verify image quality is suitable for collages');
  console.log('');

  return plans;
}

// Generate screenshot capture plan
function generateScreenshotPlan() {
  const events = loadEventsData();

  console.log('='.repeat(80));
  console.log('TASK 3.5: Screenshot Capture Plan (Supplemental)');
  console.log('='.repeat(80));
  console.log('');
  console.log('This plan identifies events that may need screenshots as fallback');
  console.log('if promotional images are unsatisfactory.');
  console.log('');

  const plans = [];

  for (const event of events) {
    const eventDir = getEventDirectory(event);
    const screenshotPath = path.join(eventDir, 'screenshot.png');

    plans.push({
      eventId: event.id,
      brand: event.brand,
      title: event.title,
      url: event.url,
      screenshotPath,
      dimensions: '768x1024',
      format: 'png'
    });
  }

  // Save to file for reference by capture-screenshot.js
  const planPath = path.join(process.cwd(), 'scripts', 'screenshot-capture-plan.json');
  fs.writeFileSync(planPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalEvents: plans.length,
    dimensions: { width: 768, height: 1024 },
    captures: plans
  }, null, 2));

  console.log(`Screenshot plan saved to: ${planPath}`);
  console.log('');
  console.log('Use capture-screenshot.js with this plan:');
  console.log('  node scripts/capture-screenshot.js --batch events/details.json');
  console.log('');
  console.log('Screenshots will be used as fallback when:');
  console.log('  - Promotional images are low quality');
  console.log('  - Insufficient promotional images found');
  console.log('  - Event imagery not available');
  console.log('');

  return plans;
}

// Update asset inventory in events/details.json
function updateAssetInventory() {
  const eventsPath = path.join(process.cwd(), 'events', 'details.json');
  const data = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
  const events = data.events || [];

  console.log('='.repeat(80));
  console.log('TASK 3.8: Updating Asset Inventory in events/details.json');
  console.log('='.repeat(80));
  console.log('');

  let updatedCount = 0;

  for (const event of events) {
    const eventDir = getEventDirectory(event);
    const metadataPath = path.join(eventDir, 'metadata.json');

    // Scan for available assets
    const assets = {
      logo: fs.existsSync(path.join(eventDir, 'logo.png')),
      promotionalImages: [],
      screenshot: fs.existsSync(path.join(eventDir, 'screenshot.png')),
      collage: fs.existsSync(path.join(eventDir, 'slide-image.png'))
    };

    // Find promotional images
    for (let i = 1; i <= 10; i++) {
      const promoPath = path.join(eventDir, `promo-${i}.jpg`);
      if (fs.existsSync(promoPath)) {
        assets.promotionalImages.push(`promo-${i}.jpg`);
      }
    }

    // Load metadata if it exists
    let metadata = null;
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    }

    // Add asset inventory to event
    event.assetInventory = {
      hasLogo: assets.logo,
      logoPath: assets.logo ? `events/${generateBrandSlug(event.brand)}/event-${event.id}/logo.png` : null,
      promotionalImageCount: assets.promotionalImages.length,
      promotionalImages: assets.promotionalImages.map(img =>
        `events/${generateBrandSlug(event.brand)}/event-${event.id}/${img}`
      ),
      hasScreenshot: assets.screenshot,
      screenshotPath: assets.screenshot ? `events/${generateBrandSlug(event.brand)}/event-${event.id}/screenshot.png` : null,
      hasCollage: assets.collage,
      collagePath: assets.collage ? `events/${generateBrandSlug(event.brand)}/event-${event.id}/slide-image.png` : null,
      metadataAvailable: metadata !== null,
      lastUpdated: new Date().toISOString()
    };

    updatedCount++;

    const status = assets.collage ? '✓' :
                   assets.logo ? '◐' : '○';
    console.log(`[${event.id}] ${status} ${event.brand} - Logo: ${assets.logo}, Images: ${assets.promotionalImages.length}, Screenshot: ${assets.screenshot}, Collage: ${assets.collage}`);
  }

  // Save updated events data
  data.metadata.lastUpdated = new Date().toISOString();
  fs.writeFileSync(eventsPath, JSON.stringify(data, null, 2));

  console.log('');
  console.log(`Updated ${updatedCount} events in events/details.json`);
  console.log('');

  // Generate summary statistics
  const stats = {
    totalEvents: events.length,
    withLogo: events.filter(e => e.assetInventory?.hasLogo).length,
    withPromoImages: events.filter(e => e.assetInventory?.promotionalImageCount > 0).length,
    withScreenshot: events.filter(e => e.assetInventory?.hasScreenshot).length,
    withCollage: events.filter(e => e.assetInventory?.hasCollage).length,
    complete: events.filter(e => e.assetInventory?.hasCollage).length
  };

  console.log('Asset Inventory Summary:');
  console.log(`  Total events: ${stats.totalEvents}`);
  console.log(`  With logo: ${stats.withLogo} (${Math.round(stats.withLogo/stats.totalEvents*100)}%)`);
  console.log(`  With promotional images: ${stats.withPromoImages} (${Math.round(stats.withPromoImages/stats.totalEvents*100)}%)`);
  console.log(`  With screenshot: ${stats.withScreenshot} (${Math.round(stats.withScreenshot/stats.totalEvents*100)}%)`);
  console.log(`  With collage: ${stats.withCollage} (${Math.round(stats.withCollage/stats.totalEvents*100)}%)`);
  console.log(`  Complete (has collage): ${stats.complete} / ${stats.totalEvents}`);
  console.log('');

  return stats;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('Visual Asset Processing Automation');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/process-visual-assets.js --setup-dirs');
    console.log('  node scripts/process-visual-assets.js --create-metadata');
    console.log('  node scripts/process-visual-assets.js --plan-logos');
    console.log('  node scripts/process-visual-assets.js --plan-images --range 1-25');
    console.log('  node scripts/process-visual-assets.js --plan-images --range 26-50');
    console.log('  node scripts/process-visual-assets.js --plan-screenshots');
    console.log('  node scripts/process-visual-assets.js --update-inventory');
    console.log('');
    console.log('Commands:');
    console.log('  --setup-dirs          Create event directories for all 50 events (Task 3.1)');
    console.log('  --create-metadata     Initialize metadata.json in each directory (Task 3.1)');
    console.log('  --plan-logos          Generate brand logo download plan (Task 3.2)');
    console.log('  --plan-images         Generate promo images download plan (Task 3.3/3.4)');
    console.log('  --plan-screenshots    Generate screenshot capture plan (Task 3.5)');
    console.log('  --update-inventory    Update asset inventory in events/details.json (Task 3.8)');
    console.log('');
    console.log('Options:');
    console.log('  --range <start-end>   Event ID range (e.g., 1-25, 26-50)');
    console.log('');
    return;
  }

  const command = args[0];

  switch (command) {
    case '--setup-dirs':
      setupEventDirectories();
      break;

    case '--create-metadata':
      createMetadataFiles();
      break;

    case '--plan-logos':
      generateLogoDownloadPlan();
      break;

    case '--plan-images': {
      const rangeIndex = args.indexOf('--range');
      if (rangeIndex === -1) {
        console.error('Error: --range is required (e.g., --range 1-25)');
        process.exit(1);
      }
      const range = args[rangeIndex + 1];
      const [start, end] = range.split('-').map(n => parseInt(n));
      generatePromoImagePlan(start, end);
      break;
    }

    case '--plan-screenshots':
      generateScreenshotPlan();
      break;

    case '--update-inventory':
      updateAssetInventory();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run with --help for usage information');
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
  loadEventsData,
  generateBrandSlug,
  getEventDirectory,
  setupEventDirectories,
  createMetadataFiles,
  generateLogoDownloadPlan,
  generatePromoImagePlan,
  generateScreenshotPlan,
  updateAssetInventory
};
