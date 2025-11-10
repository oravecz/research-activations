# Complete Image Scraping Guide

This guide shows you how to use the automated tools to scrape and download images for all brand activation events.

## Quick Start (3 Steps)

### Step 1: See Which Events Need Images

```bash
node scripts/auto-scrape-all-events.js
```

This will show you:
- All events that need more images
- How many images each event needs
- Recommended search queries for finding images
- The exact directories where images should be saved

### Step 2: Download Images for an Event

You have two options:

#### Option A: Manual Download (Recommended for Control)

1. Use Google Images or the search queries provided
2. Download 8 high-quality images (min 400x300px)
3. Save them to the event's images directory:
   ```
   public/events/[brand-slug]/event-[id]/images/
   ```
4. Name them sequentially: `image-1.jpg`, `image-2.jpg`, etc.
   (Note: `image-0.png` is already the logo)

#### Option B: Batch Download from URL List

1. Create a text file with image URLs (one per line):
   ```bash
   echo "https://example.com/photo1.jpg" > /tmp/event-64-urls.txt
   echo "https://example.com/photo2.jpg" >> /tmp/event-64-urls.txt
   echo "https://example.com/photo3.jpg" >> /tmp/event-64-urls.txt
   ```

2. Run the batch downloader:
   ```bash
   node scripts/batch-download.js 64 /tmp/event-64-urls.txt
   ```

### Step 3: Update the Database

After downloading images for one or more events:

```bash
# Remove duplicates for a specific event
node scripts/remove-duplicates.js 64

# Update inventory for that event
node scripts/update-image-inventory.js 64

# Or update all events at once
node scripts/update-image-inventory.js all
```

## Complete Workflow Example

Here's a complete example for Event 64 (New Balance):

```bash
# 1. See what's needed
node scripts/auto-scrape-all-events.js
# Output shows: Event 64 needs 8 more images

# 2. Search for images using the provided queries:
#    "New Balance" "Flatiron Flagship Remodel" 2024 photos
#    New Balance flagship New York images
#    New Balance activation 2024 photos

# 3. Download images manually or create URL list
cat > /tmp/event-64-urls.txt << 'EOF'
https://wwd.com/wp-content/uploads/2024/03/new-balance-store-1.jpg
https://wwd.com/wp-content/uploads/2024/03/new-balance-store-2.jpg
https://wwd.com/wp-content/uploads/2024/03/new-balance-store-3.jpg
https://example.com/image4.jpg
https://example.com/image5.jpg
https://example.com/image6.jpg
https://example.com/image7.jpg
https://example.com/image8.jpg
EOF

# 4. Run batch download
node scripts/batch-download.js 64 /tmp/event-64-urls.txt

# 5. Remove any duplicates
node scripts/remove-duplicates.js 64

# 6. Update the inventory in details.json
node scripts/update-image-inventory.js 64
```

## Available Scripts Reference

### `auto-scrape-all-events.js`
Shows all events needing images with search queries and instructions.

```bash
node scripts/auto-scrape-all-events.js
```

### `batch-download.js`
Downloads multiple images from a URL list file.

```bash
node scripts/batch-download.js <event-id> <urls-file>
```

Example:
```bash
node scripts/batch-download.js 64 /tmp/event-64-urls.txt
```

### `remove-duplicates.js`
Detects duplicate images using MD5 hashing and removes them.

```bash
node scripts/remove-duplicates.js <event-id>
```

Example:
```bash
node scripts/remove-duplicates.js 64
```

### `update-image-inventory.js`
Updates the imageInventory in details.json for one or all events.

```bash
node scripts/update-image-inventory.js <event-id>
node scripts/update-image-inventory.js all
```

Examples:
```bash
node scripts/update-image-inventory.js 64    # Update Event 64 only
node scripts/update-image-inventory.js all   # Update all events
```

### `scrape-with-playwright.js`
Shows which events need images (simpler output).

```bash
node scripts/scrape-with-playwright.js           # Show all
node scripts/scrape-with-playwright.js 64        # Show details for Event 64
```

## Image Requirements

- **Minimum Size**: 400x300 pixels (larger is better)
- **Preferred Size**: 1000+ pixels width
- **File Types**: JPG, PNG, WEBP
- **Max Count**: 9 images per event (logo + 8 promotional)
- **Exclude**:
  - Small icons and sprites
  - Brand logos (except the main logo as image-0)
  - Tracking pixels (1x1)
  - Unrelated images

## Current Status

Run this to see current progress:

```bash
node scripts/scrape-with-playwright.js
```

As of now:
- ✅ Event 89 (Sephora): 9/9 images
- ✅ Event 92 (Adidas BAPE): 9/9 images
- 🔄 Event 90 (Nike Running): 7/9 images
- 🔄 Event 57 (Nike Urban Outfitters): 2/9 images
- ⏳ 10 events with 1/9 images each

## Tips for Finding Good Images

### Best Sources:
1. **Event URL** (provided in details.json) - Start here!
2. **Brand press releases** - Search: `[brand] [event] press release 2024`
3. **Retail news sites** - RetailTouchPoints, WWD, RetailDive
4. **Pinterest** - Often has curated event photos
5. **Instagram** - Search brand hashtags and location tags
6. **Google Images** - Use the search queries from auto-scrape-all-events.js

### Search Tips:
- Use quotes for exact phrases: `"New Balance" "Flatiron"`
- Add year to find recent images: `2024`
- Include words like: photos, images, event, activation, popup
- Try location names: NYC, SoHo, Atlanta, London

### Quality Checks:
- ✅ Image shows the actual event/activation
- ✅ Image is high resolution (not blurry/pixelated)
- ✅ Image is related to the brand and event
- ❌ Don't include unrelated product shots
- ❌ Don't include stock photos
- ❌ Don't include images from different events

## Automation Possibilities

If you want to fully automate this (requires more setup):

1. **Use Playwright MCP** (like Event 92):
   - Navigate to event URLs with browser
   - Extract all images automatically
   - Download programmatically

2. **Use Image Search APIs**:
   - Google Custom Search API
   - Bing Image Search API
   - Requires API keys

3. **Web Scraping Libraries**:
   - Puppeteer / Playwright for JavaScript
   - BeautifulSoup for Python
   - Requires handling rate limits

## Troubleshooting

### "Directory does not exist"
```bash
# Create the directory manually:
mkdir -p public/events/[brand-slug]/event-[id]/images
```

### "Download failed" or "0 bytes"
- URL might require authentication
- Image might be behind a paywall
- Try downloading manually in browser first

### "No duplicates found" but images look the same
- Different file formats (JPG vs PNG)
- Different resolutions of same image
- Script only detects binary duplicates

### Can't find good images for an event
- Try alternate search terms
- Look for press coverage of the event
- Check brand's social media from the event date
- Search for the event location + brand name

## Need Help?

If you run into issues:
1. Check the error message carefully
2. Verify the event ID is correct
3. Make sure the images directory exists
4. Ensure image URLs are accessible (not behind paywalls)

## Next Steps After Scraping

Once all events have 9 images:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Preview locally**:
   ```bash
   npm run preview
   ```

3. **Deploy** (if configured):
   ```bash
   npm run deploy:prep
   ```
