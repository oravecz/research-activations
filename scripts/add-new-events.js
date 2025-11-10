#!/usr/bin/env node

/**
 * Add New Events
 * Merges new events from a JSON file into events/details.json
 */

import fs from 'fs';
import path from 'path';

const newEventsPath = process.argv[2] || 'new-events-batch-1.json';
const eventsPath = 'events/details.json';

// Load new events
const newEvents = JSON.parse(fs.readFileSync(newEventsPath, 'utf-8'));
console.log(`Loading ${newEvents.length} new events from ${newEventsPath}`);

// Load existing events
const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
const originalCount = eventsData.events.length;

// Add new events
eventsData.events.push(...newEvents);

// Update metadata
eventsData.metadata.totalEvents = eventsData.events.length;
eventsData.metadata.lastUpdated = new Date().toISOString();
eventsData.metadata.footwearEvents = eventsData.events.filter(e => e.category === 'footwear').length;
eventsData.metadata.footwearPercentage = Math.round((eventsData.metadata.footwearEvents / eventsData.events.length) * 100);

// Save
fs.writeFileSync(eventsPath, JSON.stringify(eventsData, null, 2));

console.log('');
console.log('New events added:');
newEvents.forEach(e => {
  console.log(`  [${e.id}] ${e.brand} - ${e.title}`);
});

console.log('');
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Previous total: ${originalCount}`);
console.log(`Added: ${newEvents.length}`);
console.log(`New total: ${eventsData.events.length}`);
console.log(`Remaining to add: ${50 - eventsData.events.length}`);
console.log('');
console.log(`✓ Updated: ${eventsPath}`);
