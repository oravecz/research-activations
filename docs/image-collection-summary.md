# Masonry Grid Image Collection - Implementation Summary

## What Was Implemented

A new image display system using Masonry.js grid layout for event presentations, with the company logo always positioned first (upper-left) followed by up to 8 promotional images.

## Files Created/Modified

### New Files
1. **`scripts/collect-event-images.js`** - Script to organize images directory and prepare for Masonry grid
2. **`src/MasonryImageGrid.jsx`** - React component for responsive Masonry grid layout
3. **`docs/masonry-image-collection.md`** - Detailed workflow documentation
4. **`docs/image-collection-summary.md`** - This summary

### Modified Files
1. **`package.json`** - Added masonry-layout@4.2.2 and imagesloaded@5.0.0 dependencies
2. **`src/PresentationDeck.jsx`** - Enhanced to support dual display modes (Masonry grid or single image fallback)
3. **`CLAUDE.md`** - Updated with Masonry grid workflow and new commands

## Key Features

### 1. Masonry Grid Component
- **Responsive Layout**: 3 columns (large), 2 columns (medium), 1 column (small screens)
- **Logo Prominence**: First image (logo) has blue border and "LOGO" badge
- **Progressive Loading**: Loading indicators while images load, error states for failures
- **Lazy Loading**: Images load as needed for performance
- **Auto-Layout**: Uses imagesLoaded to wait for images before initializing grid

### 2. Image Organization
- **Logo First**: `events/[brand]/event-[id]/images/image-0.png` (always logo)
- **Promotional Images**: `image-1.png` through `image-8.png` (up to 8 additional images)
- **Metadata Tracking**: `imageInventory` object in event data tracks all images

### 3. Backward Compatibility
- Events without `imageInventory` display single image (existing behavior)
- Events with `imageInventory` display Masonry grid (new behavior)
- No breaking changes to existing event data structure

## Usage Workflow

### For a Single Event (Example: Nike Event #1)

```bash
# Step 1: Ensure brand logo exists
node scripts/download-brand-assets.js --download-logo "Nike" 1

# Step 2: Organize images directory (copies logo as image-0.png)
node scripts/collect-event-images.js --event 1

# Step 3: Use Playwright MCP to collect promotional images
# (See docs/masonry-image-collection.md for detailed JavaScript examples)

# Step 4: Verify the setup
ls -la events/nike/event-1/images/
# Should show: image-0.png, image-1.png, ..., image-8.png

# Step 5: Update events/details.json with imageInventory
# (Automatically updated by script for metadata.json)

# Step 6: Test
npm start
```

## Playwright MCP Integration

### Image Extraction JavaScript

```javascript
const images = Array.from(document.querySelectorAll('img'))
  .filter(img => {
    // Filter: minimum 200x200px
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    return width >= 200 && height >= 200;
  })
  .filter(img => {
    // Filter: exclude icons, ads, trackers
    const src = img.src || img.dataset.src || '';
    return !src.match(/icon|logo|badge|avatar|pixel|tracker|ad\\.doubleclick/i);
  })
  .map(img => {
    // Get highest resolution from srcset
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
  .slice(0, 8); // Limit to 8 images

return images;
```

### Playwright MCP Commands

1. **Navigate**: `mcp__playwright__browser_navigate({ url: event.url })`
2. **Evaluate**: `mcp__playwright__browser_evaluate({ function: "[JavaScript above]" })`
3. **Close**: `mcp__playwright__browser_close()`

## Event Data Structure

### Before (Single Image)
```json
{
  "id": 1,
  "brand": "Nike",
  "assetInventory": {
    "hasLogo": true,
    "logoPath": "events/nike/event-1/logo.png",
    "hasCollage": true,
    "collagePath": "events/nike/event-1/slide-image.png"
  }
}
```

### After (Masonry Grid)
```json
{
  "id": 1,
  "brand": "Nike",
  "assetInventory": {
    "hasLogo": true,
    "logoPath": "events/nike/event-1/logo.png"
  },
  "imageInventory": {
    "totalImages": 9,
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
      // ... up to 8 more images
    ]
  }
}
```

## Directory Structure

```
events/
└── nike/
    └── event-1/
        ├── logo.png              # Original logo (source)
        ├── slide-image.png       # Fallback single image
        ├── metadata.json         # Event metadata
        └── images/               # Masonry grid images
            ├── image-0.png       # Logo (copied from logo.png)
            ├── image-1.png       # Promotional image 1
            ├── image-2.png       # Promotional image 2
            ├── ...
            └── image-8.png       # Promotional image 8
```

## Benefits

1. **Richer Visual Storytelling**: 9 images vs 1 image tells a better story
2. **Logo Prominence**: Logo always first with special styling
3. **Responsive Design**: Works on all screen sizes
4. **Performance**: Lazy loading and progressive enhancement
5. **Backward Compatible**: No breaking changes for existing events
6. **Automated Setup**: Script handles image organization

## Next Steps

1. **Collect Images**: Use Playwright MCP to collect promotional images for events
2. **Update Events**: Add `imageInventory` to events in `events/details.json`
3. **Test Display**: Verify Masonry grid displays correctly
4. **Scale Up**: Process events in batches using `--range` flag

## Testing

```bash
# Build and test
npm run build
npm run preview

# Test with single event
npm start
# Navigate to event with imageInventory
```

## Dependencies Installed

- `masonry-layout@4.2.2` - Grid layout library
- `imagesloaded@5.0.0` - Image load detection

## Documentation

- **Workflow Guide**: `docs/masonry-image-collection.md`
- **Updated Guide**: `CLAUDE.md` (sections: Commands, Tech Stack, Masonry Grid Collection)
- **This Summary**: `docs/image-collection-summary.md`
