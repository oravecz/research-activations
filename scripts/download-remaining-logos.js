#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const eventsData = JSON.parse(fs.readFileSync('events/details.json', 'utf-8'));
const events = eventsData.events;

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
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function downloadBrandLogo(event) {
  const brandSlug = event.brand.toLowerCase().replace(/\s+/g, '-');
  const logoPath = `events/${brandSlug}/event-${event.id}/images/image-0.png`;

  // Check if already exists
  if (fs.existsSync(logoPath)) {
    console.log(`  [${event.id}] ${event.brand}: Already exists ✓`);
    return true;
  }

  // Try different domain variations
  const domains = [
    event.brand.toLowerCase().replace(/\s+/g, '') + '.com',
    event.brand.toLowerCase().replace(/\s+/g, '-') + '.com',
    event.brand.toLowerCase().replace(/[^a-z]/g, '') + '.com'
  ];

  for (const domain of domains) {
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    try {
      await downloadImage(clearbitUrl, logoPath);
      console.log(`  [${event.id}] ${event.brand}: ✓ Downloaded (${domain})`);
      return true;
    } catch (error) {
      // Try next domain
    }
  }

  console.log(`  [${event.id}] ${event.brand}: ✗ Failed (needs manual download)`);
  return false;
}

async function main() {
  const missingLogos = [];

  // Find events without logos
  for (const event of events) {
    const brandSlug = event.brand.toLowerCase().replace(/\s+/g, '-');
    const logoPath = `events/${brandSlug}/event-${event.id}/images/image-0.png`;

    if (!fs.existsSync(logoPath)) {
      missingLogos.push(event);
    }
  }

  console.log(`Found ${missingLogos.length} events missing logos\n`);

  const successes = [];
  const failures = [];

  for (const event of missingLogos) {
    const success = await downloadBrandLogo(event);
    if (success) {
      successes.push(event);
    } else {
      failures.push(event);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`✓ Downloaded: ${successes.length}`);
  console.log(`✗ Failed: ${failures.length}`);
  console.log('');

  if (failures.length > 0) {
    console.log('MANUAL DOWNLOAD NEEDED:');
    failures.forEach(event => {
      const brandSlug = event.brand.toLowerCase().replace(/\s+/g, '-');
      console.log(`  [${event.id}] ${event.brand}`);
      console.log(`      → Save to: events/${brandSlug}/event-${event.id}/images/image-0.png`);
    });
  }
}

main().catch(console.error);
