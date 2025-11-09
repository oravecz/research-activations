# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Brand Activation Research and Presentation System** - A React-based application for researching, documenting, and presenting 50+ retail brand activation events from 2023-2025. The system includes automated data collection, URL validation, visual asset generation, and an interactive presentation interface.

## Common Commands

### Development
```bash
npm install              # Install dependencies (Node.js >=18.0.0 required)
npm start                # Start React development server (http://localhost:3000)
npm run build            # Build production bundle to /build directory
npm test                 # Run test suite
```

### Asset Generation Scripts
```bash
# URL validation
node scripts/validate-url.js https://example.com
node scripts/validate-url.js --json events/details.json

# Screenshot capture (using Playwright)
node scripts/capture-screenshot.js --test
node scripts/capture-screenshot.js --url https://example.com --output path/to/file.png

# Slide image generation (logo-based 16:9 images)
node scripts/generate-slide-images.js --all
node scripts/generate-slide-images.js --range 1-25
node scripts/generate-slide-images.js --event 1

# Brand logo batch download
node scripts/batch-download-logos.js

# Image collage creation
node scripts/create-collage.js
```

### Testing Deployment Locally
```bash
npm run build           # Build production bundle
npx serve -s build      # Serve production build locally
```

## Architecture

### Data Flow Architecture

The system follows a **data-centric architecture** where event data flows from JSON → React components → user interface:

1. **Data Source**: `events/details.json` - Central data file containing all 50 events with metadata, validation status, and asset inventory
2. **Asset Storage**: `events/[brand-slug]/event-[id]/` - Organized by brand, each event has its own directory containing logo.png, slide-image.png, and metadata.json
3. **Presentation Layer**: React component (`src/PresentationDeck.jsx`) dynamically loads event data and renders an interactive slide deck
4. **Build Output**: Static files in `/build` directory deployed to GitHub Pages

### Key Design Patterns

**Event Data Schema Pattern**
- All event objects follow a consistent schema (id, brand, title, date, location, description, activation, url, category, storeScope, promotionMethods)
- Each event includes `assetInventory` object tracking available visual assets (logos, promotional images, screenshots, collages)
- The schema in `events/SCHEMA.md` is authoritative - follow it for any data modifications

**Asset Generation Pipeline**
1. Brand logos downloaded → `events/[brand]/event-[id]/logo.png`
2. Logos processed into 16:9 slide images → `events/[brand]/event-[id]/slide-image.png`
3. Metadata tracked in `events/[brand]/event-[id]/metadata.json`
4. Asset paths stored in `events/details.json` under `assetInventory.collagePath`

**React Component Architecture**
- Single-file component (`PresentationDeck.jsx`) handles all presentation logic
- Uses React hooks for state management (useState, useEffect, useMemo)
- Keyboard navigation (arrow keys) and click navigation supported
- Category filtering system dynamically generates filter buttons from event data
- Image loading handled with error states and fallback UI

### Critical File Relationships

**Data Dependencies:**
- `src/PresentationDeck.jsx` reads from → `public/events/details.json` (copied from `events/details.json` during build)
- Event slides reference images via → `assetInventory.collagePath` field in each event object
- Scripts read/write from → `events/details.json` and individual event directories

**Build Process:**
1. React Scripts builds application from `src/` directory
2. `public/` directory (including `public/events/`) copied to `build/` output
3. GitHub Actions workflow deploys `build/` directory to GitHub Pages

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
├── public/                          # Static assets for React app
│   ├── events/                      # Symlinked or copied from events/
│   └── index.html                   # HTML template
│
├── src/                             # React application source
│   ├── PresentationDeck.jsx         # Main presentation component (345 lines)
│   └── index.js                     # React app entry point
│
├── scripts/                         # Node.js utility scripts
│   ├── validate-url.js              # HTTP validation with paywall detection
│   ├── capture-screenshot.js        # Playwright-based screenshot capture
│   ├── generate-slide-images.js     # Logo → 16:9 slide generation (Sharp)
│   ├── batch-download-logos.js      # Clearbit API logo fetching
│   ├── create-collage.js            # Multi-image collage generator
│   └── process-visual-assets.js     # Batch asset processing
│
├── specs/                           # Project specifications
│   └── 2025-01-09-brand-activation-research/
│       ├── spec.md                  # Feature specification
│       ├── tasks.md                 # Implementation task breakdown
│       └── planning/requirements.md # Detailed requirements
│
└── .github/workflows/
    └── deploy.yml                   # GitHub Actions CI/CD pipeline
