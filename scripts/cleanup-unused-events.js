#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const DETAILS_PATH = './public/events/details.json';
const EVENTS_DIR = './public/events';

async function main() {
  console.log('🧹 Cleaning up unused event folders...\n');

  // Load the current events from details.json
  const data = JSON.parse(await fs.readFile(DETAILS_PATH, 'utf8'));
  const validEventIds = new Set(data.events.map(e => e.id));

  console.log(`Valid event IDs: ${Array.from(validEventIds).sort((a, b) => a - b).join(', ')}`);
  console.log(`Total valid events: ${validEventIds.size}\n`);

  // Get all brand directories
  const brands = await fs.readdir(EVENTS_DIR, { withFileTypes: true });
  const brandDirs = brands.filter(d => d.isDirectory() && d.name !== 'details.json');

  let removedCount = 0;
  let keptCount = 0;
  const removedFolders = [];

  for (const brandDir of brandDirs) {
    const brandPath = path.join(EVENTS_DIR, brandDir.name);

    try {
      const eventDirs = await fs.readdir(brandPath, { withFileTypes: true });

      for (const eventDir of eventDirs) {
        if (!eventDir.isDirectory() || !eventDir.name.startsWith('event-')) {
          continue;
        }

        // Extract event ID from directory name (e.g., "event-22" -> 22)
        const eventId = parseInt(eventDir.name.replace('event-', ''));

        if (!validEventIds.has(eventId)) {
          const eventPath = path.join(brandPath, eventDir.name);
          console.log(`❌ Removing: ${brandDir.name}/${eventDir.name} (ID ${eventId} not in details.json)`);
          await fs.rm(eventPath, { recursive: true, force: true });
          removedFolders.push(`${brandDir.name}/${eventDir.name}`);
          removedCount++;
        } else {
          keptCount++;
        }
      }

      // Check if brand directory is now empty, and remove it if so
      const remainingFiles = await fs.readdir(brandPath);
      if (remainingFiles.length === 0) {
        console.log(`📁 Removing empty brand directory: ${brandDir.name}`);
        await fs.rmdir(brandPath);
      }
    } catch (error) {
      console.error(`Error processing ${brandDir.name}: ${error.message}`);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n✅ Cleanup Complete`);
  console.log(`   Kept: ${keptCount} event folders`);
  console.log(`   Removed: ${removedCount} event folders`);

  if (removedFolders.length > 0) {
    console.log(`\n🗑️  Removed folders:`);
    removedFolders.forEach(f => console.log(`   - ${f}`));
  }

  console.log('');
}

main().catch(console.error);
