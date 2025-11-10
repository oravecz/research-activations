import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const detailsPath = path.join(__dirname, '..', 'public', 'events', 'details.json');

// Read the current details.json
const data = JSON.parse(fs.readFileSync(detailsPath, 'utf-8'));

// Find event 73
const event73Index = data.events.findIndex(e => e.id === 73);

if (event73Index === -1) {
  console.error('Event 73 not found');
  process.exit(1);
}

// Update imageInventory
const imageInventory = {
  totalImages: 9,
  logoFirst: true,
  images: [
    {
      path: 'events/cb2/event-73/images/image-0.png',
      order: 0,
      isLogo: true
    },
    {
      path: 'events/cb2/event-73/images/image-1.png',
      order: 1,
      isLogo: false
    },
    {
      path: 'events/cb2/event-73/images/image-2.png',
      order: 2,
      isLogo: false
    },
    {
      path: 'events/cb2/event-73/images/image-3.png',
      order: 3,
      isLogo: false
    },
    {
      path: 'events/cb2/event-73/images/image-4.png',
      order: 4,
      isLogo: false
    },
    {
      path: 'events/cb2/event-73/images/image-5.png',
      order: 5,
      isLogo: false
    },
    {
      path: 'events/cb2/event-73/images/image-6.png',
      order: 6,
      isLogo: false
    },
    {
      path: 'events/cb2/event-73/images/image-7.png',
      order: 7,
      isLogo: false
    },
    {
      path: 'events/cb2/event-73/images/image-8.png',
      order: 8,
      isLogo: false
    }
  ]
};

// Update the event
data.events[event73Index].imageInventory = imageInventory;
data.events[event73Index].assetInventory.promotionalImageCount = 8;

// Update metadata
data.metadata.lastUpdated = new Date().toISOString();

// Write back to file
fs.writeFileSync(detailsPath, JSON.stringify(data, null, 2) + '\n');

console.log('✓ Updated event 73 imageInventory with 9 images (1 logo + 8 promotional)');
console.log('✓ Updated metadata.lastUpdated');
