# Events Directory Structure

This directory contains all brand activation event data, assets, and metadata for the Brand Activation Research and Presentation System.

## Directory Organization

### Structure Convention
```
events/
├── details.json                              # Aggregate data for all 50 events
├── research-report.md                        # Human-readable research summary
├── README.md                                 # This file
└── [brand-name]/                             # Brand-specific directory
    └── [event-id]/                           # Event-specific directory
        ├── metadata.json                     # Event metadata and asset tracking
        ├── logo.png                          # Brand logo image
        ├── promo-1.jpg                       # Promotional image 1
        ├── promo-2.jpg                       # Promotional image 2
        ├── promo-3.jpg                       # Promotional image 3
        ├── promo-4.jpg                       # Promotional image 4 (optional)
        ├── promo-5.jpg                       # Promotional image 5 (optional)
        ├── screenshot.png                    # Playwright screenshot (fallback)
        └── slide-image.png                   # Final 16:9 collage for presentation
```

## Naming Conventions

### Brand Name Directory
- Use lowercase with hyphens for multi-word brands
- Remove special characters and punctuation
- Examples:
  - "Nike" → `nike`
  - "New Balance" → `new-balance`
  - "Gap x Sandy Liang" → `gap-x-sandy-liang`
  - "Tory Burch" → `tory-burch`

### Event ID
- Use lowercase with hyphens
- Should be descriptive and unique within the brand
- Format: `[event-type]-[year]` or `[event-name]-[year]`
- Examples:
  - `holiday-campaign-2025`
  - `air-max-day-2025`
  - `sandy-liang-collab-2025`
  - `50th-anniversary-2025`

### Asset Files
- **logo.png**: Brand logo (PNG format preferred for transparency)
- **promo-[n].jpg**: Promotional images numbered sequentially (1-5)
- **screenshot.png**: Full-page screenshot from Playwright MCP (768x1024)
- **slide-image.png**: Final composite image for presentation slides (16:9 aspect ratio)
- **metadata.json**: Event-specific metadata and asset tracking

## File Schemas

### details.json
Contains array of all 50 validated events with complete information.
See schema definition in details.json file.

### metadata.json (per event)
```json
{
  "eventId": "event-id",
  "brand": "Brand Name",
  "fetchTimestamp": "2025-01-09T10:00:00Z",
  "sourceUrls": {
    "event": "https://example.com/event",
    "logo": "https://example.com/logo.png",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  },
  "assets": {
    "logo": {
      "filename": "logo.png",
      "downloaded": true,
      "timestamp": "2025-01-09T10:00:00Z"
    },
    "promotionalImages": [
      {
        "filename": "promo-1.jpg",
        "downloaded": true,
        "timestamp": "2025-01-09T10:01:00Z"
      }
    ],
    "screenshot": {
      "filename": "screenshot.png",
      "captured": false,
      "timestamp": null
    },
    "slideImage": {
      "filename": "slide-image.png",
      "generated": false,
      "timestamp": null
    }
  },
  "validation": {
    "urlAccessible": true,
    "statusCode": 200,
    "validatedAt": "2025-01-09T10:00:00Z",
    "issues": []
  }
}
```

## Data Quality Guidelines

### URL Validation
- All event URLs must be validated before inclusion
- Events with 404s, 403s, timeouts, or paywalls are excluded entirely
- Validation status tracked in metadata.json

### Asset Requirements
- All events must have either promotional images OR a screenshot
- Final slide-image.png must be 16:9 aspect ratio (1920x1080 or 1280x720)
- Brand logo must be prominent in final slide image
- All assets tracked with source URLs and timestamps

### Event Requirements
- Retail brand activations at store level only
- Events from 2023 onwards
- Minimum 25% (13 events) must focus on footwear brands
- Luxury brands limited to multi-store activations only

## Usage

1. **Research Phase**: Create event directories and populate metadata.json as events are validated
2. **Asset Collection**: Download logos, promotional images, or capture screenshots
3. **Asset Generation**: Create 16:9 slide-image.png collages from source materials
4. **Presentation Integration**: Reference assets from details.json for presentation rendering

## Maintenance

- Keep metadata.json updated with all asset changes
- Track fetch timestamps for all downloaded materials
- Document validation issues in metadata for excluded events
- Maintain consistent naming conventions across all directories
