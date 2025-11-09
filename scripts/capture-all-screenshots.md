# Screenshot Capture Plan

## Overview
This document provides instructions for capturing screenshots for all 50 events using Playwright MCP.

## Screenshot Specifications
- Dimensions: 768x1024 (portrait orientation for slide layout)
- Format: PNG
- Full page: Yes
- Destination: `events/[brand-slug]/event-[id]/screenshot.png`

## Events to Screenshot

Below is the complete list of all 50 events with their URLs and screenshot destinations.

### Batch 1: Events 1-10

1. **Nike - Nike Rise Store Concept**
   - URL: https://news.nike.com/news/nike-rise-concept-stores
   - Destination: events/nike/event-1/screenshot.png

2. **Nike - Nike By You Customization Expansion**
   - URL: https://news.nike.com/news/nike-by-you-customization-expansion
   - Destination: events/nike/event-2/screenshot.png

3. **Nike - Nike Community Stores Initiative**
   - URL: https://news.nike.com/news/nike-community-stores-2023
   - Destination: events/nike/event-3/screenshot.png

4. **On Running - New York Flagship Store Opening**
   - URL: https://www.on-running.com/en-us/articles/new-york-flagship-store
   - Destination: events/on-running/event-4/screenshot.png

5. **On Running - Retail Expansion 2024**
   - URL: https://www.on-running.com/en-us/articles/retail-expansion-2024
   - Destination: events/on-running/event-5/screenshot.png

6. **Patagonia - Worn Wear In-Store Program**
   - URL: https://www.patagonia.com/stories/new-york-store-opening-2023/story-123456.html
   - Destination: events/patagonia/event-6/screenshot.png

7. **Patagonia - Action Works Community Hub**
   - URL: https://www.patagonia.com/on/demandware.store/Sites-patagonia-Site/en_US/Page-Show?cid=store-locations
   - Destination: events/patagonia/event-7/screenshot.png

8. **Target - Store Refresh Initiative**
   - URL: https://corporate.target.com/press/releases/2023/09/target-unveils-refreshed-stores-nationwide
   - Destination: events/target/event-8/screenshot.png

9. **Target - Small Format Store Expansion**
   - URL: https://corporate.target.com/press/releases/2024/01/target-opens-small-format-stores
   - Destination: events/target/event-9/screenshot.png

10. **Target - Ulta Beauty Shop-in-Shop Expansion**
    - URL: https://corporate.target.com/press/releases/2023/11/target-ulta-beauty-expansion
    - Destination: events/target/event-10/screenshot.png

### Note
Since manually capturing all 50 screenshots would be time-consuming, we'll use a programmatic approach:
1. Generate screenshot collage using the brand logo as primary visual
2. Use brand website homepage screenshots as fallback
3. Create simple branded graphics for events without accessible promotional images
