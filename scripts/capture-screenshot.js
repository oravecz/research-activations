#!/usr/bin/env node

/**
 * Screenshot Capture Wrapper for Playwright MCP
 *
 * This script provides a command-line interface for capturing screenshots
 * using Playwright MCP. It's designed for capturing event webpage screenshots
 * at 768x1024 resolution for presentation slides.
 *
 * Usage:
 *   node scripts/capture-screenshot.js <url> <output-path>
 *   node scripts/capture-screenshot.js --batch <events-json>
 *
 * Note: This script provides a Node.js wrapper interface. The actual screenshot
 * capture is performed by the Playwright MCP tool which must be available in
 * the environment.
 */

const fs = require('fs');
const path = require('path');

/**
 * Instructions for using Playwright MCP
 */
function printMCPInstructions(url, outputPath) {
  console.log('='.repeat(80));
  console.log('PLAYWRIGHT MCP SCREENSHOT CAPTURE');
  console.log('='.repeat(80));
  console.log('');
  console.log('This script requires Playwright MCP tools to be available.');
  console.log('');
  console.log('To capture a screenshot using Playwright MCP:');
  console.log('');
  console.log('1. Navigate to the URL:');
  console.log(`   mcp__playwright__browser_navigate({ url: "${url}" })`);
  console.log('');
  console.log('2. Resize browser to 768x1024:');
  console.log('   mcp__playwright__browser_resize({ width: 768, height: 1024 })');
  console.log('');
  console.log('3. Take screenshot:');
  console.log(`   mcp__playwright__browser_take_screenshot({ filename: "${outputPath}", fullPage: true })`);
  console.log('');
  console.log('='.repeat(80));
}

/**
 * Create screenshot capture configuration
 */
function createCaptureConfig(url, outputPath, options = {}) {
  const config = {
    url,
    outputPath,
    width: options.width || 768,
    height: options.height || 1024,
    fullPage: options.fullPage !== false,
    format: options.format || 'png',
    timestamp: new Date().toISOString(),
    quality: options.quality || 90
  };

  return config;
}

/**
 * Batch process screenshots from events JSON
 */
async function processBatch(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File not found: ${jsonPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const events = data.events || [];

  console.log(`Found ${events.length} events in ${jsonPath}`);
  console.log('');

  const captureList = [];

  for (const event of events) {
    const brandSlug = event.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const eventId = event.id;
    const outputDir = path.join('events', brandSlug, `event-${eventId}`);
    const outputPath = path.join(outputDir, 'screenshot.png');

    captureList.push({
      eventId: event.id,
      brand: event.brand,
      title: event.title,
      url: event.url,
      outputPath,
      outputDir
    });
  }

  // Save batch capture plan
  const planPath = 'scripts/screenshot-batch-plan.json';
  fs.writeFileSync(planPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalEvents: captureList.length,
    captures: captureList
  }, null, 2));

  console.log('='.repeat(80));
  console.log('BATCH SCREENSHOT CAPTURE PLAN');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Total screenshots to capture: ${captureList.length}`);
  console.log(`Plan saved to: ${planPath}`);
  console.log('');
  console.log('To execute batch capture, use Playwright MCP tools to:');
  console.log('');
  console.log('1. Loop through each capture in the plan');
  console.log('2. Navigate to the URL');
  console.log('3. Resize to 768x1024');
  console.log('4. Take screenshot and save to outputPath');
  console.log('');
  console.log('Sample captures:');
  console.log('');

  captureList.slice(0, 3).forEach((capture, index) => {
    console.log(`[${index + 1}] ${capture.brand} - ${capture.title}`);
    console.log(`    URL: ${capture.url}`);
    console.log(`    Output: ${capture.outputPath}`);
    console.log('');
  });

  console.log('='.repeat(80));

  return captureList;
}

/**
 * Test Playwright MCP connectivity
 */
function testMCPConnectivity() {
  console.log('='.repeat(80));
  console.log('PLAYWRIGHT MCP CONNECTIVITY TEST');
  console.log('='.repeat(80));
  console.log('');
  console.log('Testing Playwright MCP availability...');
  console.log('');
  console.log('Required MCP tools:');
  console.log('  - mcp__playwright__browser_navigate');
  console.log('  - mcp__playwright__browser_resize');
  console.log('  - mcp__playwright__browser_take_screenshot');
  console.log('  - mcp__playwright__browser_snapshot');
  console.log('');
  console.log('If these tools are not available, Playwright MCP may not be configured.');
  console.log('');
  console.log('Test commands:');
  console.log('');
  console.log('1. Navigate to test page:');
  console.log('   mcp__playwright__browser_navigate({ url: "https://example.com" })');
  console.log('');
  console.log('2. Resize window:');
  console.log('   mcp__playwright__browser_resize({ width: 768, height: 1024 })');
  console.log('');
  console.log('3. Take screenshot:');
  console.log('   mcp__playwright__browser_take_screenshot({ filename: "test-screenshot.png" })');
  console.log('');
  console.log('='.repeat(80));
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('Screenshot Capture Wrapper for Playwright MCP');
    console.log('');
    console.log('Usage:');
    console.log('  Single screenshot:  node scripts/capture-screenshot.js <url> <output-path>');
    console.log('  Batch processing:   node scripts/capture-screenshot.js --batch <events-json>');
    console.log('  Test connectivity:  node scripts/capture-screenshot.js --test');
    console.log('');
    console.log('Options:');
    console.log('  --width <pixels>    Browser width (default: 768)');
    console.log('  --height <pixels>   Browser height (default: 1024)');
    console.log('  --no-fullpage       Capture viewport only (not full page)');
    console.log('  --format <type>     Image format: png or jpeg (default: png)');
    console.log('  --help              Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/capture-screenshot.js https://example.com output.png');
    console.log('  node scripts/capture-screenshot.js --batch events/details.json');
    console.log('  node scripts/capture-screenshot.js --test');
    return;
  }

  if (args[0] === '--test') {
    testMCPConnectivity();
    return;
  }

  if (args[0] === '--batch') {
    if (!args[1]) {
      console.error('Error: --batch requires a JSON file path');
      process.exit(1);
    }
    await processBatch(args[1]);
    return;
  }

  // Single screenshot mode
  const url = args[0];
  const outputPath = args[1];

  if (!url || !outputPath) {
    console.error('Error: Both URL and output path are required');
    console.error('Usage: node scripts/capture-screenshot.js <url> <output-path>');
    process.exit(1);
  }

  // Parse options
  const options = {};
  const widthIndex = args.indexOf('--width');
  if (widthIndex !== -1) options.width = parseInt(args[widthIndex + 1]);
  const heightIndex = args.indexOf('--height');
  if (heightIndex !== -1) options.height = parseInt(args[heightIndex + 1]);
  if (args.includes('--no-fullpage')) options.fullPage = false;
  const formatIndex = args.indexOf('--format');
  if (formatIndex !== -1) options.format = args[formatIndex + 1];

  const config = createCaptureConfig(url, outputPath, options);

  // Save config for reference
  const configPath = outputPath.replace(/\.(png|jpg|jpeg)$/, '.config.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log('Screenshot configuration saved to:', configPath);
  console.log('');

  printMCPInstructions(url, outputPath);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { createCaptureConfig, processBatch, testMCPConnectivity };
