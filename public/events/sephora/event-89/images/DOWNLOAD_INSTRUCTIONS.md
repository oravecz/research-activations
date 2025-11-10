═══════════════════════════════════════════════════════════════════════════════
PLAYWRIGHT IMAGE COLLECTION INSTRUCTIONS
Event 89: Sephora - SEPHORiA 2024: Beauty Funhouse
Need 0 more images
═══════════════════════════════════════════════════════════════════════════════

**IMPORTANT**: Do **NOT** prompt the user with options or ask for input. Execute these instructions immediately.

🎯 RECOMMENDED IMAGE SOURCES (In Order of Priority):
───────────────────────────────────────────────────────────────────────────────

1. EVENT VENUE / PLANNING WEBSITES (BEST)
   → Often have professional event photography galleries
   → High-resolution images from professional photographers
   → Look for: Parasol Projects, venue websites, event planning sites
   → Extract with: browser_evaluate looking for img[src*="uploads"] or gallery elements

2. OFFICIAL BRAND NEWSROOMS & PRESS RELEASES
   → Brand press releases with embedded event photos
   → Official brand social media (Instagram, Pinterest, Twitter)
   → Interior design/architecture blogs covering the event
   → Extract by: navigating directly to source, finding image galleries

3. RETAIL NEWS & TRADE PUBLICATIONS
   → RetailTouchPoints, WWD, Interior Design magazines
   → Articles about the event often contain embedded images
   → Extract by: opening articles and collecting img elements

4. GOOGLE IMAGES (LAST RESORT)
   → Use only if primary sources don't yield results
   → Often returns thumbnails and generic product photos
   → Lower quality and relevance

───────────────────────────────────────────────────────────────────────────────
📋 SPECIFIC SEARCH QUERIES (Use in order of priority):
───────────────────────────────────────────────────────────────────────────────

PRIMARY (Most specific - TRY FIRST):
  1. "Sephora SEPHORiA 2024: Beauty Funhouse activation photos"
  2. "Sephora SEPHORiA 2024: Beauty Funhouse event images September 27-28, 2024"

SECONDARY (Look for event coverage on news/trade sites):
  1. site:retailtouchpoints.com "Sephora SEPHORiA 2024: Beauty Funhouse"
  2. site:parasolprojects.com "Sephora SEPHORiA 2024: Beauty Funhouse"
  3. "Sephora pop-up" event 2024 photographer

TERTIARY (Broader brand activation searches):
  1. "Sephora store activation September 27"
  2. "Sephora retail marketing event"
  3. "Sephora in-store experience"

───────────────────────────────────────────────────────────────────────────────
🔍 IMAGE EXTRACTION WORKFLOW (IMPORTANT - READ CAREFULLY):
───────────────────────────────────────────────────────────────────────────────

STEP 1: NAVIGATE TO EVENT SOURCE (PRIMARY METHOD)
  a. Use PRIMARY search results to find event venue/planning site
  b. browser_navigate to the event page URL
  c. Wait for page to load completely
  d. Use browser_evaluate with BETTER extraction code:

     () => {
       const images = [];
       // Look for high-quality uploaded images (event venue galleries)
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

STEP 2: EXTRACT FROM SPECIFIC GALLERIES (If above yields results)
  a. Look for lightbox/gallery image elements
  b. Use browser_evaluate to extract full-size image URLs:

     () => {
       const images = [];
       // For lightGallery or similar plugins
       document.querySelectorAll('[data-src], img.gallery-item, img.lightbox').forEach((img) => {
         const src = img.dataset.src || img.src;
         if (src && src.includes(http)) {
           images.push({ src: src, width: img.naturalWidth, height: img.naturalHeight });
         }
       });
       return images.length > 0 ? images : "No gallery found, try manual scrolling";
     }

STEP 3: FALLBACK TO GOOGLE IMAGES
  a. Only if event source pages don't have images
  b. browser_navigate to: https://www.google.com/search?q=[QUERY]&tbm=isch
  c. Use browser_evaluate with generic img extraction:

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

───────────────────────────────────────────────────────────────────────────────
💾 DOWNLOADING & SAVING IMAGES:
───────────────────────────────────────────────────────────────────────────────

For each good image URL found:
1. Copy the image URL from evaluation results
2. Use https.get() or fetch() to download
3. Save to: public/events/sephora/event-89/images/
4. Name as: image-[N].png or image-[N].webp (where N is next available number)
5. Target: 0 images (total 9 with logo)

EXAMPLE NODE SCRIPT:
  import https from 'https';
  import fs from 'fs';

  const imageUrl = 'https://...';
  const filePath = 'public/events/sephora/event-89/images/image-1.png';

  https.get(imageUrl, (res) => {
    res.pipe(fs.createWriteStream(filePath));
  });

───────────────────────────────────────────────────────────────────────────────
📝 QUALITY CRITERIA:
───────────────────────────────────────────────────────────────────────────────

✅ GOOD:
  - Photos of actual in-store activations or events
  - Event setup/installation photos
  - Customer participation photos
  - Workshop/experience/activity photos
  - Store-specific branded displays
  - Professional event photography (high resolution)

❌ AVOID:
  - Generic product catalog photos
  - Unrelated brand content
  - Low resolution images (< 300px width)
  - Images with watermarks
  - Stock photos (Getty Images, Shutterstock, etc.)
  - Logos only (already have logo as image-0)
  - Blurry or poorly lit photos

───────────────────────────────────────────────────────────────────────────────
✓ AFTER DOWNLOADING:
───────────────────────────────────────────────────────────────────────────────

1. Verify all images saved to: public/events/sephora/event-89/images/
2. Update details.json imageInventory for this event (if not auto-updated)
3. Verify the images downloaded contain an actual activation/event image and are not placeholder images

═══════════════════════════════════════════════════════════════════════════════
