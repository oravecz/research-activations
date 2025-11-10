#!/usr/bin/env node

/**
 * Rebuild Event Database
 * Keep only validated events and prepare for new additions
 */

import fs from 'fs';

const validationResults = JSON.parse(fs.readFileSync('content-validation-results.json', 'utf-8'));
const eventsData = JSON.parse(fs.readFileSync('events/details.json', 'utf-8'));

// Get valid events
const validEvents = validationResults
  .filter(r => r.validation.isRelevant)
  .map(r => {
    const { validation, ...event } = r;
    return event;
  });

console.log('='.repeat(80));
console.log('DATABASE REBUILD');
console.log('='.repeat(80));
console.log('');
console.log(`Valid events found: ${validEvents.length}`);
console.log(`Events to replace: ${50 - validEvents.length}`);
console.log('');

// Create backup
fs.writeFileSync('events/details.json.full-backup', JSON.stringify(eventsData, null, 2));
console.log('✓ Full backup created: events/details.json.full-backup');

// Create new database with only valid events
const newDatabase = {
  metadata: {
    ...eventsData.metadata,
    totalEvents: validEvents.length,
    targetEvents: 50,
    lastUpdated: new Date().toISOString(),
    notes: `Rebuilt with ${validEvents.length} content-validated events. Need ${50 - validEvents.length} more.`
  },
  events: validEvents
};

fs.writeFileSync('events/details.json', JSON.stringify(newDatabase, null, 2));
console.log('✓ Database rebuilt with validated events only');
console.log('');

console.log('VALID EVENTS RETAINED:');
validEvents.forEach(e => {
  console.log(`  [${e.id}] ${e.brand} - ${e.title}`);
});

console.log('');
console.log('NEXT STEPS:');
console.log(`1. Research ${50 - validEvents.length} new events with verified content`);
console.log('2. Use corporate press releases and direct sources');
console.log('3. Validate each URL manually before adding');
console.log('4. Run: npm run batch:add new-events.json');
console.log('5. Run: npm run events:complete');
