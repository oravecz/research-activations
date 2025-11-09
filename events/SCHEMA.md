# Event Data Schema Documentation

## details.json Structure

The `details.json` file contains metadata about the research project and an array of all validated brand activation events.

### Root Level Schema

```json
{
  "metadata": {
    "version": "string",           // Schema version (e.g., "1.0.0")
    "createdAt": "ISO8601",         // Initial creation timestamp
    "lastUpdated": "ISO8601",       // Last modification timestamp
    "totalEvents": "number",        // Current count of validated events
    "targetEvents": "number",       // Target count (50)
    "footwearEvents": "number",     // Count of footwear-focused events
    "footwearPercentage": "number", // Percentage of footwear events
    "validationStatus": "string",   // Status: "in-progress", "complete", "needs-review"
    "notes": "string"               // General notes about the dataset
  },
  "events": []                      // Array of event objects
}
```

### Event Object Schema

Each event in the `events` array must conform to this structure:

```json
{
  "id": "number",                   // Unique numeric identifier (1-50)
  "brand": "string",                // Brand name (e.g., "Nike", "Gap x Sandy Liang")
  "title": "string",                // Event title/name
  "date": "string",                 // Event timeframe (e.g., "March 2025", "Holiday 2025")
  "location": "string",             // Store location(s) or scope (e.g., "Global", "NYC Flagship")
  "description": "string",          // High-level overview of the event/campaign
  "activation": "string",           // Detailed description of what the activation entailed
  "url": "string",                  // Primary source URL (must be validated accessible)
  "category": "string",             // Event category (e.g., "Holiday Campaign", "Pop-Up", "Collaboration")
  "isFootwear": "boolean",          // Whether this is a footwear-focused event
  "validationStatus": {
    "urlAccessible": "boolean",     // Whether URL passed validation
    "statusCode": "number",         // HTTP status code from validation
    "validatedAt": "ISO8601",       // Timestamp of URL validation
    "hasPaywall": "boolean",        // Whether paywall was detected
    "hasRegionBlock": "boolean",    // Whether region blocking was detected
    "issues": []                    // Array of validation issue strings
  },
  "assetInventory": {
    "hasLogo": "boolean",           // Whether brand logo is available
    "hasPromotionalImages": "boolean", // Whether promotional images are available
    "promotionalImageCount": "number", // Number of promotional images (0-5)
    "hasScreenshot": "boolean",     // Whether screenshot was captured
    "hasSlideImage": "boolean",     // Whether final slide image was generated
    "slideImagePath": "string",     // Relative path to slide image
    "lastAssetUpdate": "ISO8601"    // Last time assets were updated
  },
  "fetchTimestamp": "ISO8601"       // When event data was collected
}
```

## Field Definitions

### Core Event Fields (Required)

- **id**: Unique numeric identifier (1-50). Used for ordering and reference.
- **brand**: Official brand name. May include collaborations (e.g., "Gap x Sandy Liang").
- **title**: Descriptive event name. Should clearly identify the activation.
- **date**: Human-readable timeframe. Can be specific dates or general periods.
- **location**: Geographic scope or specific store locations.
- **description**: 2-4 sentence overview of the event/campaign context.
- **activation**: Detailed description of the in-store activation elements.
- **url**: Primary source URL. Must pass validation (no 404s, paywalls, region blocks).
- **category**: Classification tag for the type of activation.
- **isFootwear**: Boolean flag identifying footwear-focused events (for 25% minimum tracking).

### Validation Metadata

- **validationStatus.urlAccessible**: True if URL returns 200/300-level status.
- **validationStatus.statusCode**: HTTP status code from validation check.
- **validationStatus.validatedAt**: ISO8601 timestamp of validation.
- **validationStatus.hasPaywall**: True if paywall detection triggered.
- **validationStatus.hasRegionBlock**: True if region blocking detected.
- **validationStatus.issues**: Array of strings describing any validation problems.

### Asset Inventory

