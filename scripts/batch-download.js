#!/usr/bin/env node

/**
 * Batch Image Downloader
 *
 * Downloads multiple images from a list of URLs for a specific event
 *
 * Usage:
 *   node scripts/batch-download.js <event-id> <urls-file>
 *   node scripts/batch-download.js 64 /tmp/event-64-urls.txt
 *
 * URLs file format (one URL per line):
 *   https://example.com/image1.jpg
 *   https://example.com/image2.jpg
 *   https://example.com/image3.jpg
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';

const DETAILS_PATH = './public/events/details.json';

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', async () => {
        try {
          await fs.writeFile(outputPath, Buffer.concat(chunks));
          resolve(outputPath);
        } catch (error) {
          reject(error);
        }
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const eventId = process.argv[2];
  const urlsFile = process.argv[3];

  if (!eventId || !urlsFile) {
    console.error('Usage: node batch-download.js <event-id> <urls-file>');
    console.error('');
    console.error('Example:');
    console.error('  node batch-download.js 64 /tmp/event-64-urls.txt');
    process.exit(1);
  }

  // Load event data
  const data = JSON.parse(await fs.readFile(DETAILS_PATH, 'utf8'));
  const event = data.events.find(e => e.id === parseInt(eventId));

  if (!event) {
    console.error(`Event ${eventId} not found`);
    process.exit(1);
  }

  // Determine output directory
  const eventDir = path.join(
    './public/events',
    event.brand.toLowerCase().replace(/\s+/g, '-'),
    `event-${event.id}`,
    'images'
  );

  // Ensure directory exists
  await fs.mkdir(eventDir, { recursive: true });

  // Load URLs from file
  const urlsContent = await fs.readFile(urlsFile, 'utf8');
  const urls = urlsContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('http'));

  if (urls.length === 0) {
    console.error('No valid URLs found in file');
    process.exit(1);
  }

  console.log(`\n📥 Batch Image Downloader`);
  console.log(`${'─'.repeat(60)}\n`);
  console.log(`Event: ${event.brand} - ${event.title}`);
  console.log(`Target: ${eventDir}`);
  console.log(`URLs to download: ${urls.length}\n`);

  // Determine starting image number
  const existingFiles = await fs.readdir(eventDir).catch(() => []);
  const existingImages = existingFiles.filter(f => f.match(/^image-\d+/));
  const startNumber = existingImages.length;

  console.log(`Starting at image-${startNumber}\n`);

  // Download images
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const imageNumber = startNumber + i;
    const ext = url.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
    const filename = `image-${imageNumber}${ext}`;
    const outputPath = path.join(eventDir, filename);

    try {
      console.log(`[${i + 1}/${urls.length}] Downloading: ${filename}`);
      console.log(`  URL: ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);

      await downloadImage(url, outputPath);

      const stats = await fs.stat(outputPath);
      if (stats.size === 0) {
        console.log(`  ✗ Failed: File is empty (0 bytes)\n`);
        await fs.unlink(outputPath);
        failCount++;
      } else {
        console.log(`  ✓ Saved: ${(stats.size / 1024).toFixed(1)} KB\n`);
        successCount++;
      }
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}\n`);
      failCount++;
    }
  }

  console.log(`${'─'.repeat(60)}`);
  console.log(`\n✅ Download Complete`);
  console.log(`   Success: ${successCount} images`);
  console.log(`   Failed: ${failCount} images`);

  if (successCount > 0) {
    console.log(`\n📋 Next Steps:`);
    console.log(`   1. Check for duplicates: node scripts/remove-duplicates.js ${eventId}`);
    console.log(`   2. Update inventory: node scripts/update-image-inventory.js ${eventId}`);
  }

  console.log('');
}

main().catch(console.error);
