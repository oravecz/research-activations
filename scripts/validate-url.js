#!/usr/bin/env node

/**
 * URL Validation Utility
 *
 * Validates URLs for accessibility, checking for:
 * - HTTP status codes (200, 300-level acceptable; 404, 403, 500+ rejected)
 * - Timeouts (30 second limit)
 * - Paywall detection (basic heuristics)
 * - Region blocking detection
 *
 * Usage:
 *   node scripts/validate-url.js <url>
 *   node scripts/validate-url.js --batch urls.txt
 *   node scripts/validate-url.js --json events/details.json
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');

// Paywall and region block detection patterns
const PAYWALL_INDICATORS = [
  'paywall',
  'subscribe',
  'subscription required',
  'premium content',
  'members only',
  'sign in to read',
  'login to continue',
  'create an account',
  'register to read'
];

const REGION_BLOCK_INDICATORS = [
  'not available in your region',
  'not available in your country',
  'content is not available',
  'geo-restricted',
  'access denied',
  'this content is blocked'
];

/**
 * Validate a single URL
 * @param {string} urlString - URL to validate
 * @returns {Promise<Object>} Validation result
 */
async function validateUrl(urlString) {
  const result = {
    url: urlString,
    accessible: false,
    statusCode: null,
    statusMessage: null,
    hasPaywall: false,
    hasRegionBlock: false,
    issues: [],
    validatedAt: new Date().toISOString(),
    responseTime: null
  };

  try {
    const startTime = Date.now();
    const urlObj = new URL(urlString);
    const client = urlObj.protocol === 'https:' ? https : http;

    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout after 30 seconds'));
      }, 30000);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      };

      const req = client.request(options, (res) => {
        clearTimeout(timeout);

        let body = '';
        res.on('data', (chunk) => {
          // Limit body capture to first 50KB for performance
          if (body.length < 50000) {
            body += chunk.toString();
          }
        });

        res.on('end', () => {
          resolve({ statusCode: res.statusCode, statusMessage: res.statusMessage, body });
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      req.end();
    });

    result.responseTime = Date.now() - startTime;
    result.statusCode = response.statusCode;
    result.statusMessage = response.statusMessage;

    // Check status code
    if (response.statusCode >= 200 && response.statusCode < 400) {
      result.accessible = true;
    } else if (response.statusCode === 404) {
      result.issues.push('404 Not Found - URL does not exist');
    } else if (response.statusCode === 403) {
      result.issues.push('403 Forbidden - Access denied');
    } else if (response.statusCode >= 500) {
      result.issues.push(`${response.statusCode} Server Error`);
    } else {
      result.issues.push(`Unexpected status code: ${response.statusCode}`);
    }

    // Check for paywalls
    const bodyLower = response.body.toLowerCase();
    for (const indicator of PAYWALL_INDICATORS) {
      if (bodyLower.includes(indicator)) {
        result.hasPaywall = true;
        result.issues.push(`Paywall detected: "${indicator}" found in content`);
        result.accessible = false;
        break;
      }
    }

    // Check for region blocking
    for (const indicator of REGION_BLOCK_INDICATORS) {
      if (bodyLower.includes(indicator)) {
        result.hasRegionBlock = true;
        result.issues.push(`Region block detected: "${indicator}" found in content`);
        result.accessible = false;
        break;
      }
    }

  } catch (error) {
    result.issues.push(`Error: ${error.message}`);
    result.accessible = false;
  }

  return result;
}

/**
 * Validate multiple URLs from a file
 * @param {string} filePath - Path to file with URLs (one per line)
 * @returns {Promise<Array>} Array of validation results
 */
async function validateBatch(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const urls = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  console.log(`Validating ${urls.length} URLs from ${filePath}...`);
  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].trim();
    console.log(`[${i + 1}/${urls.length}] Validating: ${url}`);
    const result = await validateUrl(url);
    results.push(result);

    // Brief delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Validate URLs from events/details.json
 * @param {string} jsonPath - Path to events/details.json
 * @returns {Promise<Array>} Array of validation results
 */
