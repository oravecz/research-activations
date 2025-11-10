# Image Collection Strategy & Status

## Current Status

✅ **COMPLETED:**
- All 50 events have validated, accessible URLs (100% success rate)
- All 50 events have brand logos downloaded to `events/[brand]/event-[id]/images/image-0.png`
- Directory structure created for all events

## Challenge with Promotional Images

After testing with the Crocs event URL, I identified several challenges:

1. **Paywalls/Metered Content**: Many news/retail sites (Modern Retail, WWD, Retail Dive) have paywalls
2. **Variable Image Availability**: Some articles are text-heavy with few promotional images
3. **Dynamic Content**: Images may be loaded via JavaScript, in carousels, or behind interactions
4. **Manual Curation Needed**: Selecting the "best" 8 images requires human judgment about quality, relevance, and brand representation

## Recommended Approaches

### Option 1: Semi-Automated with Playwright (Recommended)
**Time: 4-6 hours**

Create a Playwright workflow where you:
1. Navigate to each event URL using the MCP tools
2. Take a snapshot to see available images
3. Use Playwright to extract image URLs from the page
4. Manually select the best 8 images
5. Download them programmatically

**Pros:**
- Quality control over image selection
- Can handle paywalls manually
- Ensures brand-appropriate images
- Semi-automated download process

**Cons:**
- Still requires manual review of each page
- Time-consuming (5-7 minutes per event)

### Option 2: Start with Masonry Grid Using Only Logos
**Time: 30 minutes**

Use the logos we already have:
1. Create Masonry grid with just the logo (1 image per event)
2. Presentation still works, just simpler
3. Add promotional images later as time permits

**Pros:**
- Immediate functionality
- Logos are high-quality and brand-accurate
- Can add images incrementally
- User can prioritize which events need images first

**Cons:**
- Less visually rich
- Doesn't showcase the activations as well

### Option 3: Use Clearbit/Unsplash for Generic Brand Images
**Time: 2-3 hours**

Programmatically download:
1. Brand logos (already done ✓)
2. Generic brand product images from Unsplash API
3. Stock retail/store images

**Pros:**
- Fully automated
- Quick completion
- Professional-quality images

**Cons:**
- Not specific to the actual activations
- May not accurately represent the events
- Generic rather than event-specific

### Option 4: Hybrid Approach (Best Balance)
**Time: 2-3 hours**

1. **Start with logos only** - Get Masonry working immediately
2. **Prioritize top 10 events** - Manually collect images for most important/recent activations
3. **Use placeholders** - Generic brand imagery for remaining 40 events
4. **Incremental improvement** - Add real images over time as needed

**Pros:**
- Quick initial delivery
- Focuses effort on highest-value events
- System works end-to-end immediately
- Can improve quality over time

**Cons:**
- Mixed quality across events
- Still requires some manual work

## Current Tools Available

### Scripts Created:
- `scripts/collect-images-playwright.js` - Provides instructions and helpers
- `scripts/download-remaining-logos.js` - Auto-downloaded all 50 logos ✓
- `scripts/check-logo-status.js` - Verify logo download status

### Commands:
```bash
# Get instructions for collecting images for specific event
node scripts/collect-images-playwright.js instructions 61

# Update imageInventory after adding images
node scripts/collect-images-playwright.js update-inventory 61

# Update all inventories
node scripts/collect-images-playwright.js update-inventory
```

## Recommended Next Step

I recommend **Option 4 (Hybrid Approach)**:

1. **Immediate** - Test Masonry grid with logos only
2. **Short-term** - Manually collect images for 5-10 priority events using Playwright
3. **Long-term** - Backfill remaining events as time permits or as needed

This gets the presentation working NOW while allowing for quality improvement over time.

## Technical Implementation for Logo-Only Masonry

The Masonry grid component is already built and supports single-image mode:
- Logo displays in upper-left with blue border
- Responsive grid layout
- Works perfectly with just 1 image per event
- Can easily add more images later

## Sample Workflow for Manual Image Collection

For each priority event (estimated 5-7 minutes each):

1. **Navigate**: Use Playwright MCP to load the event URL
2. **Snapshot**: Take page snapshot to see structure
3. **Identify images**: Look for:
   - Store interior/exterior photos
   - Product displays
   - Experiential elements (yoga studios, customization stations, etc.)
   - Customer interactions
   - Brand signage
4. **Extract URLs**: Use browser developer tools or Playwright to get image src URLs
5. **Download**: Save images to `events/[brand]/event-[id]/images/image-1.png` through `image-8.png`
6. **Update inventory**: Run the update-inventory command

## Decision Point

**Question for you**: Which approach do you prefer?
- A) Start with logos only, test Masonry, add images incrementally
- B) Commit 4-6 hours to manually collect all 400 images now
- C) Focus on top 10-15 events with full image sets, use logos for the rest
- D) Other approach?

Let me know and I'll proceed accordingly!
