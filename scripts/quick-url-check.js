#!/usr/bin/env node

/**
 * Quick URL Check - Fast validation using HEAD requests
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';
import fs from 'fs';

async function checkUrl(urlString, timeout = 10000) {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlString);
      const protocol = url.protocol === 'https:' ? https : http;

      const options = {
        method: 'HEAD',
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URLChecker/1.0)'
        }
      };

      const req = protocol.request(urlString, options, (res) => {
        resolve({
          url: urlString,
          status: res.statusCode,
          accessible: res.statusCode >= 200 && res.statusCode < 400
        });
      });

      req.on('error', (error) => {
        resolve({
          url: urlString,
          status: null,
          accessible: false,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url: urlString,
          status: null,
          accessible: false,
          error: 'Timeout'
        });
      });

      req.end();
    } catch (error) {
      resolve({
        url: urlString,
        status: null,
        accessible: false,
        error: error.message
      });
    }
  });
}

async function main() {
  const eventsPath = process.argv[2] || 'events/details.json';
  const data = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
  const events = data.events || [];

  console.log(`Checking ${events.length} URLs...`);
  console.log('');

  const results = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    process.stdout.write(`[${i + 1}/${events.length}] ${event.brand}... `);

    const result = await checkUrl(event.url);
    results.push({ ...event, ...result });

    if (result.accessible) {
      console.log(`✓ ${result.status}`);
    } else {
      console.log(`✗ ${result.error || result.status}`);
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  const accessible = results.filter(r => r.accessible);
  const inaccessible = results.filter(r => !r.accessible);

  console.log(`Accessible: ${accessible.length}`);
  console.log(`Inaccessible: ${inaccessible.length}`);
  console.log('');

  if (inaccessible.length > 0) {
    console.log('FAILED URLS:');
    inaccessible.forEach(r => {
      console.log(`  [${r.id}] ${r.brand} - ${r.title}`);
      console.log(`      ${r.url}`);
      console.log(`      Error: ${r.error || `HTTP ${r.status}`}`);
    });
  }

  // Save results
  fs.writeFileSync('url-check-results.json', JSON.stringify(results, null, 2));
  console.log('');
  console.log('Results saved to: url-check-results.json');
}

main().catch(console.error);
