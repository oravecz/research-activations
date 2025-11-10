# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

**Brand Activation Research and Presentation System** - A React-based
application for researching, documenting, and presenting 50+ retail brand
activation events from 2023-2025. The system includes automated data collection,
URL validation, visual asset generation, and an interactive presentation
interface.

## Terminology

**Brand Activation Event** - These are special, time-boxed events which are 
promotional in nature and intended to drive an increase in customer 
engagement. They **DO NOT** include new store openings or new product 
launches or normal services offered by the establishment.

## Common Commands

### Development

```bash
npm install              # Install dependencies (Node.js >=18.0.0 required)
npm start                # Start Vite dev server (http://localhost:3000)
npm run dev              # Alias for npm start
npm run build            # Build production bundle to /dist directory
npm run preview          # Preview production build locally (port 3000)
npm test                 # Run Vitest in watch mode
npm run test:ui          # Run Vitest with UI interface
```

### Automated Workflows (Recommended)

```bash
# Complete workflow: validate → setup → logos → inventory → build
npm run workflow:complete

# Setup and download assets
npm run workflow:setup          # Create directories + download logos
npm run events:complete         # Setup + logos + inventory

# Individual operations
npm run events:validate         # Validate all 50 event URLs
npm run events:logos            # Download all brand logos
npm run events:status           # Check logo download status
npm run events:inventory        # Update imageInventory in database

# Batch operations
npm run batch:validate          # Validate new events JSON file
npm run batch:add               # Add new events to database
npm run cleanup:failed          # Remove events with failed URLs

# Deployment
npm run deploy:prep             # Complete workflow + preview
```


### Testing Production Build

```bash
npm run build           # Build production bundle to /dist
npm run preview         # Preview production build with Vite (port 3000)
```

## Architecture

### Data Flow Architecture

The system follows a **data-centric architecture** where event data flows from
JSON → React components → user interface:

1. **Data Source**: `events/details.json` - Central data file containing all 50
   events with metadata, validation status, and asset inventory
2. **Asset Storage**: `events/[brand-slug]/event-[id]/` - Organized by brand,
   each event has its own directory containing logo.png, slide-image.png, and
   metadata.json
3. **Presentation Layer**: React component (`src/PresentationDeck.jsx`)
   dynamically loads event data and renders an interactive slide deck
4. **Build Output**: Static files in `/dist` directory deployed to GitHub Pages
   via Vite build

### Key Design Patterns

**Event Data Schema Pattern**

- All event objects follow a consistent schema (id, brand, title, date,
  location, description, activation, url, category, storeScope,
  promotionMethods)
- Each event includes `assetInventory` object tracking available visual assets (
  logos, promotional images, screenshots, collages)
- The schema in `events/SCHEMA.md` is authoritative - follow it for any data
  modifications

**Asset Generation Pipeline**

1. Brand logos downloaded → `events/[brand]/event-[id]/logo.png`
2. Logos processed into 16:9 slide images →
   `events/[brand]/event-[id]/slide-image.png`
3. Metadata tracked in `events/[brand]/event-[id]/metadata.json`
4. Asset paths stored in `events/details.json` under
   `assetInventory.collagePath`

**React Component Architecture**

- Main component (`PresentationDeck.jsx`) handles presentation logic and slide
  navigation
- `MasonryImageGrid.jsx` component displays multiple event images in responsive
  grid layout
- Uses React hooks for state management (useState, useEffect, useMemo, useRef)
- Keyboard navigation (arrow keys) and click navigation supported
- Category filtering system dynamically generates filter buttons from event data
- Image loading handled with error states and fallback UI
- **Dual display modes**: Masonry grid (if imageInventory exists) or single
  image fallback

### Critical File Relationships

**Data Dependencies:**

- `src/PresentationDeck.jsx` reads from → `{BASE_URL}events/details.json` at
  runtime (uses `import.meta.env.BASE_URL` for correct path)
