#!/usr/bin/env node

/**
 * Brand Asset Download Helper
 *
 * Downloads brand logos and promotional images for events.
 * Uses multiple strategies to source high-quality images.
 *
 * Usage:
 *   node scripts/download-brand-assets.js --download-logo <brand> <event-id>
 *   node scripts/download-brand-assets.js --copy-logo <brand>
 *   node scripts/download-brand-assets.js --list-logos
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

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
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(dest);

    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(dest);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        file.close();
        fs.unlinkSync(dest);
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// Try to download logo from Clearbit
async function downloadLogoFromClearbit(brand, destination) {
  const brandSlug = generateBrandSlug(brand);
  const url = `https://logo.clearbit.com/${brandSlug}.com`;

  console.log(`  Trying Clearbit: ${url}`);

  try {
    await downloadFile(url, destination);
    console.log(`  ✓ Downloaded from Clearbit`);
    return true;
  } catch (error) {
    console.log(`  ✗ Clearbit failed: ${error.message}`);
    return false;
  }
}

// Generate logo source URLs for a brand
function getLogoSourceUrls(brand) {
  const brandSlug = generateBrandSlug(brand);

  return {
    clearbit: `https://logo.clearbit.com/${brandSlug}.com`,
    brandfetch: `https://img.logo fetch.io/${brandSlug}.com`,
    website: `https://www.${brandSlug}.com`,
    search: `https://www.google.com/search?q=${encodeURIComponent(brand + ' logo transparent PNG high resolution')}&tbm=isch`
  };
}

// Download logo for a brand
async function downloadBrandLogo(brand, eventId) {
  const events = loadEventsData();
  const event = events.find(e => e.id === eventId && e.brand === brand);

  if (!event) {
    console.error(`Event not found: ${brand} #${eventId}`);
    return false;
  }

  const eventDir = getEventDirectory(event);
  const logoPath = path.join(eventDir, 'logo.png');
  const metadataPath = path.join(eventDir, 'metadata.json');

  console.log(`Downloading logo for: ${brand}`);
  console.log(`  Event: ${event.title}`);
  console.log(`  Destination: ${logoPath}`);
  console.log('');

  // Try Clearbit first
  const success = await downloadLogoFromClearbit(brand, logoPath);

  if (success) {
    // Update metadata
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      const brandSlug = generateBrandSlug(brand);
      metadata.assets.logo.sourceUrl = `https://logo.clearbit.com/${brandSlug}.com`;
      metadata.assets.logo.fetchedAt = new Date().toISOString();
      metadata.assets.logo.status = 'downloaded';
      metadata.updatedAt = new Date().toISOString();
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      console.log('  ✓ Metadata updated');
    }
    return true;
  }

  // If automatic download failed, show manual options
  console.log('');
  console.log('  Automatic download failed. Manual options:');
  console.log('');

  const sources = getLogoSourceUrls(brand);
  console.log('  Logo Sources:');
  console.log(`    Brandfetch: ${sources.brandfetch}`);
  console.log(`    Website: ${sources.website}`);
  console.log(`    Image Search: ${sources.search}`);
  console.log('');
  console.log(`  Save logo to: ${logoPath}`);
  console.log('');

  return false;
}

// Copy logo to all events for a brand
function copyLogoToAllBrandEvents(brand) {
  const events = loadEventsData();
  const brandEvents = events.filter(e => e.brand === brand);

  if (brandEvents.length === 0) {
    console.error(`No events found for brand: ${brand}`);
    return false;
  }

  console.log(`Copying logo to all ${brand} events (${brandEvents.length} events)...`);
  console.log('');

  // Find the first event with a logo
  let sourceLogo = null;
  let sourceEvent = null;

  for (const event of brandEvents) {
    const eventDir = getEventDirectory(event);
    const logoPath = path.join(eventDir, 'logo.png');
    if (fs.existsSync(logoPath)) {
      sourceLogo = logoPath;
      sourceEvent = event;
      break;
    }
  }

  if (!sourceLogo) {
    console.error(`No logo found for ${brand}. Download a logo first.`);
    return false;
  }

  console.log(`Source logo: ${sourceLogo}`);
  console.log('');

  let copiedCount = 0;

  for (const event of brandEvents) {
    if (event.id === sourceEvent.id) continue; // Skip source event

    const eventDir = getEventDirectory(event);
    const destLogo = path.join(eventDir, 'logo.png');
    const metadataPath = path.join(eventDir, 'metadata.json');

    // Copy logo
    fs.copyFileSync(sourceLogo, destLogo);
    console.log(`[${event.id}] Copied logo to ${destLogo}`);

    // Update metadata
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      const sourceMetadataPath = path.join(getEventDirectory(sourceEvent), 'metadata.json');

      if (fs.existsSync(sourceMetadataPath)) {
        const sourceMetadata = JSON.parse(fs.readFileSync(sourceMetadataPath, 'utf-8'));
        metadata.assets.logo = { ...sourceMetadata.assets.logo };
        metadata.assets.logo.copiedFrom = `event-${sourceEvent.id}`;
        metadata.updatedAt = new Date().toISOString();
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      }
    }

    copiedCount++;
  }

  console.log('');
  console.log(`✓ Copied logo to ${copiedCount} events`);
  console.log('');

  return true;
}

// List logo status for all brands
function listLogoStatus() {
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
  console.log('BRAND LOGO STATUS');
  console.log('='.repeat(80));
  console.log('');

  const brands = Array.from(brandMap.keys()).sort();

  for (const brand of brands) {
    const brandEvents = brandMap.get(brand);
    const eventsWithLogo = brandEvents.filter(e => {
      const eventDir = getEventDirectory(e);
      return fs.existsSync(path.join(eventDir, 'logo.png'));
    });

    const status = eventsWithLogo.length === brandEvents.length ? '✓' :
                   eventsWithLogo.length > 0 ? '◐' : '✗';

    console.log(`${status} ${brand} (${eventsWithLogo.length}/${brandEvents.length})`);

    if (eventsWithLogo.length > 0 && eventsWithLogo.length < brandEvents.length) {
      console.log(`   Need to copy logo to ${brandEvents.length - eventsWithLogo.length} events`);
      console.log(`   Run: node scripts/download-brand-assets.js --copy-logo "${brand}"`);
    } else if (eventsWithLogo.length === 0) {
      console.log(`   Download logo first: node scripts/download-brand-assets.js --download-logo "${brand}" ${brandEvents[0].id}`);
    }
  }

  console.log('');

  const totalBrands = brands.length;
  const completeBrands = Array.from(brandMap.entries()).filter(([_, events]) => {
    return events.every(e => fs.existsSync(path.join(getEventDirectory(e), 'logo.png')));
  }).length;

  console.log(`Summary: ${completeBrands}/${totalBrands} brands complete`);
  console.log('');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('Brand Asset Download Helper');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/download-brand-assets.js --download-logo <brand> <event-id>');
    console.log('  node scripts/download-brand-assets.js --copy-logo <brand>');
    console.log('  node scripts/download-brand-assets.js --list-logos');
    console.log('');
    console.log('Commands:');
    console.log('  --download-logo    Download logo for a specific brand and event');
    console.log('  --copy-logo        Copy logo to all events for a brand');
    console.log('  --list-logos       Show logo download status for all brands');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/download-brand-assets.js --download-logo "Nike" 1');
    console.log('  node scripts/download-brand-assets.js --copy-logo "Nike"');
    console.log('  node scripts/download-brand-assets.js --list-logos');
    console.log('');
    return;
  }

  const command = args[0];

  switch (command) {
    case '--download-logo':
      if (args.length < 3) {
        console.error('Error: --download-logo requires <brand> <event-id>');
        process.exit(1);
      }
      await downloadBrandLogo(args[1], parseInt(args[2]));
      break;

    case '--copy-logo':
      if (args.length < 2) {
        console.error('Error: --copy-logo requires <brand>');
        process.exit(1);
      }
      copyLogoToAllBrandEvents(args[1]);
      break;

    case '--list-logos':
      listLogoStatus();
      break;

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
  downloadBrandLogo,
  copyLogoToAllBrandEvents,
  listLogoStatus
};
