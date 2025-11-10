# Prompt for Automated Image Collection

Copy and paste this prompt to force Claude to collect images for all events:

---

## THE PROMPT

```
You are tasked with collecting unique, relevant images for brand activation events. You MUST complete all steps systematically and cannot skip any event.

CRITICAL RULES:
1. You MUST collect images for ALL 11 events that need them (22, 57, 64, 67, 69, 73, 85, 91, 93, 94, 95)
2. You MUST verify NO duplicates exist using the duplicate checker after each event
3. You MUST collect exactly 9 total images per event (1 logo + 8 promotional)
4. You MUST use multiple different search queries if initial queries don't yield enough unique images
5. You MUST extract actual image URLs from web pages, not just describe the process
6. You MUST download images and verify they saved correctly
7. You CANNOT move to the next event until the current event has 9 unique images
8. You MUST show me the actual images you downloaded (using Read tool on the image files)

WORKFLOW FOR EACH EVENT:

Step 1: Check current status
- Run: node scripts/enhanced-image-scraper.js [event-id]
- Report how many images exist and how many are needed

Step 2: Generate search queries
- Run: node scripts/google-image-scraper.js [event-id]
- Use the generated Google Images URLs with num parameter

Step 3: Search for images
You have THREE options (try in order):

OPTION A: Search brand website or event URL directly
- Navigate to the event's official URL
- Use browser_evaluate to extract image URLs from the page
- Look for galleries, press kits, media sections

OPTION B: Use DuckDuckGo Images (lighter than Google)
- Navigate to: https://duckduckgo.com/?q=[QUERY]&iax=images&ia=images
- Use browser_evaluate to extract image URLs
- DuckDuckGo pages are typically smaller than Google

OPTION C: Use Bing Images
- Navigate to: https://www.bing.com/images/search?q=[QUERY]
- Use browser_evaluate to extract image URLs

Step 4: Extract image URLs
- You MUST use browser_evaluate to run JavaScript that extracts actual URLs
- Copy the extracted URLs
- Verify URLs are valid (start with http:// or https://)

Step 5: Download images
- Create a temporary file with the URLs (one per line)
- Run: node scripts/auto-download-images.js [event-id] [url1] [url2] [url3]...
- OR save URLs to file and use: node scripts/auto-download-images.js [event-id] urls.txt

Step 6: Verify results
- Run: node scripts/enhanced-image-scraper.js [event-id]
- Check that it shows "9 images" or "Event has sufficient unique images"
- If not 9 images, repeat steps 3-5 with different search queries

Step 7: Visual verification (REQUIRED)
- Run: ls -lh public/events/[brand]/event-[id]/images/
- Verify 9 image files exist with reasonable file sizes (not all 2.7K which indicates duplicates)

Step 8: Move to next event
- Only proceed when current event has 9 unique images
- Report completion: "✅ Event [id] complete: 9/9 images"

EVENTS TO PROCESS (in order):
1. Event 64 - New Balance (needs 2 more) - START HERE (easiest)
2. Event 57 - Nike Urban Outfitters
3. Event 93 - Lululemon Run Club
4. Event 69 - Anthropologie Wedding Pop-Up
5. Event 73 - CB2 Malibu Design Shop
6. Event 22 - Apple Today at Apple
7. Event 67 - Madewell SoHo Denim Atelier
8. Event 85 - Target Warby Parker
9. Event 91 - Target Diane von Furstenberg
10. Event 94 - Patagonia Worn Wear Tour
11. Event 95 - Nordstrom Live Your Event

IMAGE QUALITY REQUIREMENTS:
✅ MUST show the actual brand activation event
✅ MUST be high resolution (300px+ width)
✅ MUST be relevant to the specific event title
✅ MUST be unique (no duplicates)
❌ NO generic product photos
❌ NO unrelated brand content
❌ NO stock photos
❌ NO logos only (except image-0)

SEARCH STRATEGIES:
- Use brand name + event title + "photos" or "images"
- Use brand name + activation type (workshop, pop-up, etc.)
- Search for press coverage: brand + event + "retail" + year
- Look for official brand press releases with images
- Check retail news sites (RetailTouchPoints, Chain Store Age, etc.)

YOU MUST:
- Work through ALL 11 events systematically
- Show proof of completion for each event (file listings with sizes)
- Verify no duplicates after each event
- Not skip any event
- Not stop until all 11 events have 9 images each

BEGIN with Event 64 (New Balance) NOW. Show me your step-by-step progress.
```

---

## Alternative: More Forceful Version

