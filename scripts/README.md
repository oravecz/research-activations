# Scripts Documentation

This directory contains utility scripts for the Brand Activation Research and Presentation System.

## Available Scripts

### 1. validate-url.js

URL validation utility that checks accessibility, detects paywalls, and identifies region blocks.

**Usage:**
```bash
# Single URL validation
node scripts/validate-url.js https://example.com

# Batch validation from file
node scripts/validate-url.js --batch urls.txt

# Validate all events from JSON
node scripts/validate-url.js --json events/details.json

# Save results to file
node scripts/validate-url.js --batch urls.txt --output validation-results.json

# Show help
node scripts/validate-url.js --help
```

**Features:**
- HTTP status code checking (excludes 404, 403, 500+ errors)
- 30-second timeout protection
- Paywall detection (basic heuristics)
- Region block detection
- Detailed reporting with color-coded output
- JSON export for integration with other tools

**Exit Codes:**
- 0: All URLs passed validation
- 1: One or more URLs failed validation

### 2. capture-screenshot.js

Screenshot capture wrapper for Playwright MCP with 768x1024 browser configuration.

**Usage:**
```bash
# Single screenshot
node scripts/capture-screenshot.js https://example.com output.png

# Batch processing from events JSON
node scripts/capture-screenshot.js --batch events/details.json

# Test Playwright MCP connectivity
node scripts/capture-screenshot.js --test

# Custom dimensions
node scripts/capture-screenshot.js https://example.com output.png --width 1024 --height 768

# Show help
node scripts/capture-screenshot.js --help
```

**Features:**
- Playwright MCP integration instructions
- 768x1024 default browser dimensions (optimized for presentation slides)
- Batch processing configuration generation
- Full-page screenshot support
- Configuration file generation for reproducibility

**Note:** This script provides a wrapper interface. Actual screenshot capture requires Playwright MCP tools:
- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_resize`
- `mcp__playwright__browser_take_screenshot`

### 3. create-collage.js

Image collage generator for creating 16:9 presentation slides with brand logo and promotional images.

**Usage:**
```bash
# Create custom collage
node scripts/create-collage.js --logo logo.png --images img1.jpg,img2.jpg,img3.jpg --output collage.png

# Process event directory
node scripts/create-collage.js --event-dir events/nike/event-1

# Batch process all events
node scripts/create-collage.js --batch events/details.json

# Show help
node scripts/create-collage.js --help
```

**Features:**
- 16:9 aspect ratio output (1920x1080)
- Automatic layout optimization for 3-5 images
- Brand logo placement at top (20% of height)
- Image grid layouts:
  - 3 images: horizontal row
  - 4 images: 2x2 grid
  - 5 images: 2 top + 3 bottom rows
- PNG output format
- Sharp library for high-quality image processing

**Requirements:**
```bash
npm install sharp
```

**Layout Configurations:**

*3 Images (Horizontal Row):*
```
+------------------+
|      LOGO        |  20% height
+------------------+
|  1  |  2  |  3  |  80% height
+------------------+
```

*4 Images (2x2 Grid):*
```
+------------------+
|      LOGO        |  20% height
+------------------+
|   1   |    2     |  40% height
+------------------+
|   3   |    4     |  40% height
+------------------+
```

*5 Images (2-3 Grid):*
```
+------------------+
|      LOGO        |  20% height
+------------------+
|    1    |    2   |  40% height
+------------------+
| 3  |  4  |  5   |  40% height
+------------------+
```

## NPM Scripts

Convenient shortcuts defined in package.json:

```bash
# URL validation
npm run validate-url -- https://example.com
npm run test-validation

# Screenshot capture
npm run capture-screenshot -- --test
npm run test-screenshot

# Collage generation
npm run create-collage -- --help
```

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm

### Setup
```bash
# Install dependencies
npm install

