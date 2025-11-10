# Bulk Image Scraping Guide

This guide provides a systematic approach to scraping images for all 13 remaining events.

## Events Needing Images

Based on the current state, here are the events that need more images:

### Priority 1: Events with Good Source URLs (7-8 images needed)

1. **Event 64 - New Balance Flatiron**: https://wwd.com/footwear-news/shoe-industry-news/new-balance-flatiron-nyc-flagship-store-remodeled-1238145507/
2. **Event 67 - Madewell SoHo**: https://wwd.com/business-news/retail/madewell-remakes-its-retail-experience-with-soho-flagship-launch-1236757578/
3. **Event 69 - Anthropologie Wedding Pop-Up**: https://www.retailtouchpoints.com/topics/retail-store-design/experiential-retail/anthropologie-partners-with-pinterest-for-wedding-themed-pop-up-in-nyc
4. **Event 73 - CB2 Malibu**: https://www.homepagenews.com/retail-articles/cb2-design-shop-concept-takes-fresh-approach-to-interior-spaces/
5. **Event 91 - Target DVF Pop-Up**: https://corporate.target.com/press/release/2024/02/target-announces-collaboration-with-diane-von-furstenberg-for-affordable-spring-collection
6. **Event 93 - Lululemon Run Club**: https://www.awesomealpharetta.com/event/summer-run-club-series-powered-by-lululemon/2024-07-15/
7. **Event 94 - Patagonia Worn Wear**: https://www.fall-line.co.uk/patagonia-worn-wear-tour/
8. **Event 95 - Nordstrom Bode Corner**: https://press.nordstrom.com/static-files/2377c5ba-b367-4a4f-8e4d-7e2fbfd235a4

### Priority 2: Events Needing 1-2 More Images

9. **Event 57 - Nike Urban Outfitters**: https://www.retailtouchpoints.com/features/news-briefs/urban-outfitters-launches-immersive-in-store-experience-with-nike (needs 7)
10. **Event 90 - Nike Running Nordstrom**: https://press.nordstrom.com/news-releases/news-release-details/nordstrom-ignites-nycs-running-scene-nike-running-corner (needs 2)

### Priority 3: Challenging Events

11. **Event 22 - Apple Today Sessions**: https://www.apple.com/today/ (needs 8)
12. **Event 85 - Target Warby Parker**: https://www.retaildive.com/news/target-warby-parker-shop-in-shops/741099/ (needs 8)

## Recommended Approach

### Strategy A: Use Playwright MCP Browser Automation

For each event:

1. Navigate to the URL with `browser_navigate`
2. Accept cookies/dialogs
3. Scroll to load lazy images with `browser_press_key` (End key)
4. Extract images with `browser_evaluate`:
   ```javascript
   () => {
     const images = Array.from(document.querySelectorAll('img'));
     const backgrounds = [];

     // Get background images too
     document.querySelectorAll('*').forEach(el => {
       const bg = window.getComputedStyle(el).backgroundImage;
       if (bg && bg.includes('url')) {
         const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
         if (match) backgrounds.push(match[1]);
       }
     });

     return {
       imgs: images.map(img => ({
         src: img.src,
         width: img.naturalWidth || img.width,
         height: img.naturalHeight || img.height
       })).filter(i => i.width >= 400 && i.height >= 300),
       backgrounds: backgrounds.filter(url => url.startsWith('http'))
     };
   }
   ```

5. Download images with Node.js script (create one per event)
6. Run duplicate detection
7. Update inventory

### Strategy B: Use WebSearch + Manual Download

For events without good direct images:

1. Search for: `"{Brand} {Event Title} {Year} photos"` or `"{Brand} {Location} activation images"`
2. Visit top results (Pinterest, Instagram, press releases, event coverage)
3. Extract high-quality images
4. Download and organize

## Automation Scripts

### Create Bulk Download Script

```javascript
// scripts/bulk-download-from-urls.js
// Takes a JSON file mapping event IDs to image URL arrays
// Downloads all images for all events in parallel
```

### Run Duplicate Detection

```bash
for event_id in 22 57 64 67 69 73 85 90 91 93 94 95; do
  node scripts/remove-duplicates.js $event_id
done
```

### Update All Inventories

```bash
node scripts/update-image-inventory.js all
```

## Image Quality Guidelines

- Minimum size: 400x300 pixels
- Preferred: 1000+ pixels width
- Exclude: icons, logos (except brand logo as image-0), sprites, tracking pixels
- File types: JPG, PNG, WEBP
- Max 9 images per event (logo + 8 promotional)

## Progress Tracking

- [x] Event 92 (Adidas BAPE): 9 images ✓
- [x] Event 89 (Sephora): 9 images ✓
- [ ] Event 90 (Nike Running): 7/9 images
- [ ] Event 57 (Nike Urban Outfitters): 2/9 images
- [ ] Event 64 (New Balance): 1/9 images
- [ ] Event 67 (Madewell): 1/9 images
- [ ] Event 69 (Anthropologie): 1/9 images
- [ ] Event 73 (CB2): 1/9 images
- [ ] Event 85 (Target Warby Parker): 1/9 images
- [ ] Event 91 (Target DVF): 1/9 images
- [ ] Event 93 (Lululemon): 1/9 images
- [ ] Event 94 (Patagonia): 1/9 images
- [ ] Event 95 (Nordstrom Bode): 1/9 images
- [ ] Event 22 (Apple): 1/9 images