async function validateFromJson(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const events = data.events || [];

  console.log(`Validating ${events.length} event URLs from ${jsonPath}...`);
  const results = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    console.log(`[${i + 1}/${events.length}] Validating: ${event.brand} - ${event.title}`);
    console.log(`  URL: ${event.url}`);

    const result = await validateUrl(event.url);
    result.eventId = event.id;
    result.brand = event.brand;
    result.title = event.title;
    results.push(result);

    // Brief delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Generate validation report
 * @param {Array} results - Array of validation results
 * @returns {Object} Summary statistics
 */
function generateReport(results) {
  const summary = {
    total: results.length,
    accessible: 0,
    failed: 0,
    withPaywalls: 0,
    withRegionBlocks: 0,
    with404: 0,
    with403: 0,
    serverErrors: 0
  };

  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION REPORT');
  console.log('='.repeat(80));

  results.forEach((result) => {
    if (result.accessible) {
      summary.accessible++;
    } else {
      summary.failed++;
    }

    if (result.hasPaywall) summary.withPaywalls++;
    if (result.hasRegionBlock) summary.withRegionBlocks++;
    if (result.statusCode === 404) summary.with404++;
    if (result.statusCode === 403) summary.with403++;
    if (result.statusCode >= 500) summary.serverErrors++;

    const status = result.accessible ? '✓ PASS' : '✗ FAIL';
    const color = result.accessible ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`\n${color}${status}${reset} ${result.url}`);
    if (result.eventId) {
      console.log(`  Event: ${result.brand} - ${result.title}`);
    }
    console.log(`  Status: ${result.statusCode} ${result.statusMessage || ''}`);
    console.log(`  Response Time: ${result.responseTime}ms`);

    if (result.issues.length > 0) {
      console.log(`  Issues:`);
      result.issues.forEach(issue => console.log(`    - ${issue}`));
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total URLs:        ${summary.total}`);
  console.log(`Accessible:        ${summary.accessible} (${((summary.accessible/summary.total)*100).toFixed(1)}%)`);
  console.log(`Failed:            ${summary.failed} (${((summary.failed/summary.total)*100).toFixed(1)}%)`);
  console.log(`With Paywalls:     ${summary.withPaywalls}`);
  console.log(`With Region Blocks: ${summary.withRegionBlocks}`);
  console.log(`404 Not Found:     ${summary.with404}`);
  console.log(`403 Forbidden:     ${summary.with403}`);
  console.log(`Server Errors:     ${summary.serverErrors}`);
  console.log('='.repeat(80) + '\n');

  return summary;
}

/**
 * Save validation results to JSON file
 * @param {Array} results - Array of validation results
 * @param {string} outputPath - Output file path
 */
function saveResults(results, outputPath) {
  const output = {
    validatedAt: new Date().toISOString(),
    summary: {
      total: results.length,
      accessible: results.filter(r => r.accessible).length,
      failed: results.filter(r => !r.accessible).length,
      withPaywalls: results.filter(r => r.hasPaywall).length,
      withRegionBlocks: results.filter(r => r.hasRegionBlock).length
    },
    results
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Results saved to: ${outputPath}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage:');
    console.error('  node scripts/validate-url.js <url>');
    console.error('  node scripts/validate-url.js --batch <file>');
    console.error('  node scripts/validate-url.js --json <events-json>');
    console.error('  node scripts/validate-url.js --help');
    process.exit(1);
  }

  if (args[0] === '--help') {
    console.log('URL Validation Utility');
    console.log('');
    console.log('Usage:');
    console.log('  Single URL:    node scripts/validate-url.js <url>');
    console.log('  Batch file:    node scripts/validate-url.js --batch <file>');
    console.log('  Events JSON:   node scripts/validate-url.js --json <events-json>');
    console.log('');
    console.log('Options:');
    console.log('  --output <file>  Save results to JSON file');
    console.log('  --help           Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/validate-url.js https://example.com');
    console.log('  node scripts/validate-url.js --batch urls.txt --output validation-results.json');
    console.log('  node scripts/validate-url.js --json events/details.json');
    return;
  }

  let results = [];
  let outputPath = null;

  // Check for output flag
  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputPath = args[outputIndex + 1];
  }

  if (args[0] === '--batch') {
    if (!args[1]) {
      console.error('Error: --batch requires a file path');
      process.exit(1);
    }
    results = await validateBatch(args[1]);
  } else if (args[0] === '--json') {
    if (!args[1]) {
      console.error('Error: --json requires a file path');
      process.exit(1);
    }
    results = await validateFromJson(args[1]);
  } else {
    // Single URL validation
    const result = await validateUrl(args[0]);
    results = [result];
  }

  generateReport(results);

  if (outputPath) {
    saveResults(results, outputPath);
  }

  // Exit with error code if any URLs failed
  const failed = results.filter(r => !r.accessible).length;
  process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { validateUrl, validateBatch, validateFromJson };
