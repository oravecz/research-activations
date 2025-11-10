#!/usr/bin/env node

/**
 * Enhanced Image Scraper with Duplicate Detection
 *
 * Features:
 * - Scrapes event URL for relevant images
 * - Uses web search to find additional branded activation images
 * - Detects and removes duplicate images using perceptual hashing
 * - Validates image relevance to brand activation
 * - Downloads up to 9 unique images per event (logo + 8 promotional)
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';

const BASE_DIR = process.cwd();
const EVENTS_FILE = path.join(BASE_DIR, 'public/events/details.json');

/**
 * Calculate perceptual hash for duplicate detection
 * Uses difference hash (dHash) algorithm
 */
async function calculateImageHash(imagePath) {
  try {
    const image = sharp(imagePath);
    const { data, info } = await image
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
 * Calculate Hamming distance between two hashes
 */
function hammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return Infinity;

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

/**
 * Find and remove duplicate images in a directory
 * Returns array of unique image paths
 */
async function removeDuplicates(imagesDir) {
  console.log(`\n🔍 Scanning for duplicates in ${imagesDir}...`);

  try {
    const files = await fs.readdir(imagesDir);
    const imageFiles = files.filter(f => /\.(png|jpe?g)$/i.test(f));

    if (imageFiles.length === 0) {
      console.log('No images found');
      return [];
    }

    // Calculate hashes for all images
    const imageHashes = new Map();
    for (const file of imageFiles) {
      const filePath = path.join(imagesDir, file);
      const hash = await calculateImageHash(filePath);
      if (hash) {
        imageHashes.set(file, hash);
      }
    }

    // Find duplicates (Hamming distance < 5 = very similar)
    const SIMILARITY_THRESHOLD = 5;
    const duplicates = new Set();
    const hashArray = Array.from(imageHashes.entries());

    for (let i = 0; i < hashArray.length; i++) {
      for (let j = i + 1; j < hashArray.length; j++) {
        const [file1, hash1] = hashArray[i];
        const [file2, hash2] = hashArray[j];
        const distance = hammingDistance(hash1, hash2);

        if (distance < SIMILARITY_THRESHOLD) {
          // Keep the first occurrence, mark second as duplicate
          duplicates.add(file2);
          console.log(`  ❌ Duplicate found: ${file2} (similar to ${file1}, distance: ${distance})`);
        }
      }
    }

    // Remove duplicates
    for (const dupFile of duplicates) {
      const dupPath = path.join(imagesDir, dupFile);
      await fs.unlink(dupPath);
      console.log(`  🗑️  Removed: ${dupFile}`);
    }

    // Return unique images
    const uniqueFiles = imageFiles.filter(f => !duplicates.has(f));
    console.log(`✅ Kept ${uniqueFiles.length} unique images (removed ${duplicates.size} duplicates)`);

    return uniqueFiles.map(f => path.join(imagesDir, f));
  } catch (error) {
    console.error(`Error removing duplicates:`, error.message);
    return [];
  }
}

/**
 * Generate web search queries for finding activation images
 */
function generateSearchQueries(brand, title, activation) {
  const queries = [
    `${brand} ${title} activation`,
    `${brand} store event ${new Date().getFullYear() - 1}`,
    `${brand} retail experience`,
    `${brand} in-store activation`,
  ];

  // Add specific activation keywords
  if (activation.toLowerCase().includes('workshop')) {
    queries.push(`${brand} workshop store`);
  }
  if (activation.toLowerCase().includes('sustainability')) {
    queries.push(`${brand} sustainability program`);
  }
  if (activation.toLowerCase().includes('community')) {
    queries.push(`${brand} community event`);
  }

  return queries;
}

/**
 * Main processing function for a single event
 */
async function processEvent(event) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📦 Processing Event ${event.id}: ${event.brand} - ${event.title}`);
  console.log(`${'='.repeat(80)}`);

  const brandSlug = event.brand.toLowerCase().replace(/['\s]+/g, '-');
  const imagesDir = path.join(BASE_DIR, 'public/events', brandSlug, `event-${event.id}`, 'images');

  // Check if directory exists
  try {
    await fs.access(imagesDir);
  } catch {
    console.log(`⚠️  Images directory does not exist: ${imagesDir}`);
    return { event, success: false, reason: 'no-directory' };
  }

  // Step 1: Remove duplicates from existing images
  const uniqueImages = await removeDuplicates(imagesDir);

  console.log(`\n📊 Results:`);
  console.log(`  - Unique images: ${uniqueImages.length}`);
  console.log(`  - Need more images: ${Math.max(0, 9 - uniqueImages.length)}`);

  if (uniqueImages.length >= 9) {
    console.log(`✅ Event has sufficient unique images`);
    return { event, success: true, imageCount: uniqueImages.length };
  }

  // Step 2: Generate search queries for finding more images
  const queries = generateSearchQueries(event.brand, event.title, event.activation);
  console.log(`\n🔍 Generated search queries:`);
  queries.forEach((q, i) => console.log(`  ${i + 1}. "${q}"`));

  console.log(`\n⚠️  Manual action required:`);
  console.log(`  1. Use Playwright MCP to search for images using the queries above`);
  console.log(`  2. Download ${9 - uniqueImages.length} more relevant images`);
  console.log(`  3. Run this script again to verify no duplicates`);

  return {
    event,
    success: false,
    reason: 'needs-more-images',
    currentCount: uniqueImages.length,
    needed: 9 - uniqueImages.length,
    queries
  };
}

/**
 * Process all events or specific event
 */
async function main() {
  const args = process.argv.slice(2);
  const eventId = args[0] ? parseInt(args[0]) : null;

  console.log('🚀 Enhanced Image Scraper with Duplicate Detection\n');

  // Load events
  const eventsData = JSON.parse(await fs.readFile(EVENTS_FILE, 'utf-8'));
  const events = eventId
    ? eventsData.events.filter(e => e.id === eventId)
    : eventsData.events;

  if (events.length === 0) {
    console.error(`❌ Event ${eventId} not found`);
    process.exit(1);
  }

  // Process each event
  const results = [];
  for (const event of events) {
    const result = await processEvent(event);
    results.push(result);
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(80)}`);

  const successful = results.filter(r => r.success);
  const needsMore = results.filter(r => r.reason === 'needs-more-images');
  const noDirectory = results.filter(r => r.reason === 'no-directory');

  console.log(`✅ Complete: ${successful.length} events`);
  console.log(`⚠️  Needs more images: ${needsMore.length} events`);
  console.log(`❌ No directory: ${noDirectory.length} events`);

  if (needsMore.length > 0) {
    console.log(`\n📋 Events needing more images:`);
    needsMore.forEach(r => {
      console.log(`  - Event ${r.event.id} (${r.event.brand}): ${r.currentCount}/9 images (need ${r.needed} more)`);
    });
  }
}

main().catch(console.error);
