#!/usr/bin/env node

/**
 * Image Collage Generator
 *
 * Creates 16:9 aspect ratio collage images for presentation slides.
 * Combines brand logo (prominent at top) with 3-5 promotional images.
 *
 * Usage:
 *   node scripts/create-collage.js --logo <path> --images <path1,path2,path3> --output <path>
 *   node scripts/create-collage.js --event-dir <events/brand/event-id>
 *   node scripts/create-collage.js --batch <events-json>
 *
 * Requirements:
 *   This script uses the 'sharp' library for image processing.
 *   Install with: npm install sharp
 */

const fs = require('fs');
const path = require('path');

/**
 * Check if sharp is available
 */
function checkSharpAvailability() {
  try {
    require.resolve('sharp');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Create 16:9 collage layout configuration
 * @param {number} imageCount - Number of promotional images (3-5)
 * @returns {Object} Layout configuration
 */
function createLayoutConfig(imageCount) {
  // Target dimensions for 16:9 aspect ratio
  const targetWidth = 1920;
  const targetHeight = 1080;

  // Logo section at top (20% of height)
  const logoHeight = Math.floor(targetHeight * 0.2);
  const logoY = 0;

  // Image grid section (80% of height)
  const gridTop = logoHeight;
  const gridHeight = targetHeight - logoHeight;

  // Configure grid based on image count
  let layout;
  if (imageCount <= 3) {
    // 3 images: horizontal row
    layout = {
      type: 'horizontal-row',
      images: [
        { x: 0, y: gridTop, width: targetWidth / 3, height: gridHeight },
        { x: targetWidth / 3, y: gridTop, width: targetWidth / 3, height: gridHeight },
        { x: (targetWidth * 2) / 3, y: gridTop, width: targetWidth / 3, height: gridHeight }
      ]
    };
  } else if (imageCount === 4) {
    // 4 images: 2x2 grid
    const cellWidth = targetWidth / 2;
    const cellHeight = gridHeight / 2;
    layout = {
      type: '2x2-grid',
      images: [
        { x: 0, y: gridTop, width: cellWidth, height: cellHeight },
        { x: cellWidth, y: gridTop, width: cellWidth, height: cellHeight },
        { x: 0, y: gridTop + cellHeight, width: cellWidth, height: cellHeight },
        { x: cellWidth, y: gridTop + cellHeight, width: cellWidth, height: cellHeight }
      ]
    };
  } else {
    // 5 images: 2 top row, 3 bottom row
    const topCellWidth = targetWidth / 2;
    const bottomCellWidth = targetWidth / 3;
    const cellHeight = gridHeight / 2;
    layout = {
      type: '2-3-grid',
      images: [
        { x: 0, y: gridTop, width: topCellWidth, height: cellHeight },
        { x: topCellWidth, y: gridTop, width: topCellWidth, height: cellHeight },
        { x: 0, y: gridTop + cellHeight, width: bottomCellWidth, height: cellHeight },
        { x: bottomCellWidth, y: gridTop + cellHeight, width: bottomCellWidth, height: cellHeight },
        { x: bottomCellWidth * 2, y: gridTop + cellHeight, width: bottomCellWidth, height: cellHeight }
      ]
    };
  }

  return {
    targetWidth,
    targetHeight,
    aspectRatio: '16:9',
    logoSection: {
      x: 0,
      y: logoY,
      width: targetWidth,
      height: logoHeight
    },
    imageGrid: layout
  };
}

/**
 * Generate instructions for manual collage creation
 */
function generateManualInstructions(logoPath, imagePaths, outputPath) {
  const config = createLayoutConfig(imagePaths.length);

  console.log('='.repeat(80));
  console.log('IMAGE COLLAGE CREATION INSTRUCTIONS');
  console.log('='.repeat(80));
  console.log('');
  console.log('This script provides layout instructions for creating a 16:9 collage.');
  console.log('To generate collages automatically, install the sharp library:');
  console.log('');
  console.log('  npm install sharp');
  console.log('');
  console.log('Manual Creation Instructions:');
  console.log('');
  console.log(`Target Dimensions: ${config.targetWidth}x${config.targetHeight} (16:9 aspect ratio)`);
  console.log('');
  console.log('Layout:');
  console.log('');
  console.log('1. Logo Section (Top 20%):');
  console.log(`   - Position: ${config.logoSection.x}, ${config.logoSection.y}`);
  console.log(`   - Size: ${config.logoSection.width}x${config.logoSection.height}`);
  console.log(`   - Source: ${logoPath}`);
  console.log(`   - Background: White or brand color`);
  console.log(`   - Logo should be centered and prominent`);
  console.log('');
  console.log('2. Image Grid (Bottom 80%):');
  console.log(`   - Layout Type: ${config.imageGrid.type}`);
  console.log(`   - Images: ${imagePaths.length}`);
  console.log('');

  config.imageGrid.images.forEach((pos, index) => {
    if (index < imagePaths.length) {
      console.log(`   Image ${index + 1}:`);
      console.log(`     - Position: x=${Math.floor(pos.x)}, y=${Math.floor(pos.y)}`);
      console.log(`     - Size: ${Math.floor(pos.width)}x${Math.floor(pos.height)}`);
      console.log(`     - Source: ${imagePaths[index]}`);
      console.log('');
    }
  });

  console.log(`Output: ${outputPath}`);
  console.log('');
  console.log('Using Image Processing Tools:');
  console.log('');
  console.log('For Photoshop/GIMP:');
  console.log('1. Create new canvas at 1920x1080');
  console.log('2. Add white background layer');
  console.log('3. Place logo in top section, centered');
  console.log('4. Place images in grid according to positions above');
  console.log('5. Resize images to fit cells (cover mode, crop as needed)');
  console.log('6. Export as PNG or JPEG');
  console.log('');
  console.log('For ImageMagick (command line):');
  console.log('  Use montage command with custom geometry for grid layout');
  console.log('  Then composite logo on top section');
  console.log('');
  console.log('='.repeat(80));

  // Save config for reference
  const configPath = outputPath.replace(/\.(png|jpg|jpeg)$/, '.layout.json');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({
    ...config,
    logoPath,
    imagePaths,
    outputPath,
    generatedAt: new Date().toISOString()
  }, null, 2));

  console.log('');
  console.log(`Layout configuration saved to: ${configPath}`);
  console.log('');
}

/**
 * Create collage using sharp library
 */
async function createCollageWithSharp(logoPath, imagePaths, outputPath) {
  const sharp = require('sharp');
  const config = createLayoutConfig(imagePaths.length);

  console.log(`Creating ${config.aspectRatio} collage with sharp...`);
  console.log(`  Logo: ${logoPath}`);
  console.log(`  Images: ${imagePaths.length}`);
  console.log(`  Output: ${outputPath}`);

  try {
    // Create white background
    const background = await sharp({
      create: {
        width: config.targetWidth,
        height: config.targetHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();

    // Prepare composites array
    const composites = [];

    // Add logo to top section
    if (fs.existsSync(logoPath)) {
      const logoBuffer = await sharp(logoPath)
        .resize({
          width: Math.floor(config.logoSection.width * 0.8), // 80% of section width
          height: Math.floor(config.logoSection.height * 0.8), // 80% of section height
          fit: 'inside',
          withoutEnlargement: false
        })
        .toBuffer();

      const logoMeta = await sharp(logoBuffer).metadata();
      const logoX = Math.floor((config.logoSection.width - logoMeta.width) / 2);
      const logoY = Math.floor((config.logoSection.height - logoMeta.height) / 2);

      composites.push({
        input: logoBuffer,
        top: logoY,
        left: logoX
      });
    }

    // Add promotional images to grid
    for (let i = 0; i < imagePaths.length && i < config.imageGrid.images.length; i++) {
      const imagePath = imagePaths[i];
      const position = config.imageGrid.images[i];

      if (fs.existsSync(imagePath)) {
        const imageBuffer = await sharp(imagePath)
          .resize({
            width: Math.floor(position.width),
            height: Math.floor(position.height),
            fit: 'cover',
            position: 'center'
          })
          .toBuffer();

        composites.push({
          input: imageBuffer,
          top: Math.floor(position.y),
          left: Math.floor(position.x)
        });
      } else {
        console.warn(`  Warning: Image not found: ${imagePath}`);
      }
    }

    // Compose final image
    await sharp(background)
      .composite(composites)
      .toFile(outputPath);

    console.log(`Success! Collage created: ${outputPath}`);
    console.log(`  Dimensions: ${config.targetWidth}x${config.targetHeight}`);
    console.log(`  Aspect Ratio: ${config.aspectRatio}`);

    return true;
  } catch (error) {
    console.error(`Error creating collage: ${error.message}`);
    return false;
  }
}

/**
 * Process event directory
 */
async function processEventDirectory(eventDir) {
  console.log(`Processing event directory: ${eventDir}`);

  // Look for assets
  const logoPath = path.join(eventDir, 'logo.png');
  const imagePaths = [];

  // Find promo images
  for (let i = 1; i <= 5; i++) {
    const promoPath = path.join(eventDir, `promo-${i}.jpg`);
    if (fs.existsSync(promoPath)) {
      imagePaths.push(promoPath);
    }
  }

  // Check for screenshot as fallback
  if (imagePaths.length === 0) {
    const screenshotPath = path.join(eventDir, 'screenshot.png');
    if (fs.existsSync(screenshotPath)) {
      imagePaths.push(screenshotPath);
    }
  }

  const outputPath = path.join(eventDir, 'slide-image.png');

  if (!fs.existsSync(logoPath)) {
    console.error(`Error: Logo not found: ${logoPath}`);
    return false;
  }

  if (imagePaths.length === 0) {
    console.error(`Error: No promotional images or screenshots found in ${eventDir}`);
    return false;
  }

  console.log(`  Found logo: ${logoPath}`);
  console.log(`  Found ${imagePaths.length} images`);

  const hasSharp = checkSharpAvailability();
  if (hasSharp) {
    return await createCollageWithSharp(logoPath, imagePaths, outputPath);
  } else {
    generateManualInstructions(logoPath, imagePaths, outputPath);
    return false;
  }
}

/**
 * Batch process events from JSON
 */
async function processBatch(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File not found: ${jsonPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const events = data.events || [];

  console.log(`Processing ${events.length} events from ${jsonPath}...`);
  console.log('');

  const results = [];

  for (const event of events) {
    const brandSlug = event.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const eventDir = path.join('events', brandSlug, `event-${event.id}`);

    if (!fs.existsSync(eventDir)) {
      console.log(`Skipping ${event.brand} - directory not found: ${eventDir}`);
      results.push({ event, success: false, reason: 'Directory not found' });
      continue;
    }

    console.log(`[${event.id}] ${event.brand} - ${event.title}`);
    const success = await processEventDirectory(eventDir);
    results.push({ event, success });
    console.log('');
  }

  // Summary
  console.log('='.repeat(80));
  console.log('BATCH PROCESSING SUMMARY');
  console.log('='.repeat(80));
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(80));

  return results;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('Image Collage Generator for Brand Activation Presentations');
    console.log('');
    console.log('Usage:');
    console.log('  Custom collage:    node scripts/create-collage.js --logo <path> --images <path1,path2,...> --output <path>');
    console.log('  Event directory:   node scripts/create-collage.js --event-dir <events/brand/event-id>');
    console.log('  Batch processing:  node scripts/create-collage.js --batch <events-json>');
    console.log('');
    console.log('Options:');
    console.log('  --logo <path>        Path to brand logo image');
    console.log('  --images <paths>     Comma-separated paths to promotional images (3-5 images)');
    console.log('  --output <path>      Output path for collage');
    console.log('  --event-dir <path>   Process single event directory');
    console.log('  --batch <json>       Process all events from JSON file');
    console.log('  --help               Show this help message');
    console.log('');
    console.log('Requirements:');
    console.log('  Install sharp library for automatic collage generation:');
    console.log('    npm install sharp');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/create-collage.js --logo logo.png --images img1.jpg,img2.jpg,img3.jpg --output collage.png');
    console.log('  node scripts/create-collage.js --event-dir events/nike/event-1');
    console.log('  node scripts/create-collage.js --batch events/details.json');
    return;
  }

  const hasSharp = checkSharpAvailability();
  if (!hasSharp) {
    console.warn('Warning: sharp library not found. Will generate instructions only.');
    console.warn('Install with: npm install sharp');
    console.warn('');
  }

  if (args[0] === '--batch') {
    if (!args[1]) {
      console.error('Error: --batch requires a JSON file path');
      process.exit(1);
    }
    await processBatch(args[1]);
    return;
  }

  if (args[0] === '--event-dir') {
    if (!args[1]) {
      console.error('Error: --event-dir requires a directory path');
      process.exit(1);
    }
    const success = await processEventDirectory(args[1]);
    process.exit(success ? 0 : 1);
    return;
  }

  // Custom collage mode
  const logoIndex = args.indexOf('--logo');
  const imagesIndex = args.indexOf('--images');
  const outputIndex = args.indexOf('--output');

  if (logoIndex === -1 || imagesIndex === -1 || outputIndex === -1) {
    console.error('Error: --logo, --images, and --output are all required');
    console.error('Usage: node scripts/create-collage.js --logo <path> --images <path1,path2,...> --output <path>');
    process.exit(1);
  }

  const logoPath = args[logoIndex + 1];
  const imagePaths = args[imagesIndex + 1].split(',').map(p => p.trim());
  const outputPath = args[outputIndex + 1];

  if (imagePaths.length < 3 || imagePaths.length > 5) {
    console.error('Error: Please provide 3-5 promotional images');
    process.exit(1);
  }

  if (hasSharp) {
    const success = await createCollageWithSharp(logoPath, imagePaths, outputPath);
    process.exit(success ? 0 : 1);
  } else {
    generateManualInstructions(logoPath, imagePaths, outputPath);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { createLayoutConfig, createCollageWithSharp, processEventDirectory, processBatch };
