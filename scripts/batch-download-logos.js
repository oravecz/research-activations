#!/usr/bin/env node

/**
 * Batch Brand Logo Downloader
 *
 * Attempts to download logos for all brands automatically.
 * Uses Clearbit Logo API as primary source.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Brand to domain mapping for better logo fetching
const BRAND_DOMAINS = {
  'Nike': 'nike.com',
  'adidas': 'adidas.com',
  'On Running': 'on-running.com',
  'Foot Locker': 'footlocker.com',
  'Crocs': 'crocs.com',
  'New Balance': 'newbalance.com',
  'Allbirds': 'allbirds.com',
  'Vans': 'vans.com',
  'Converse': 'converse.com',
  'Patagonia': 'patagonia.com',
  'Lululemon': 'lululemon.com',
  'Zara': 'zara.com',
  'Target': 'target.com',
  'REI': 'rei.com',
  'Apple': 'apple.com',
  'Warby Parker': 'warbyparker.com',
  'Dick\'s Sporting Goods': 'dickssportinggoods.com',
  'Sephora': 'sephora.com',
  'Ulta Beauty': 'ulta.com',
  'Anthropologie': 'anthropologie.com',
  'Urban Outfitters': 'urbanoutfitters.com',
  'Gap': 'gap.com',
  'Old Navy': 'oldnavy.com',
  'H&M': 'hm.com',
  'Everlane': 'everlane.com',
  'Madewell': 'madewell.com',
  'Nordstrom': 'nordstrom.com',
  'Best Buy': 'bestbuy.com',
  'Whole Foods Market': 'wholefoodsmarket.com',
  'Trader Joe\'s': 'traderjoes.com',
  'IKEA': 'ikea.com',
  'West Elm': 'westelm.com',
  'CB2': 'cb2.com',
  'Williams Sonoma': 'williams-sonoma.com',
  'Sunglass Hut': 'sunglasshut.com',
  'Alo Yoga': 'aloyoga.com',
  'Outdoor Voices': 'outdoorvoices.com',
  'Athleta': 'athleta.gap.com',
  'Free People Movement': 'freepeople.com',
  'Vuori': 'vuoriclothing.com'
};

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

// Download file from URL
function downloadFile(url, dest, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(dest);
    let completed = false;

    const timer = setTimeout(() => {
      if (!completed) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error('Download timeout'));
      }
    }, timeout);

    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          completed = true;
          clearTimeout(timer);
          file.close();
          resolve(dest);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        clearTimeout(timer);
        downloadFile(response.headers.location, dest, timeout).then(resolve).catch(reject);
      } else {
        completed = true;
        clearTimeout(timer);
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      completed = true;
      clearTimeout(timer);
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// Get logo URL for a brand
function getLogoUrl(brand) {
  const domain = BRAND_DOMAINS[brand];
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }

  // Fallback to slug-based domain
  const brandSlug = generateBrandSlug(brand);
  return `https://logo.clearbit.com/${brandSlug}.com`;
}

// Download logo and copy to all brand events
async function downloadAndDistributeLogo(brand, events) {
  console.log(`Processing ${brand} (${events.length} events)...`);

  // Get first event as reference
  const firstEvent = events[0];
  const firstEventDir = getEventDirectory(firstEvent);
  const logoPath = path.join(firstEventDir, 'logo.png');

  // Try to download logo
  const logoUrl = getLogoUrl(brand);

  try {
    await downloadFile(logoUrl, logoPath);
    console.log(`  ✓ Downloaded logo from ${logoUrl}`);

    // Update metadata for first event
    const metadataPath = path.join(firstEventDir, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      metadata.assets.logo.sourceUrl = logoUrl;
      metadata.assets.logo.fetchedAt = new Date().toISOString();
      metadata.assets.logo.status = 'downloaded';
      metadata.updatedAt = new Date().toISOString();
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }

    // Copy to other events
    for (let i = 1; i < events.length; i++) {
      const event = events[i];
      const eventDir = getEventDirectory(event);
      const destLogo = path.join(eventDir, 'logo.png');
      const metadataPath = path.join(eventDir, 'metadata.json');

      fs.copyFileSync(logoPath, destLogo);

      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        metadata.assets.logo.sourceUrl = logoUrl;
        metadata.assets.logo.fetchedAt = new Date().toISOString();
        metadata.assets.logo.status = 'downloaded';
        metadata.assets.logo.copiedFrom = `event-${firstEvent.id}`;
        metadata.updatedAt = new Date().toISOString();
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      }
    }

    console.log(`  ✓ Copied to ${events.length - 1} other events`);
    return { brand, success: true, url: logoUrl, eventCount: events.length };

  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    console.log(`    URL attempted: ${logoUrl}`);

    return { brand, success: false, error: error.message, url: logoUrl, eventCount: events.length };
  }
}

// Batch download all logos
async function batchDownloadLogos() {
  const events = loadEventsData();
  const brandMap = new Map();

  // Group events by brand
  for (const event of events) {
    if (!brandMap.has(event.brand)) {
      brandMap.set(event.brand, []);
    }
    brandMap.get(event.brand).push(event);
  }

  console.log('='.repeat(80));
  console.log('BATCH LOGO DOWNLOAD');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Total brands: ${brandMap.size}`);
  console.log(`Total events: ${events.length}`);
  console.log('');

  const results = [];

  for (const [brand, brandEvents] of brandMap.entries()) {
    const result = await downloadAndDistributeLogo(brand, brandEvents);
    results.push(result);
    console.log('');

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('='.repeat(80));
  console.log('DOWNLOAD SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Successful: ${successful.length}/${results.length}`);
  console.log(`Failed: ${failed.length}/${results.length}`);
  console.log('');

  if (failed.length > 0) {
    console.log('Failed downloads:');
    for (const result of failed) {
      console.log(`  ✗ ${result.brand}`);
      console.log(`    URL: ${result.url}`);
      console.log(`    Error: ${result.error}`);
    }
    console.log('');
    console.log('Manual download required for failed logos.');
    console.log('Save logos as PNG and run:');
    console.log('  node scripts/download-brand-assets.js --copy-logo "<Brand Name>"');
  }

  // Save results
  const resultsPath = path.join(process.cwd(), 'scripts', 'logo-download-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalBrands: results.length,
    successful: successful.length,
    failed: failed.length,
    results
  }, null, 2));

  console.log('');
  console.log(`Results saved to: ${resultsPath}`);
  console.log('');

  return results;
}

// Main execution
async function main() {
  await batchDownloadLogos();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { batchDownloadLogos };