- **assetInventory.hasLogo**: Boolean indicating brand logo file exists.
- **assetInventory.hasPromotionalImages**: Boolean indicating promotional images exist.
- **assetInventory.promotionalImageCount**: Count of promo-[n].jpg files (0-5).
- **assetInventory.hasScreenshot**: Boolean indicating screenshot.png exists.
- **assetInventory.hasSlideImage**: Boolean indicating final slide-image.png exists.
- **assetInventory.slideImagePath**: Relative path from project root to slide image.
- **assetInventory.lastAssetUpdate**: ISO8601 timestamp of last asset modification.

### Timestamps

All timestamps use ISO8601 format with UTC timezone:
```
YYYY-MM-DDTHH:mm:ssZ
```
Example: `2025-01-09T15:30:00Z`

## Event Categories

Recommended category values for consistency:

- "Holiday Campaign"
- "Designer Collaboration"
- "Anniversary Campaign"
- "Pop-Up"
- "Retail Takeover"
- "Product Launch"
- "Experiential Event"
- "Store Opening"
- "Limited Edition"
- "Brand Partnership"

## Validation Rules

### Required Validations

1. **URL Accessibility**: Must return HTTP 200 or 300-level status
2. **No Paywalls**: Content must be freely accessible
3. **No Region Blocks**: Must be accessible from US
4. **No 404 Errors**: URL must resolve to valid content
5. **No 403 Forbidden**: Content must not be blocked

### Event Exclusion Criteria

Events are excluded entirely if:
- URL validation fails (404, 403, timeout)
- Paywall detected
- Region blocking detected
- Event is pre-2023
- Event is online-only (not store-level)
- Luxury brand with single-location activation

### Footwear Tracking

- Minimum 13 events (26% of 50) must have `isFootwear: true`
- Track running count in `metadata.footwearEvents`
- Calculate percentage in `metadata.footwearPercentage`

## Asset Path Convention

Asset paths are relative to project root:

```
events/[brand-name]/[event-id]/slide-image.png
```

Example:
```
events/nike/air-max-day-2025/slide-image.png
```

## Usage Examples

### Complete Event Example

```json
{
  "id": 1,
  "brand": "Nike",
  "title": "Air Max Day 2025 Sneakeasy Pop-Ups",
  "date": "March 26, 2025",
  "location": "New York, Los Angeles, Chicago, Toronto",
  "description": "Nike hosted limited invite and RSVP-only consumer pop-ups featuring Nike-inspired artwork and interactive experiences to celebrate the 30th anniversary of Air Max.",
  "activation": "Installations by local artists in each city inspired by Air Max silhouettes. Featured the new VaporMax shoes with giant screens, futuristic mirror backdrops, and opportunities to purchase or customize Nike Air VaporMax through NikeiD.",
  "url": "https://www.bizbash.com/experiential-marketing/see-inside-nike-s-shoe-inspired-pop-ups",
  "category": "Anniversary Event",
  "isFootwear": true,
  "validationStatus": {
    "urlAccessible": true,
    "statusCode": 200,
    "validatedAt": "2025-01-09T10:00:00Z",
    "hasPaywall": false,
    "hasRegionBlock": false,
    "issues": []
  },
  "assetInventory": {
    "hasLogo": true,
    "hasPromotionalImages": true,
    "promotionalImageCount": 4,
    "hasScreenshot": false,
    "hasSlideImage": true,
    "slideImagePath": "events/nike/air-max-day-2025/slide-image.png",
    "lastAssetUpdate": "2025-01-09T12:00:00Z"
  },
  "fetchTimestamp": "2025-01-09T10:00:00Z"
}
```

## Integration with PresentationDeck.jsx

The React presentation component expects this minimal schema:

```javascript
{
  id: number,
  brand: string,
  title: string,
  date: string,
  location: string,
  description: string,
  activation: string,
  url: string,
  category: string
}
```

Our extended schema is backward-compatible. The presentation component can access the core fields while additional metadata is available for validation and asset management.

## Maintenance Guidelines

1. **Keep Counts Updated**: Update `metadata.totalEvents` and `metadata.footwearEvents` as events are added
2. **Track Timestamps**: Update `metadata.lastUpdated` whenever events are modified
3. **Validate Before Adding**: Only add events that pass all validation checks
4. **Asset Sync**: Update `assetInventory` whenever assets are created or modified
5. **Consistency**: Maintain consistent category naming and field formatting
