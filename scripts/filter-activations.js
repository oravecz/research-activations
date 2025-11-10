#!/usr/bin/env node

/**
 * Filter Events - Keep Only True Activations
 * Removes store openings and keeps only special promotional activations
 */

import fs from 'fs';

const keepIds = JSON.parse(fs.readFileSync('activation-ids-to-keep.json', 'utf-8'));
const eventsData = JSON.parse(fs.readFileSync('events/details.json', 'utf-8'));

// Filter to keep only activation IDs
const activations = eventsData.events.filter(e => keepIds.includes(e.id));
const removed = eventsData.events.filter(e => !keepIds.includes(e.id));

console.log('='.repeat(80));
console.log('FILTERING TO TRUE ACTIVATIONS');
console.log('='.repeat(80));
console.log('');

console.log('KEEPING (True Activations):');
activations.forEach(e => {
  console.log(`  ✓ [${e.id}] ${e.brand} - ${e.title}`);
});

console.log('');
console.log('REMOVING (Store Openings):');
removed.forEach(e => {
  console.log(`  ✗ [${e.id}] ${e.brand} - ${e.title}`);
  
  // Remove event folder
  const brandSlug = e.brand.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
  const eventPath = `events/${brandSlug}/event-${e.id}`;
  
  if (fs.existsSync(eventPath)) {
    fs.rmSync(eventPath, { recursive: true, force: true });
    console.log(`      Removed folder: ${eventPath}`);
  }
});

// Create new database
const newDatabase = {
  metadata: {
    ...eventsData.metadata,
    totalEvents: activations.length,
    targetEvents: 50,
    lastUpdated: new Date().toISOString(),
    notes: `Filtered to ${activations.length} true brand activations. Removed ${removed.length} store openings.`
  },
  events: activations
};

// Backup current database
fs.writeFileSync('events/details.json.pre-filter-backup', JSON.stringify(eventsData, null, 2));
console.log('');
console.log('✓ Backup created: events/details.json.pre-filter-backup');

// Write filtered database
fs.writeFileSync('events/details.json', JSON.stringify(newDatabase, null, 2));
console.log('✓ Database updated with activations only');

console.log('');
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Kept: ${activations.length} activations`);
console.log(`Removed: ${removed.length} store openings`);
console.log(`New total: ${activations.length}`);
console.log(`Need to add: ${50 - activations.length} more activations`);