If Claude tries to shortcut or skip steps, use this version:

```
MANDATORY IMAGE COLLECTION TASK - NO SHORTCUTS ALLOWED

You are REQUIRED to collect images for 11 brand activation events. This is not optional. You cannot describe the process - you must actually DO it.

IRONCLAD RULES - VIOLATION WILL RESTART THE TASK:
1. ❌ NO saying "you should" or "you could" - you MUST actually do it
2. ❌ NO explaining what to do - DO IT YOURSELF
3. ❌ NO creating instructions for manual work - USE THE TOOLS
4. ❌ NO skipping events because "it's too hard"
5. ❌ NO stopping until all 11 events have 9 unique images
6. ✅ YES use browser_navigate and browser_evaluate to actually scrape images
7. ✅ YES use auto-download-images.js to download them
8. ✅ YES verify file sizes to prove they're unique
9. ✅ YES show me the actual file listings with ls -lh

MANDATORY COMPLETION CRITERIA:
- Event 22: 9 images ✅
- Event 57: 9 images ✅
- Event 64: 9 images ✅
- Event 67: 9 images ✅
- Event 69: 9 images ✅
- Event 73: 9 images ✅
- Event 85: 9 images ✅
- Event 91: 9 images ✅
- Event 93: 9 images ✅
- Event 94: 9 images ✅
- Event 95: 9 images ✅

You cannot respond with "task complete" until you can show me file listings proving all 11 events have 9 unique image files each.

START NOW with Event 64 (New Balance). Show me:
1. Current image count
2. Search query used
3. URLs extracted
4. Download command executed
5. Final file listing with sizes

DO NOT EXPLAIN. DO IT.
```

---

## Alternative: Incremental Version

If you want Claude to do one event at a time and ask for permission:

```
Collect unique images for Event [ID] following these exact steps:

1. Run: node scripts/enhanced-image-scraper.js [ID]
   - Show me the output

2. Run: node scripts/google-image-scraper.js [ID]
   - Show me the first 3 search query URLs generated

3. Navigate to the event's official URL OR use DuckDuckGo images:
   - Event URL: [paste from details.json]
   - OR DuckDuckGo: https://duckduckgo.com/?q=[QUERY]&iax=images&ia=images

4. Use browser_evaluate to extract image URLs:
   - Execute JavaScript to get image src attributes
   - Filter for images >= 300px width
   - Show me the extracted URLs

5. Download images:
   - Run: node scripts/auto-download-images.js [ID] "url1" "url2" "url3"...
   - Show me the output

6. Verify completion:
   - Run: node scripts/enhanced-image-scraper.js [ID]
   - Run: ls -lh public/events/[brand]/event-[ID]/images/
   - Show me both outputs

7. Confirm: Show me proof that 9 unique images exist (file sizes should vary, not all 2.7K)

Do NOT proceed to the next event until I confirm. Start with Event 64 (New Balance).
```

---

## Tips for Using These Prompts

1. **Copy the entire prompt** including the rules and event list
2. **Paste it as a new message** (after this conversation or in a new session)
3. **Be specific** if Claude tries to shortcut: "No, actually DO it, don't explain"
4. **Monitor progress** by checking the file system after each event
5. **Interrupt if needed** and say "Show me proof with ls -lh"

## Expected Behavior

When you use these prompts, Claude should:
- ✅ Actually navigate to web pages
- ✅ Actually extract image URLs with browser_evaluate
- ✅ Actually download images with the scripts
- ✅ Actually verify file sizes and uniqueness
- ✅ Show proof of completion with file listings
- ✅ Work through all 11 events systematically

## What to Watch For

If Claude tries to:
- ❌ Write more instructions instead of doing the work
- ❌ Explain what "should" be done instead of doing it
- ❌ Skip events
- ❌ Move on without showing proof

**Interrupt immediately** and say:
> "Stop. Show me actual proof with file listings. You must execute the commands and show me the output."

---

## Final Enforcement Technique

If Claude is still not doing the work, try this nuclear option:

```
I need you to execute these exact commands in sequence and show me ONLY the command output. No explanations. Just results.

Command 1: node scripts/enhanced-image-scraper.js 64
Command 2: node scripts/google-image-scraper.js 64 | head -20
Command 3: [After I provide URLs] node scripts/auto-download-images.js 64 "url1" "url2"
Command 4: ls -lh public/events/new-balance/event-64/images/

Execute Command 1 now. Show ONLY the output.
```

Then guide Claude through each command one at a time, forcing execution rather than explanation.
