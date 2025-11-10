#!/usr/bin/env node

/**
 * Remove Failed Events
 * Removes events with inaccessible URLs from details.json
 */

import fs from 'fs';

const resultsPath = 'url-check-results.json';
const eventsPath = 'events/details.json';
const backupPath = 'events/details.json.backup';

// Load results
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
const inaccessible = results.filter(r => !r.accessible);

console.log(`Found ${inaccessible.length} inaccessible events to remove`);
console.log('');

// Load events
const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
const originalCount = eventsData.events.length;

// Create backup
fs.writeFileSync(backupPath, JSON.stringify(eventsData, null, 2));
console.log(`✓ Backup created: ${backupPath}`);

// Get IDs to remove
const removeIds = new Set(inaccessible.map(e => e.id));

// Filter out inaccessible events
const validEvents = eventsData.events.filter(e => !removeIds.has(e.id));

console.log('');
console.log('Removing events:');
inaccessible.forEach(e => {
  console.log(`  [${e.id}] ${e.brand} - ${e.title}`);
});

// Update metadata
eventsData.events = validEvents;
eventsData.metadata.totalEvents = validEvents.length;
eventsData.metadata.lastUpdated = new Date().toISOString();
eventsData.metadata.footwearEvents = validEvents.filter(e => e.category === 'footwear').length;
eventsData.metadata.footwearPercentage = Math.round((eventsData.metadata.footwearEvents / validEvents.length) * 100);
eventsData.metadata.notes = `${validEvents.length} validated brand activation events from 2023+. ${inaccessible.length} events removed due to inaccessible URLs on ${new Date().toISOString().split('T')[0]}.`;

// Save
fs.writeFileSync(eventsPath, JSON.stringify(eventsData, null, 2));

console.log('');
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Original events: ${originalCount}`);
console.log(`Removed: ${inaccessible.length}`);
console.log(`Remaining: ${validEvents.length}`);
console.log(`Need to add: ${50 - validEvents.length}`);
console.log('');
console.log(`✓ Updated: ${eventsPath}`);
console.log(`✓ Backup: ${backupPath}`);