- Event slides reference images via → `assetInventory.collagePath` field with
  base URL prefix
- Scripts read/write from → `events/details.json` and individual event
  directories
- **CRITICAL**: All asset paths must use `import.meta.env.BASE_URL` to work with
  GitHub Pages subdirectory deployment

**Build Process:**

1. Vite builds application from `src/` directory with entry point `index.html`
2. `public/` directory (including `events/`) served during development and
   copied to `dist/` during build
3. Tailwind CSS processed via PostCSS during build
4. Base path `/research-activations/` applied to all asset URLs via
   `vite.config.js`
5. Runtime code uses `import.meta.env.BASE_URL` to dynamically resolve paths
6. GitHub Actions workflow deploys `dist/` directory to GitHub Pages

### Directory Organization

```
research-activations/
├── events/                          # Event data and assets (SOURCE OF TRUTH)
│   ├── details.json                 # Central event database (50 events)
│   ├── SCHEMA.md                    # Data schema documentation
│   ├── research-report.md           # Research methodology and findings
│   └── [brand-slug]/                # Brand-specific directories
│       └── event-[id]/              # Event-specific directories
│           ├── metadata.json        # Asset tracking metadata
│           ├── logo.png             # Brand logo (variable size)
│           └── slide-image.png      # Generated 16:9 slide (1920x1080)
│
├── public/                          # Static assets served by Vite
│   └── events/                      # Symlinked or copied from events/
│
├── src/                             # React application source
│   ├── PresentationDeck.jsx         # Main presentation component (345 lines)
│   ├── index.jsx                    # React app entry point
│   └── index.css                    # Global styles with Tailwind directives
│
├── index.html                       # Vite entry HTML (references /src/index.jsx)
│
├── scripts/                         # Node.js utility scripts
│   ├── validate-url.js              # HTTP validation with paywall detection
│   ├── generate-download-instructions.js  # Create event-specific download guides
│   ├── download-event-[ID]-images.js      # Event-specific image downloaders
│   ├── generate-slide-images.js     # Logo → 16:9 slide generation (Sharp)
│   └── process-visual-assets.js     # Batch asset processing
│
├── specs/                           # Project specifications
│   └── 2025-01-09-brand-activation-research/
│       ├── spec.md                  # Feature specification
│       ├── tasks.md                 # Implementation task breakdown
│       └── planning/requirements.md # Detailed requirements
│
├── vite.config.js                   # Vite configuration (base path, build settings)
├── vitest.config.js                 # Vitest test configuration (jsdom environment)
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration (Tailwind + Autoprefixer)
│
└── .github/workflows/
    └── deploy.yml                   # GitHub Actions CI/CD pipeline
```

## Tech Stack

### Core Technologies

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.3 (fast ES module-based build)
- **Test Framework**: Vitest 2.1.8 (with jsdom environment)
- **Styling**: Tailwind CSS 3.4.15 (processed via PostCSS)
- **Icons**: Lucide React 0.460.0
- **Image Processing**: Sharp 0.33.5 (for slide generation scripts)
- **Layout Library**: Masonry Layout 4.2.2 + imagesLoaded 5.0.0 (responsive
  grid)

### Build Configuration

- **Vite Plugin**: @vitejs/plugin-react (React Fast Refresh support)
- **PostCSS**: Tailwind CSS + Autoprefixer
- **Base Path**: `/research-activations/` (configured in vite.config.js for
  GitHub Pages)
- **Base URL Access**: Use `import.meta.env.BASE_URL` in runtime code for
  dynamic path resolution
- **ES Modules**: Package type set to "module" for native ESM support

### Asset Processing

- **Image Collection**: Playwright MCP for browser automation and image extraction
- **Logo Sources**: Brand websites, Google Images, official newsrooms
- **Image Format**: PNG (preferred), JPEG (acceptable)
- **Target Dimensions**: Minimum 300px width, prefer 980px+ for quality
- **Masonry Grid**: Displays 1 logo + up to 8 promotional images per event

