#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const eventsData = JSON.parse(fs.readFileSync('events/details.json', 'utf-8'));
const events = eventsData.events;

const withLogos = [];
const missingLogos = [];

events.forEach(event => {
  const brandSlug = event.brand.toLowerCase().replace(/\s+/g, '-');
  const logoPath = `events/${brandSlug}/event-${event.id}/images/image-0.png`;

  if (fs.existsSync(logoPath)) {
    withLogos.push(event);
  } else {
    missingLogos.push(event);
  }
});

console.log('='.repeat(80));
console.log('LOGO DOWNLOAD STATUS');
console.log('='.repeat(80));
console.log('');
console.log(`✓ Logos downloaded: ${withLogos.length}/50`);
console.log(`✗ Missing logos: ${missingLogos.length}/50`);
console.log('');

if (missingLogos.length > 0) {
  console.log('MISSING LOGOS:');
  missingLogos.forEach(event => {
    console.log(`  [${event.id}] ${event.brand}`);
  });
  console.log('');
}

console.log('Progress: ' + '█'.repeat(withLogos.length) + '░'.repeat(missingLogos.length));
