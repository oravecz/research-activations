# Masonry Image Collection Workflow

## Overview

This document describes the workflow for collecting event images and displaying them using a Masonry grid layout in the presentation.

## Components

### 1. Image Collection Script (`scripts/collect-event-images.js`)

Organizes images for each event with the company logo first (upper-left position) followed by up to 8 promotional images.

**Usage:**
```bash
# Organize images for a single event
node scripts/collect-event-images.js --event 1

# Process a range of events
node scripts/collect-event-images.js --range 1-10

# Process all events
node scripts/collect-event-images.js --all
```

**What it does:**
- Copies brand logo to `events/[brand]/event-[id]/images/image-0.png`
- Provides instructions for collecting promotional images via Playwright
- Updates event metadata with image inventory
- Tracks image order, paths, and logo status

### 2. Masonry Grid Component (`src/MasonryImageGrid.jsx`)

React component that displays images in a responsive Masonry grid layout using the Masonry.js library.

**Features:**
- Logo displayed first (upper-left) with blue border and badge
- Responsive grid (3 columns on large screens, 2 on medium, 1 on small)
- Lazy loading for performance
- Loading indicators and error handling
- Automatic layout adjustment when images load

**Props:**
- `images`: Array of image objects from event.imageInventory.images
- `basePath`: Base URL path (import.meta.env.BASE_URL)

### 3. Updated Presentation Component (`src/PresentationDeck.jsx`)

Enhanced to support both Masonry grid and fallback single-image display.

**Behavior:**
- If event has `imageInventory.images` → displays Masonry grid
- Otherwise → displays single slide-image.png (backward compatible)

## Collecting Images with Playwright MCP

### Step 1: Navigate to Event URL

```javascript
// Use Claude Code's Playwright MCP
mcp__playwright__browser_navigate({ url: event.url })
```

### Step 2: Extract Image URLs

Use `mcp__playwright__browser_evaluate` to run this JavaScript:

```javascript
const images = Array.from(document.querySelectorAll('img'))
  .filter(img => {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    return width >= 200 && height >= 200;
  })
  .filter(img => {
    const src = img.src || img.dataset.src || '';
    // Filter out icons, ads, tracking pixels
    return !src.match(/icon|logo|badge|avatar|pixel|tracker|ad\\.doubleclick/i);
  })
  .map(img => {
    // Get highest resolution from srcset if available
    if (img.srcset) {
      const sources = img.srcset.split(',').map(s => s.trim().split(' '));
      const highest = sources.sort((a, b) => {
        const aWidth = parseInt(a[1]) || 0;
        const bWidth = parseInt(b[1]) || 0;
        return bWidth - aWidth;
      })[0];
      return highest[0];
    }
    return img.src || img.dataset.src;
  })
  .filter(src => src && src.startsWith('http'))
  .slice(0, 8); // Get up to 8 promotional images

return images;
```

### Step 3: Download Images

For each image URL, download and save to:
- `events/[brand]/event-[id]/images/image-1.png` through `image-8.png`
- Logo is already at `image-0.png` (copied by script)

### Step 4: Update Event Data

Add `imageInventory` to event object in `events/details.json`:

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

## Directory Structure

```
events/
└── [brand-slug]/
    └── event-[id]/
        ├── logo.png                    # Source logo (copied by download-brand-assets.js)
        ├── slide-image.png             # Fallback single image (backward compatible)
        ├── metadata.json               # Event metadata with imageInventory
        └── images/                     # Masonry grid images
            ├── image-0.png             # Logo (always first)
            ├── image-1.png             # Promotional image 1
            ├── image-2.png             # Promotional image 2
            └── ...                     # Up to image-8.png
```

## Workflow Example

### Collecting Images for Nike Event #1

```bash
# 1. Ensure logo exists
node scripts/download-brand-assets.js --download-logo "Nike" 1

# 2. Organize images directory
node scripts/collect-event-images.js --event 1

# 3. Use Claude Code with Playwright MCP to collect promotional images
# Navigate to https://news.nike.com/news/nike-rise-concept-stores
# Extract image URLs with JavaScript (see Step 2 above)
# Download 8 best images

# 4. Verify images
ls -la events/nike/event-1/images/
# Should show: image-0.png (logo), image-1.png through image-8.png

# 5. Update events/details.json with imageInventory
# (Script automatically updates metadata.json)

# 6. Test in presentation
npm start
# Navigate to event #1 and see Masonry grid
```

## Dependencies

- **masonry-layout** (4.2.2): Grid layout library
- **imagesloaded** (5.0.0): Detects when images have loaded
- Both installed via: `npm install`

## Benefits of Masonry Layout

1. **Visual Impact**: Multiple images tell a better story than one
2. **Responsive**: Automatically adapts to screen size
3. **Dynamic**: Layout adjusts as images load
4. **Logo Prominence**: Logo always first with special styling
5. **Backward Compatible**: Falls back to single image if no inventory

## Testing

```bash
# Start dev server
npm start

# Navigate to an event with imageInventory
# Should see Masonry grid with logo first

# Navigate to an event without imageInventory
# Should see fallback single image
```

## Troubleshooting

**Images not loading:**
- Check that paths in imageInventory use relative paths from project root
- Verify images exist at specified paths
- Check browser console for 404 errors

**Masonry layout not initializing:**
- Ensure imagesLoaded callback fires after all images load
- Check that grid ref is attached to DOM element
- Verify Masonry configuration in MasonryImageGrid component

**Logo not showing as first image:**
- Ensure image-0.png is the logo
- Check that isLogo: true in imageInventory
- Verify logo has order: 0