### Deployment

- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Hosting**: GitHub Pages (static site)
- **Build Output**: `/dist` directory (Vite default)

### Development Tools

- **Node.js**: >=18.0.0 required
- **Package Manager**: npm
- **Dev Server**: Vite dev server with HMR (port 3000, auto-opens browser)

## Working with Event Data

### Adding New Events

1. Add event object to `events/details.json` following the schema in
   `events/SCHEMA.md`
2. Increment `metadata.totalEvents` and update `metadata.lastUpdated`
3. Create directory: `events/[brand-slug]/event-[id]/`
4. Download or generate assets (logo.png, slide-image.png)
5. Run validation: `node scripts/validate-url.js [event-url]`
6. Update `assetInventory` in event object with asset paths

### Modifying the Presentation

The presentation component (`src/PresentationDeck.jsx`) consists of:

- **TitleSlide** (lines 111-139): Summary statistics and event counts
- **EventSlide** (lines 141-247): Individual event display with image and
  details
- **Navigation Controls** (lines 284-321): Previous/Next buttons and slide
  counter
- **Filter Bar** (lines 252-272): Category filtering system
- **Slide Indicators** (lines 324-340): Progress dots for visual navigation

**Path Resolution:**

- Data fetching (lines 14-34): Uses `import.meta.env.BASE_URL` +
  `events/details.json`
- Image paths via `getImagePath()` function (lines 72-80): Prepends
  `import.meta.env.BASE_URL` to all paths
- **IMPORTANT**: Always use `import.meta.env.BASE_URL` for any runtime asset
  paths to support subdirectory deployment

### Validation and Asset Scripts

**URL Validation (`scripts/validate-url.js`)**

- Checks HTTP status codes (200/300-level = valid)
- Detects paywalls and region blocking
- Can validate single URL or batch from JSON file
- Excludes events that fail validation

**Slide Image Generation (`scripts/generate-slide-images.js`)**

- Reads brand logo from `events/[brand]/event-[id]/logo.png`
- Creates 1920x1080 background with brand colors (lines 38-79)
- Centers logo at 40% width of canvas
- Outputs to `events/[brand]/event-[id]/slide-image.png`
- Updates metadata.json with generation timestamp and dimensions

## Important Constraints

### Data Integrity

- `events/details.json` is the single source of truth - never modify without
  validating schema
- All URLs must pass validation before inclusion - run `validate-url.js` for any
  new events
- Asset paths in `assetInventory.collagePath` must be relative to project root (
  not absolute)
- Event IDs must be unique integers 1-50

### Image Requirements

- All slide images MUST be 16:9 aspect ratio (1920x1080)
- Brand logos can be any size (will be resized during slide generation)
- Supported format: PNG
- File naming convention: `logo.png` and `slide-image.png` (exact names
  required)

### Build and Deployment

- GitHub Actions workflow triggers on push to `main` or `master` branch
- Build requires Node.js 18+ (specified in package.json engines)
- The `/dist` directory is gitignored - never commit build artifacts
- Vite base path set to `/research-activations/` for GitHub Pages subdirectory
  deployment
- `public/events/` directory must exist and contain `details.json` for builds

## Testing and Validation

### Running Tests

- **Watch Mode**: `npm test` - Runs Vitest in watch mode, re-runs on file
  changes
- **UI Mode**: `npm run test:ui` - Opens interactive Vitest UI in browser
- **Test Environment**: jsdom (configured in vitest.config.js)
- **Setup File**: `src/setupTests.js` (runs before all tests)

### Pre-Deployment Checklist

1. Run `npm run build` to verify build succeeds without errors
2. Check `events/details.json` validates against schema (all required fields
   present)
3. Verify all `assetInventory.collagePath` values point to existing files
4. Test locally with `npm run preview` before pushing
5. Confirm all event URLs are accessible (no 404s, paywalls, or region blocks)

### Common Issues

**Build Failures**