# Make scripts executable (Unix/Mac)
chmod +x scripts/*.js

# Test installation
npm run test-validation
npm run test-screenshot
```

## Workflow Integration

### Typical Research Workflow

1. **Identify Events**: Research and document brand activation events

2. **Validate URLs**: Check all source URLs for accessibility
   ```bash
   node scripts/validate-url.js --json events/details.json --output validation-report.json
   ```

3. **Create Event Directories**: Set up directory structure for each validated event
   ```bash
   mkdir -p events/brand-name/event-id
   ```

4. **Collect Assets**:
   - Download brand logos
   - Download promotional images from event websites
   - Capture screenshots for events with insufficient images

5. **Generate Collages**: Create 16:9 presentation slides
   ```bash
   node scripts/create-collage.js --batch events/details.json
   ```

### Event Directory Structure

Each event should have:
```
events/brand-name/event-id/
├── metadata.json          # Asset tracking and validation info
├── logo.png              # Brand logo
├── promo-1.jpg           # Promotional image 1
├── promo-2.jpg           # Promotional image 2
├── promo-3.jpg           # Promotional image 3
├── promo-4.jpg           # Optional promotional image 4
├── promo-5.jpg           # Optional promotional image 5
├── screenshot.png        # Fallback screenshot (if promo images unavailable)
└── slide-image.png       # Generated 16:9 collage
```

## Testing

### URL Validation Test
```bash
# Test with valid URL
node scripts/validate-url.js https://example.com

# Test with 404
node scripts/validate-url.js https://example.com/404

# Test with batch file
echo "https://example.com" > test-urls.txt
echo "https://example.com/404" >> test-urls.txt
node scripts/validate-url.js --batch test-urls.txt
```

### Screenshot Test
```bash
# Test Playwright MCP connectivity
node scripts/capture-screenshot.js --test

# Capture test screenshot (requires Playwright MCP)
node scripts/capture-screenshot.js https://example.com test.png
```

### Collage Test
```bash
# Create test images
node scripts/create-test-images.js

# Generate test collage
node scripts/create-collage.js \
  --logo scripts/test-collage/logo.png \
  --images scripts/test-collage/promo-1.jpg,scripts/test-collage/promo-2.jpg,scripts/test-collage/promo-3.jpg \
  --output scripts/test-collage/test-collage.png
```

## Troubleshooting

### Sharp Installation Issues

If sharp fails to install:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm install sharp --ignore-scripts
npm rebuild sharp
```

### Playwright MCP Not Available

The capture-screenshot.js script generates instructions and configurations even when Playwright MCP is not available. Use the generated JSON files to manually execute screenshots through the MCP interface.

### URL Validation False Positives

The validation script uses basic heuristics for paywall/region block detection. Review failed validations manually if you suspect false positives. You can adjust the detection patterns in `validate-url.js`:

```javascript
const PAYWALL_INDICATORS = [
  'paywall',
  'subscribe',
  // Add or remove patterns as needed
];
```

## Output Files

### Validation Report (JSON)
```json
{
  "validatedAt": "2025-01-09T10:00:00Z",
  "summary": {
    "total": 50,
    "accessible": 45,
    "failed": 5,
    "withPaywalls": 2,
    "withRegionBlocks": 1
  },
  "results": [...]
}
```

### Screenshot Batch Plan (JSON)
```json
{
  "generatedAt": "2025-01-09T10:00:00Z",
  "totalEvents": 50,
  "captures": [
    {
      "eventId": 1,
      "brand": "Nike",
      "title": "Air Max Day 2025",
      "url": "https://...",
      "outputPath": "events/nike/event-1/screenshot.png",
      "outputDir": "events/nike/event-1"
    }
  ]
}
```

### Collage Layout Config (JSON)
```json
{
  "targetWidth": 1920,
  "targetHeight": 1080,
  "aspectRatio": "16:9",
  "logoSection": {
    "x": 0,
    "y": 0,
    "width": 1920,
    "height": 216
  },
  "imageGrid": {
    "type": "horizontal-row",
    "images": [...]
  },
  "logoPath": "events/nike/event-1/logo.png",
  "imagePaths": [...],
  "outputPath": "events/nike/event-1/slide-image.png",
  "generatedAt": "2025-01-09T12:00:00Z"
}
```

## Best Practices

1. **Always validate URLs first** before including events in the dataset
2. **Save validation reports** for audit trail and documentation
3. **Use batch processing** for efficiency when working with multiple events
4. **Keep source images** (logos, promo images) even after generating collages
5. **Track timestamps** in metadata.json for all asset downloads
6. **Verify collage output** visually before using in presentations
7. **Use consistent naming** for event directories (lowercase, hyphenated)

## Future Enhancements

Potential improvements for future versions:

- Automated logo downloading from brand websites
- AI-powered image selection from promotional materials
- Automated brand color extraction for collage backgrounds
- PDF export for presentation slides
- Integration with presentation tools (PowerPoint, Google Slides)
- Real-time URL monitoring for link rot detection
