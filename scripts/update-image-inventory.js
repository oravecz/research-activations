import fs from 'fs/promises';
import path from 'path';

const DETAILS_PATH = './public/events/details.json';

// Update image inventory for a single event
async function updateInventory(eventId) {
  // Load events data
  const data = JSON.parse(await fs.readFile(DETAILS_PATH, 'utf8'));
  const eventIndex = data.events.findIndex(e => e.id === parseInt(eventId));

  if (eventIndex === -1) {
    console.error(`Event ${eventId} not found`);
    return;
  }

  const event = data.events[eventIndex];
  const eventDir = path.join(
    './public/events',
    event.brand.toLowerCase().replace(/\s+/g, '-'),
    `event-${event.id}`,
    'images'
  );

  console.log(`Updating inventory for Event ${event.id}: ${event.brand}\n`);

  try {
    const files = await fs.readdir(eventDir);
    const imageFiles = files
      .filter(f => f.match(/^image-\d+\.(png|jpg|jpeg|webp)$/i))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });

    console.log(`Found ${imageFiles.length} images:\n`);

    const images = imageFiles.map((file, index) => {
      const imagePath = path.join(eventDir, file).replace('./public/', '');
      const isLogo = index === 0;

      console.log(`  ${index}: ${file} ${isLogo ? '(logo)' : ''}`);

      return {
        path: imagePath,
        order: index,
        isLogo
      };
    });

    // Update event data
    data.events[eventIndex].imageInventory = {
      totalImages: images.length,
      logoFirst: true,
      images
    };

    data.events[eventIndex].assetInventory = {
      ...event.assetInventory,
      hasLogo: images.length > 0,
      logoPath: images[0]?.path || event.assetInventory?.logoPath,
      promotionalImageCount: Math.max(0, images.length - 1),
      lastUpdated: new Date().toISOString()
    };

    // Save updated data
    await fs.writeFile(DETAILS_PATH, JSON.stringify(data, null, 2));

    console.log(`\n✓ Updated imageInventory in details.json`);
    console.log(`  Total images: ${images.length}`);
    console.log(`  Promotional images: ${images.length - 1}`);

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Directory not found: ${eventDir}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
}

// Update all events
async function updateAllInventories() {
  const data = JSON.parse(await fs.readFile(DETAILS_PATH, 'utf8'));

  console.log(`Updating inventory for all ${data.events.length} events...\n`);

  for (const event of data.events) {
    try {
      const eventDir = path.join(
        './public/events',
        event.brand.toLowerCase().replace(/\s+/g, '-'),
        `event-${event.id}`,
        'images'
      );

      const files = await fs.readdir(eventDir);
      const imageFiles = files
        .filter(f => f.match(/^image-\d+\.(png|jpg|jpeg|webp)$/i))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)[0]);
          const numB = parseInt(b.match(/\d+/)[0]);
          return numA - numB;
        });

      const images = imageFiles.map((file, index) => ({
        path: path.join(eventDir, file).replace('./public/', ''),
        order: index,
        isLogo: index === 0
      }));

      const eventIndex = data.events.findIndex(e => e.id === event.id);
      data.events[eventIndex].imageInventory = {
        totalImages: images.length,
        logoFirst: true,
        images
      };

      data.events[eventIndex].assetInventory = {
        ...event.assetInventory,
        hasLogo: images.length > 0,
        logoPath: images[0]?.path || event.assetInventory?.logoPath,
        promotionalImageCount: Math.max(0, images.length - 1),
        lastUpdated: new Date().toISOString()
      };

      console.log(`✓ Event ${event.id}: ${images.length} images`);

    } catch (error) {
      console.log(`✗ Event ${event.id}: ${error.message}`);
    }
  }

  // Update metadata
  data.metadata.lastUpdated = new Date().toISOString();

  // Save updated data
  await fs.writeFile(DETAILS_PATH, JSON.stringify(data, null, 2));

  const totalImages = data.events.reduce((sum, e) => sum + (e.imageInventory?.totalImages || 0), 0);
  console.log(`\n✓ Updated all inventories in details.json`);
  console.log(`  Total images across all events: ${totalImages}`);
  console.log(`  Average per event: ${(totalImages / data.events.length).toFixed(1)}`);
}

// Main
const eventId = process.argv[2];

if (eventId === 'all') {
  updateAllInventories().catch(console.error);
} else if (eventId) {
  updateInventory(eventId).catch(console.error);
} else {
  console.error('Usage: node update-image-inventory.js <event-id|all>');
  process.exit(1);
}
