#!/usr/bin/env node

/**
 * Automated Image Downloader with Duplicate Detection
 *
 * This script downloads images from URLs and ensures no duplicates
 * It can be paired with Playwright MCP image URL extraction
 *
 * Usage:
 *   node scripts/auto-download-images.js <event-id> <image-urls.txt>
 *
 * Or provide URLs directly:
 *   node scripts/auto-download-images.js <event-id> "url1" "url2" "url3"
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';
import { createHash } from 'crypto';

const BASE_DIR = process.cwd();
const EVENTS_FILE = path.join(BASE_DIR, 'public/events/details.json');

/**
 * Download image from URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, response => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);

          // Convert to PNG using Sharp for consistency
          await sharp(buffer)
            .png()
            .toFile(filepath);

          resolve(filepath);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

/**
 * Calculate perceptual hash for duplicate detection
 */
async function calculateImageHash(imagePath) {
  try {
    const image = sharp(imagePath);
    const { data } = await image
      .resize(9, 8, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Calculate dHash
    let hash = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const left = data[row * 9 + col];
        const right = data[row * 9 + col + 1];
        hash += left > right ? '1' : '0';
      }
    }

    return hash;
  } catch (error) {
    console.error(`Error hashing ${imagePath}:`, error.message);
    return null;
  }
}

/**
 * Check if image is duplicate of existing images
 */
async function isDuplicate(newImagePath, existingImages, threshold = 5) {
  const newHash = await calculateImageHash(newImagePath);
  if (!newHash) return true; // Treat hash failure as duplicate

  for (const existingPath of existingImages) {
    const existingHash = await calculateImageHash(existingPath);
    if (!existingHash) continue;

    // Calculate Hamming distance
    let distance = 0;
    for (let i = 0; i < newHash.length; i++) {
      if (newHash[i] !== existingHash[i]) distance++;
    }

    if (distance < threshold) {
      return true; // Duplicate found
    }
  }

  return false; // Not a duplicate
}

/**
 * Get next available image number
 */
async function getNextImageNumber(imagesDir) {
  const files = await fs.readdir(imagesDir);
  const imageNumbers = files
    .filter(f => /^image-\d+\.(png|jpe?g)$/i.test(f))
    .map(f => parseInt(f.match(/image-(\d+)/)[1]))
    .filter(n => !isNaN(n));

  if (imageNumbers.length === 0) return 1; // Start from 1 if only logo exists
  return Math.max(...imageNumbers) + 1;
}

/**
 * Main download function
 */
async function downloadImages(eventId, imageUrls) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📥 Downloading Images for Event ${eventId}`);
  console.log(`${'='.repeat(80)}\n`);

  // Load event data
  const eventsData = JSON.parse(await fs.readFile(EVENTS_FILE, 'utf-8'));
  const event = eventsData.events.find(e => e.id === eventId);

  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  const brandSlug = event.brand.toLowerCase().replace(/['\s]+/g, '-');
  const imagesDir = path.join(BASE_DIR, 'public/events', brandSlug, `event-${event.id}`, 'images');

  // Get existing images
  const existingFiles = await fs.readdir(imagesDir);
  const existingImages = existingFiles
    .filter(f => /^image-\d+\.(png|jpe?g)$/i.test(f))
    .map(f => path.join(imagesDir, f));

  console.log(`📊 Current state:`);
  console.log(`  - Existing images: ${existingImages.length}`);
  console.log(`  - URLs to download: ${imageUrls.length}`);
  console.log(`  - Target: 9 images\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < imageUrls.length; i++) {
    if (existingImages.length + downloaded >= 9) {
      console.log(`✅ Reached target of 9 images`);
      break;
    }

    const url = imageUrls[i];
    console.log(`\n[${i + 1}/${imageUrls.length}] Processing: ${url.substring(0, 80)}...`);

    try {
      // Download to temporary file
      const tempFile = path.join(imagesDir, `temp-${Date.now()}.png`);
      await downloadImage(url, tempFile);
      console.log(`  ✓ Downloaded`);

      // Check for duplicates
      const allImages = [...existingImages, ...Array.from({ length: downloaded }, (_, i) =>
        path.join(imagesDir, `image-${existingImages.length + i + 1}.png`)
      )];

      const duplicate = await isDuplicate(tempFile, allImages);

      if (duplicate) {
        await fs.unlink(tempFile);
        console.log(`  ❌ Duplicate detected - skipped`);
        skipped++;
        continue;
      }

      // Rename to final filename
      const imageNumber = existingImages.length + downloaded + 1;
      const finalPath = path.join(imagesDir, `image-${imageNumber}.png`);
      await fs.rename(tempFile, finalPath);
      console.log(`  ✓ Saved as image-${imageNumber}.png`);
      downloaded++;

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 DOWNLOAD SUMMARY`);
  console.log(`${'='.repeat(80)}`);
  console.log(`✅ Downloaded: ${downloaded} unique images`);
  console.log(`⏭️  Skipped: ${skipped} duplicates`);
  console.log(`❌ Failed: ${failed} errors`);
  console.log(`📦 Total images: ${existingImages.length + downloaded}/9`);

  if (existingImages.length + downloaded < 9) {
    console.log(`\n⚠️  Still need ${9 - existingImages.length - downloaded} more images`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage:');
    console.error('  node scripts/auto-download-images.js <event-id> <url1> <url2> ...');
    console.error('  node scripts/auto-download-images.js <event-id> <urls-file.txt>');
    process.exit(1);
  }

  const eventId = parseInt(args[0]);
  let imageUrls = [];

  // Check if second argument is a file
  const secondArg = args[1];
  try {
    const stats = await fs.stat(secondArg);
    if (stats.isFile()) {
      // Read URLs from file (one per line)
      const content = await fs.readFile(secondArg, 'utf-8');
      imageUrls = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && line.startsWith('http'));
    }
  } catch (e) {
    // Not a file, treat as direct URLs
    imageUrls = args.slice(1).filter(url => url.startsWith('http'));
  }

  if (imageUrls.length === 0) {
    console.error('No valid URLs provided');
    process.exit(1);
  }

  await downloadImages(eventId, imageUrls);
}

main().catch(console.error);
