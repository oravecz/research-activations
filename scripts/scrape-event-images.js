import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const DETAILS_PATH = './public/events/details.json';
const MAX_IMAGES_PER_EVENT = 9; // Logo + 8 promotional images
const IMAGE_TIMEOUT = 30000; // 30 seconds

// Helper: Download image from URL
async function downloadImage(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error(`Download timeout for ${imageUrl}`));
    }, IMAGE_TIMEOUT);

    protocol.get(imageUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        clearTimeout(timeout);
        const redirectUrl = response.headers.location;
        return downloadImage(redirectUrl, outputPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        clearTimeout(timeout);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        clearTimeout(timeout);
        fs.writeFile(outputPath, Buffer.concat(chunks))
          .then(() => resolve(outputPath))
          .catch(reject);
      });
      response.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Helper: Calculate image hash for duplicate detection
async function calculateImageHash(imagePath) {
  try {
    const buffer = await fs.readFile(imagePath);
    return createHash('md5').update(buffer).digest('hex');
  } catch (error) {
    console.error(`Error calculating hash for ${imagePath}:`, error.message);
    return null;
  }
}

// Helper: Check if image already exists (by hash)
async function isDuplicateImage(imagePath, existingHashes) {
  const hash = await calculateImageHash(imagePath);
  if (!hash) return false;

  if (existingHashes.has(hash)) {
    console.log(`  Duplicate detected: ${path.basename(imagePath)}`);
    return true;
  }

  existingHashes.add(hash);
  return false;
}

// Helper: Get image URLs from webpage
function extractImageUrlsFromHtml(html, baseUrl) {
  const imageUrls = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    try {
      const imgUrl = new URL(match[1], baseUrl).href;
      // Filter out small icons, logos in header/footer, tracking pixels
      if (imgUrl.match(/\.(jpg|jpeg|png|webp)$/i) &&
          !imgUrl.includes('icon') &&
          !imgUrl.includes('logo') &&
          !imgUrl.includes('sprite') &&
          !imgUrl.includes('pixel') &&
          !imgUrl.includes('1x1')) {
        imageUrls.push(imgUrl);
      }
    } catch (e) {
      // Skip invalid URLs
    }
  }

  return imageUrls;
}

// Helper: Fetch HTML content
async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, IMAGE_TIMEOUT);

    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        clearTimeout(timeout);
        return fetchHtml(response.headers.location).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        clearTimeout(timeout);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      let html = '';
      response.on('data', (chunk) => html += chunk);
      response.on('end', () => {
        clearTimeout(timeout);
        resolve(html);
      });
      response.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Main: Process single event
async function scrapeImagesForEvent(event) {
  console.log(`\n=== Processing Event ${event.id}: ${event.brand} - ${event.title} ===`);

  const eventDir = path.join('./public/events', event.brand.toLowerCase().replace(/\s+/g, '-'), `event-${event.id}`);
  const imagesDir = path.join(eventDir, 'images');

  // Ensure directories exist
  await fs.mkdir(imagesDir, { recursive: true });

  // Track existing image hashes to detect duplicates
  const existingHashes = new Set();
  const existingImages = [];

  // Load existing images and calculate hashes
  try {
    const files = await fs.readdir(imagesDir);
    for (const file of files) {
      if (file.match(/^image-\d+\.png$/)) {
        const imagePath = path.join(imagesDir, file);
        const hash = await calculateImageHash(imagePath);
        if (hash) {
          existingHashes.add(hash);
          existingImages.push(imagePath);
        }
      }
    }
    console.log(`  Found ${existingImages.length} existing images`);
  } catch (error) {
    console.log(`  No existing images found`);
  }

  const downloadedImages = [...existingImages];
  let newImageCount = 0;

  // Step 1: Try to extract images from event URL
  if (event.url && event.validationStatus === 'valid') {
    try {
      console.log(`  Fetching images from: ${event.url}`);
      const html = await fetchHtml(event.url);
      const imageUrls = extractImageUrlsFromHtml(html, event.url);
      console.log(`  Found ${imageUrls.length} potential images from URL`);

      // Download images from event URL
      for (let i = 0; i < Math.min(imageUrls.length, MAX_IMAGES_PER_EVENT - existingImages.length); i++) {
        try {
          const imageUrl = imageUrls[i];
          const tempPath = path.join(imagesDir, `temp-${Date.now()}-${i}.png`);

          console.log(`  Downloading: ${imageUrl}`);
          await downloadImage(imageUrl, tempPath);

          // Check for duplicates
          if (await isDuplicateImage(tempPath, existingHashes)) {
            await fs.unlink(tempPath);
            continue;
          }

          // Rename to proper filename
          const finalPath = path.join(imagesDir, `image-${existingImages.length + newImageCount + 1}.png`);
          await fs.rename(tempPath, finalPath);
          downloadedImages.push(finalPath);
          newImageCount++;
          console.log(`  ✓ Saved: ${path.basename(finalPath)}`);

          if (downloadedImages.length >= MAX_IMAGES_PER_EVENT) break;
        } catch (error) {
          console.log(`  ✗ Failed to download image: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`  ✗ Failed to fetch URL: ${error.message}`);
    }
  }

  console.log(`  Summary: ${newImageCount} new images downloaded, ${downloadedImages.length} total images`);

  // Return image inventory
  const imageInventory = {
    totalImages: downloadedImages.length,
    logoFirst: true,
    images: downloadedImages.map((imagePath, index) => ({
      path: imagePath.replace('./public/', ''),
      order: index,
      isLogo: index === 0
    }))
  };

  return imageInventory;
}

// Main: Process all events
async function main() {
  console.log('Starting image scraping process...\n');

  // Load events data
  const data = JSON.parse(await fs.readFile(DETAILS_PATH, 'utf8'));
  const events = data.events;

  console.log(`Found ${events.length} events to process\n`);

  const updatedEvents = [];

  // Process each event
  for (const event of events) {
    try {
      const imageInventory = await scrapeImagesForEvent(event);

      // Update event with new image inventory
      updatedEvents.push({
        ...event,
        imageInventory,
        assetInventory: {
          ...event.assetInventory,
          promotionalImageCount: imageInventory.totalImages - 1, // Exclude logo
          lastUpdated: new Date().toISOString()
        }
      });

      // Delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to process event ${event.id}:`, error.message);
      updatedEvents.push(event); // Keep original data
    }
  }

  // Update details.json
  data.events = updatedEvents;
  data.metadata.lastUpdated = new Date().toISOString();

  await fs.writeFile(DETAILS_PATH, JSON.stringify(data, null, 2));
  console.log('\n✓ Updated details.json with new image inventories');

  // Summary
  const totalImages = updatedEvents.reduce((sum, e) => sum + (e.imageInventory?.totalImages || 0), 0);
  console.log(`\n=== Summary ===`);
  console.log(`Total events processed: ${updatedEvents.length}`);
  console.log(`Total images collected: ${totalImages}`);
  console.log(`Average images per event: ${(totalImages / updatedEvents.length).toFixed(1)}`);
}

main().catch(console.error);
