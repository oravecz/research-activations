#!/usr/bin/env node

/**
 * Manual Content Check Helper
 *
 * Provides a list of events with URLs for manual verification
 * Generates a simple checklist for human review
 */

import fs from 'fs';

const eventsData = JSON.parse(fs.readFileSync('events/details.json', 'utf-8'));
const events = eventsData.events;

console.log('='.repeat(80));
console.log('MANUAL CONTENT VERIFICATION CHECKLIST');
console.log('='.repeat(80));
console.log('');
console.log('Instructions:');
console.log('1. Open each URL in a browser');
console.log('2. Check if the page content matches the event title/description');
console.log('3. Mark events as KEEP or REMOVE below');
console.log('');
console.log('Look for:');
console.log('  - Does the page describe this specific activation/store/initiative?');
console.log('  - Is it a 404/error page?');
console.log('  - Is it a generic news archive or press release list?');
console.log('  - Does it redirect to the homepage or a different topic?');
console.log('');
console.log('='.repeat(80));
console.log('');

events.forEach((event, index) => {
  console.log(`\n[${event.id}] ${event.brand} - ${event.title}`);
  console.log(`Date: ${event.date}`);
  console.log(`Location: ${event.location}`);
  console.log(`URL: ${event.url}`);
  console.log(`Category: ${event.category}`);
  console.log(`Decision: [ ] KEEP  [ ] REMOVE`);
  console.log('Notes: _______________________________________________________________');
});

console.log('\n' + '='.repeat(80));
console.log('\nAfter manual review, create a JSON file with IDs to remove:');
console.log('Example: [1, 2, 3, 15, 42]');
console.log('\nThen run: node scripts/remove-by-ids.js ids-to-remove.json');
console.log('='.repeat(80));