- Check Node.js version (must be >=18.0.0)
- Run `rm -rf node_modules package-lock.json && npm install` to refresh
  dependencies
- Verify `public/events/details.json` exists and is valid JSON
- Check Vite config base path matches deployment subdirectory (
  `/research-activations/`)
- Ensure Tailwind CSS is properly configured in postcss.config.js

**Asset Loading Errors (404s)**

- Verify all runtime asset paths use `import.meta.env.BASE_URL` prefix
- Check that `vite.config.js` base path matches GitHub repository name
- Inspect browser Network tab to see actual URLs being requested
- Ensure `public/` directory contents are being copied to `dist/` during build

**Missing Images**

- Check `assetInventory.collagePath` in events/details.json matches actual file
  location
- Regenerate slide images with `node scripts/generate-slide-images.js --all`
- Verify image files are 16:9 aspect ratio (1920x1080 pixels)

**Deployment Issues**

- Check GitHub Actions logs in repository's Actions tab
- Verify GitHub Pages is enabled in repository settings (source: GitHub Actions)
- Confirm workflow has proper permissions (contents: read, pages: write,
  id-token: write)
- Ensure workflow uploads from `./dist` directory (Vite output, not `./build`)
- Verify base path in vite.config.js matches GitHub Pages repository path

## Research Methodology Notes

**Event Inclusion Criteria:**

- Store-level activations only (2023+)
- Must be accessible from multiple retail locations (luxury brands excluded if
  single-location)
- URL must be publicly accessible without paywalls or region blocking
- Focus on experiential retail, community programming, sustainability, and
  technology integration

**Event Categories:**

- footwear, apparel, home-goods, beauty, general-retail, technology, outdoor,
  sporting-goods, grocery, accessories

**Asset Priorities:**

1. Official brand logos from brand websites or newsrooms - always first (image-0.png)
   in Masonry grid
2. Promotional images from official sources (brand newsrooms, press releases) -
   highest quality
3. Promotional images from Google Images search (up to 8 images via Playwright MCP)
4. Masonry grid layout displays 1 logo + 8 images in responsive grid
5. Each event should have 9 total images for optimal presentation

## Masonry Grid Image Collection

### New Approach (Recommended)

Events can display multiple images in a Masonry grid layout instead of a single
image:

1. **Logo First**: Company logo always in upper-left position (image-0.png)
2. **Promotional Images**: Up to 8 additional images from event website (
   image-1.png through image-8.png)
3. **Responsive Grid**: 3 columns on large screens, 2 on medium, 1 on small
4. **Backward Compatible**: Falls back to single image if no imageInventory
   exists

### Collection Workflow

For detailed instructions on collecting images for events, see the **"Image Collection
Workflow for New Events"** section below. The recommended approach uses Playwright MCP
to systematically collect high-quality promotional images.

Quick overview:
1. Generate event-specific download instructions
2. Use Playwright browser tools to search and extract images
3. Create download script and fetch images
4. Verify quality and integration

See full workflow documentation in the dedicated section below.

### Event Data Structure with Images

```json
{
  "id": 1,
  "brand": "Nike",
  "imageInventory": {
    "totalImages": 5,
    "logoFirst": true,
    "images": [
      {
        "filename": "image-0.png",
        "path": "events/nike/event-1/images/image-0.png",
        "order": 0,
        "isLogo": true
      },
      {
        "filename": "image-1.png",
        "path": "events/nike/event-1/images/image-1.png",
        "order": 1,
        "isLogo": false
      }
    ]
  }
}
```

### Components

- **generate-download-instructions.js**: Creates event-specific download instruction
  files with search queries and Playwright workflows
- **MasonryImageGrid.jsx**: React component using Masonry.js for responsive grid
  layout
- **PresentationDeck.jsx**: Checks for imageInventory and renders Masonry grid
  or fallback

See the **"Image Collection Workflow for New Events"** section below for complete
documentation.

## Image Collection Workflow for New Events