```

## Tech Stack

### Core Technologies
- **Frontend Framework**: React 18.2.0
- **Build Tool**: Create React App / React Scripts 5.0.1
- **Styling**: Tailwind CSS 3.3.5 (via CDN in HTML)
- **Icons**: Lucide React 0.294.0
- **Image Processing**: Sharp 0.33.5 (for slide generation)

### Asset Processing
- **Screenshot Capture**: Playwright (via MCP integration)
- **Logo Source**: Clearbit API (clearbit.com/logo)
- **Image Format**: PNG (logos and slide images)
- **Target Dimensions**: 1920x1080 (16:9 aspect ratio)

### Deployment
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Hosting**: GitHub Pages (static site)
- **Build Output**: `/build` directory

### Development Tools
- **Node.js**: >=18.0.0 required
- **Package Manager**: npm

## Working with Event Data

### Adding New Events

1. Add event object to `events/details.json` following the schema in `events/SCHEMA.md`
2. Increment `metadata.totalEvents` and update `metadata.lastUpdated`
3. Create directory: `events/[brand-slug]/event-[id]/`
4. Download or generate assets (logo.png, slide-image.png)
5. Run validation: `node scripts/validate-url.js [event-url]`
6. Update `assetInventory` in event object with asset paths

### Modifying the Presentation

The presentation component (`src/PresentationDeck.jsx`) consists of:
- **TitleSlide** (lines 111-139): Summary statistics and event counts
- **EventSlide** (lines 141-247): Individual event display with image and details
- **Navigation Controls** (lines 284-321): Previous/Next buttons and slide counter
- **Filter Bar** (lines 252-272): Category filtering system
- **Slide Indicators** (lines 324-340): Progress dots for visual navigation

Image paths are resolved via `getImagePath()` function (lines 70-77) which checks `assetInventory.collagePath` first, then falls back to constructed path.

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
- `events/details.json` is the single source of truth - never modify without validating schema
- All URLs must pass validation before inclusion - run `validate-url.js` for any new events
- Asset paths in `assetInventory.collagePath` must be relative to project root (not absolute)
- Event IDs must be unique integers 1-50

### Image Requirements
- All slide images MUST be 16:9 aspect ratio (1920x1080)
- Brand logos can be any size (will be resized during slide generation)
- Supported format: PNG
- File naming convention: `logo.png` and `slide-image.png` (exact names required)

### Build and Deployment
- GitHub Actions workflow triggers on push to `main` or `master` branch
- Build requires Node.js 18+ (specified in package.json engines)
- The `/build` directory is gitignored - never commit build artifacts
- `public/events/` directory must exist and contain `details.json` for production builds

## Testing and Validation

### Pre-Deployment Checklist
1. Run `npm run build` to verify build succeeds without errors
2. Check `events/details.json` validates against schema (all required fields present)
3. Verify all `assetInventory.collagePath` values point to existing files
4. Test locally with `npx serve -s build` before pushing
5. Confirm all event URLs are accessible (no 404s, paywalls, or region blocks)

### Common Issues

**Build Failures**
- Check Node.js version (must be >=18.0.0)
- Run `rm -rf node_modules package-lock.json && npm install` to refresh dependencies
- Verify `public/events/details.json` exists and is valid JSON

**Missing Images**
- Check `assetInventory.collagePath` in events/details.json matches actual file location
- Regenerate slide images with `node scripts/generate-slide-images.js --all`
- Verify image files are 16:9 aspect ratio (1920x1080 pixels)

**Deployment Issues**
- Check GitHub Actions logs in repository's Actions tab
- Verify GitHub Pages is enabled in repository settings (source: GitHub Actions)
- Confirm workflow has proper permissions (contents: read, pages: write, id-token: write)

## Research Methodology Notes

**Event Inclusion Criteria:**
- Store-level activations only (2023+)
- Must be accessible from multiple retail locations (luxury brands excluded if single-location)
- URL must be publicly accessible without paywalls or region blocking
- Focus on experiential retail, community programming, sustainability, and technology integration

**Event Categories:**
- footwear, apparel, home-goods, beauty, general-retail, technology, outdoor, sporting-goods, grocery, accessories

**Asset Priorities:**
1. Official brand logos (Clearbit API or brand websites)
2. Promotional images from event websites
3. Screenshots as fallback (Playwright capture)
4. Generated slide images (logo centered on brand-colored background)
