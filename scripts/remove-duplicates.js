import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

const DETAILS_PATH = './public/events/details.json';

// Calculate image hash
async function calculateImageHash(imagePath) {
  try {
    const buffer = await fs.readFile(imagePath);
    return createHash('md5').update(buffer).digest('hex');
  } catch (error) {
    return null;
  }
}

// Remove duplicate images from event directory
async function removeDuplicates(eventId) {
  // Load events data
  const data = JSON.parse(await fs.readFile(DETAILS_PATH, 'utf8'));
  const event = data.events.find(e => e.id === parseInt(eventId));

  if (!event) {
    console.error(`Event ${eventId} not found`);
    return;
  }

  const eventDir = path.join(
    './public/events',
    event.brand.toLowerCase().replace(/\s+/g, '-'),
    `event-${event.id}`,
    'images'
  );

  console.log(`Checking for duplicates in: ${eventDir}\n`);

  try {
    const files = await fs.readdir(eventDir);
    const imageFiles = files.filter(f => f.match(/\.(png|jpg|jpeg|webp)$/i));

    console.log(`Found ${imageFiles.length} images\n`);

    const hashMap = new Map(); // hash -> file path
    const duplicates = [];

    // Calculate hashes
    for (const file of imageFiles) {
      const filePath = path.join(eventDir, file);
      const hash = await calculateImageHash(filePath);

      if (!hash) continue;

      if (hashMap.has(hash)) {
        // Duplicate found
        duplicates.push({
          original: hashMap.get(hash),
          duplicate: filePath
        });
      } else {
        hashMap.set(hash, filePath);
      }
    }

    // Remove duplicates
    if (duplicates.length === 0) {
      console.log('✓ No duplicates found');
      return;
    }

    console.log(`Found ${duplicates.length} duplicates:\n`);

    for (const dup of duplicates) {
      console.log(`  Keeping:  ${path.basename(dup.original)}`);
      console.log(`  Removing: ${path.basename(dup.duplicate)}\n`);
      await fs.unlink(dup.duplicate);
    }

    // Renumber remaining images
    const remaining = await fs.readdir(eventDir);
    const images = remaining.filter(f => f.match(/\.(png|jpg|jpeg|webp)$/i)).sort();

    console.log(`Renumbering ${images.length} remaining images...\n`);

    const tempFiles = [];

    // First pass: rename to temp names
    for (let i = 0; i < images.length; i++) {
      const oldPath = path.join(eventDir, images[i]);
      const ext = path.extname(images[i]);
      const tempPath = path.join(eventDir, `temp-${i}${ext}`);
      await fs.rename(oldPath, tempPath);
      tempFiles.push(tempPath);
    }

    // Second pass: rename to final sequential names
    for (let i = 0; i < tempFiles.length; i++) {
      const tempPath = tempFiles[i];
      const ext = path.extname(tempPath);
      const finalPath = path.join(eventDir, `image-${i}${ext}`);
      await fs.rename(tempPath, finalPath);
      console.log(`  ${path.basename(tempPath)} → ${path.basename(finalPath)}`);
    }

    console.log(`\n✓ Removed ${duplicates.length} duplicates`);
    console.log(`✓ ${images.length} images remaining`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Main
const eventId = process.argv[2];

if (!eventId) {
  console.error('Usage: node remove-duplicates.js <event-id>');
  process.exit(1);
}

removeDuplicates(eventId).catch(console.error);