When adding new events to the system, follow this standardized workflow to collect
high-quality promotional images using Playwright MCP integration.

### Step 1: Generate Download Instructions

After adding a new event to `events/details.json`, generate a customized download
instruction file:

```bash
node scripts/generate-download-instructions.js
```

This creates `public/events/[brand-slug]/event-[id]/images/DOWNLOAD_INSTRUCTIONS.md`
containing:
- **Recommended Image Sources** (prioritized by quality)
- **Event-specific search queries** (PRIMARY, SECONDARY, TERTIARY)
- **Three-step image extraction workflow** with Playwright code samples
- **Quality criteria** for image selection
- **Download procedures** and example scripts

### Step 2: Prioritize Image Sources (CRITICAL)

The updated instructions guide you to find images in order of quality:

1. **Event Venue/Planning Websites (BEST)**
   - Parasol Projects, event planning sites, venue websites
   - Have professional event photography galleries
   - Extract with `img[src*="uploads"]` or `img[src*="cdn"]` selectors
   - Example: https://parasolprojects.com/pop-ups/anthropologie-weddings-x-pinterest/

2. **Official Brand Newsrooms & Press Releases**
   - Brand press releases with embedded event photos
   - Brand social media (Instagram, Pinterest, Twitter)
   - Interior design/architecture blogs covering the event

3. **Retail News & Trade Publications**
   - RetailTouchPoints, WWD, Interior Design magazines
   - Articles about the event often contain embedded images

4. **Google Images (LAST RESORT)**
   - Only use if primary sources don't yield results
   - Often returns thumbnails and generic product photos

### Step 3: Follow the Instruction File Workflow

Open the generated `DOWNLOAD_INSTRUCTIONS.md` file and follow the three-step
image extraction workflow:

**STEP 1: Navigate to Event Source**
```javascript
// 1. Find event URL from search results
// 2. Use browser_navigate to go directly to event page
mcp__playwright__browser_navigate({
  url: "https://parasolprojects.com/pop-ups/anthropologie-weddings-x-pinterest/"
})

// 3. Extract images with improved code that targets high-quality sources
() => {
  const images = [];
  document.querySelectorAll('img[src*="uploads"], img[src*="cdn"], img[src*="cloudinary"]').forEach((img) => {
    if (img.naturalWidth >= 300 && img.src && !img.src.includes('logo') && !img.src.includes('icon')) {
      images.push({
        src: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        alt: img.alt || img.title || ''
      });
    }
  });
  // Remove duplicates by URL
  const unique = {};
  images.forEach(img => {
    if (!unique[img.src]) unique[img.src] = img;
  });
  return Object.values(unique);
}
```

**STEP 2: Extract from Gallery/Lightbox Elements**
```javascript
// For events with lightbox/gallery plugins
() => {
  const images = [];
  document.querySelectorAll('[data-src], img.gallery-item, img.lightbox').forEach((img) => {
    const src = img.dataset.src || img.src;
    if (src && src.includes('http')) {
      images.push({ src: src, width: img.naturalWidth, height: img.naturalHeight });
    }
  });
  return images.length > 0 ? images : "No gallery found, try manual scrolling";
}
```

**STEP 3: Fallback to Google Images**
```javascript
// Only if primary sources don't work
mcp__playwright__browser_navigate({
  url: "https://www.google.com/search?q=Brand+Event+Name+activation+photos&tbm=isch"
})

// Extract generic images as last resort
() => {
  const images = [];
  document.querySelectorAll('img[src]').forEach((img) => {
    if (img.naturalWidth >= 300 && img.src && img.alt) {
      images.push({
        src: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        alt: img.alt
      });
    }
  });
  return [...new Set(images.map(i => i.src))].slice(0, 20);
}
```

### Step 4: Download Images

Create a download script specific to the event:

```javascript
// scripts/download-event-[ID]-images.js
import https from 'https';
import fs from 'fs';
import path from 'path';

const images = [
  { url: 'https://...', filename: 'image-1.webp', alt: 'Description' },
  // ... up to 8 promotional images (total 9 with logo)
];

const outputDir = path.join(__dirname, '..', 'public', 'events',
  '[brand-slug]', 'event-[id]', 'images');

// Download logic...
```

Run the script:
```bash
node scripts/download-event-[ID]-images.js
```

### Step 5: Verify Image Quality

Check downloaded images meet quality criteria:

✅ **GOOD**:
- Photos of actual in-store activations or events
- Event setup/installation photos
- Customer participation photos
- Workshop/experience/activity photos
- Store-specific branded displays
- Professional event photography (high resolution)

❌ **AVOID**:
- Generic product catalog photos
- Unrelated brand content
- Low resolution images (< 300px width)
- Images with watermarks
- Stock photos (Getty Images, Shutterstock, etc.)
- Logos only (already have logo as image-0)
- Blurry or poorly lit photos

### Step 6: Verify Integration

1. Check images directory structure:
   ```bash
   ls -lh public/events/[brand-slug]/event-[id]/images/
   ```

2. Verify `imageInventory` in `events/details.json` is correct:
   ```json
   "imageInventory": {
     "totalImages": 9,
     "logoFirst": true,
     "images": [
       { "path": "events/[brand]/event-[id]/images/image-0.png", "order": 0, "isLogo": true },
       { "path": "events/[brand]/event-[id]/images/image-1.webp", "order": 1, "isLogo": false },
       // ... image-2 through image-8
     ]
   }
   ```

3. Test in presentation:
   ```bash
   npm start
   # Navigate to the event slide to verify masonry grid displays correctly
   ```

### Image Collection Best Practices

1. **Target 9 Total Images**: 1 logo (image-0.png) + 8 promotional images
2. **High Resolution**: Minimum 300px width, prefer 980px+ for quality
3. **Relevance**: Images must show the actual activation/event, not just products
4. **Variety**: Mix of setup photos, customer participation, and branded displays
5. **Source Priority**:
   - Event venue/planning websites (highest quality, professional photography)
   - Official brand newsrooms/press releases (verified quality)
   - Retail news publications (trusted sources)
   - Google Images (lowest quality, use only as fallback)

### Automation Script

For batch image collection across multiple events:

```bash
# Generate instructions for all events
node scripts/generate-download-instructions.js

# Then work through each event's DOWNLOAD_INSTRUCTIONS.md file in order:
# 1. Open public/events/[brand]/event-[id]/images/DOWNLOAD_INSTRUCTIONS.md
# 2. Follow the three-step extraction workflow
# 3. Download images and update details.json
```

### Troubleshooting

**No Good Images Found:**
- Check if you're using PRIMARY search results first (most specific)
- Look for site-specific searches: `site:parasolprojects.com`, `site:retailtouchpoints.com`
- Try SECONDARY and TERTIARY search queries from instructions
- Search for the brand's retail experience or store activations generally
- Look for press releases or news articles about the event
- Check brand's official Instagram/Twitter for event photos

**Images Behind Paywalls:**
- Skip paywall-protected sources
- Try alternative news sources
- Use brand's official channels instead (usually free)
- Check if archive.org has cached versions

**Image Quality Issues:**
- Verify `img.naturalWidth >= 300` pixels minimum
- Use site-specific extraction for high-quality CDN images
- Click through to original source from search results for higher resolution
- Use `browser_evaluate` with `img[src*="uploads"]` to target gallery images
- Avoid generic stock photo sites

**Wrong Images Extracted:**
- Refine selectors: `img[src*="uploads"]`, `img[src*="cdn"]` target hosted images
- Exclude logos: add `!img.src.includes('logo')`
- Remove duplicates: use unique URL map before returning results
- Test extraction on source page first before bulk downloading
- I am running the Vite DEv server on port 3000. Before any task that requires browser verification, check that the server is running. If it is not, **DO NOT** start your own server and instead ask the user to start the dev server using `npm start`