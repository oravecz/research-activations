import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const detailsPath = path.join(__dirname, '..', 'public', 'events', 'details.json');
const eventsDir = path.join(__dirname, '..', 'public', 'events');

// Read current details.json
const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));

// Scan filesystem for actual images
const imagesByEventId = {};

details.events.forEach(event => {
  const eventDir = path.join(eventsDir, event.brand.toLowerCase().replace(/[\s&']/g, (match) => {
    if (match === ' ') return '-';
    if (match === '&') return '-';
    if (match === "'") return '';
    return match;
  }), `event-${event.id}`);

  const imagesDir = path.join(eventDir, 'images');

  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir)
      .filter(f => /^image-\d+\.(png|jpg|jpeg)$/i.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });

    if (files.length > 0) {
      const images = files.map((file, index) => ({
        path: `events/${event.brand.toLowerCase().replace(/[\s&']/g, (match) => {
          if (match === ' ') return '-';
          if (match === '&') return '-';
          if (match === "'") return '';
          return match;
        })}/event-${event.id}/images/${file}`,
        order: index,
        isLogo: index === 0
      }));

      imagesByEventId[event.id] = {
        totalImages: images.length,
        logoFirst: images.length > 0,
        images: images
      };
    }
  }
});

// Update details.json
details.events.forEach(event => {
  if (imagesByEventId[event.id]) {
    event.imageInventory = imagesByEventId[event.id];
  } else {
    // Remove imageInventory if no images found
    delete event.imageInventory;
  }
});

// Write updated details.json
fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2));

console.log('Updated details.json with actual image counts:');
console.log('');

details.events.forEach(event => {
  if (event.imageInventory) {
    console.log(`✓ Event ${event.id} (${event.brand}): ${event.imageInventory.totalImages} images`);
  } else {
    console.log(`✗ Event ${event.id} (${event.brand}): No images found`);
  }
});
