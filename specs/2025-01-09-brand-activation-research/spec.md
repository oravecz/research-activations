# Specification: Brand Activation Research and Presentation System

## Goal
Research system to identify, document, and present 50 US retail brand activation events (2023+) with automated data collection, URL validation, and visual asset generation.

## User Stories
- As a researcher, I want to systematically document retail brand activations to create a comprehensive database
- As a presentation creator, I want polished slides with visual assets for professional stakeholder presentations

## Specific Requirements

**Research and Event Identification**
- Identify 50 brand activation events in retail space at store level from 2023 onwards
- Limit luxury brands to multiple store activations only (exclude single-location events)
- Validate all event URLs - exclude events with 404s, paywalls, or access issues
- Each event must include: brand name, event name, timeframe, store scope, activation description, promotion methods, and source URLs

**Data Storage Structure**
- Use global project-level organization for reusability across presentations
- Store images and downloaded assets in `events/[brand-name]/[event-id]/` directory structure
- Maintain aggregate event information in `events/details.json` file
- Include metadata files with downloaded promotional images, screenshots, source URLs, and fetch timestamps
- Store both raw event details (JSON or markdown) and processed visual assets in organized hierarchy

**URL Validation and Asset Collection**
- Validate all URLs programmatically before including event in dataset
- Download promotional images from event websites and marketing materials
- Capture screenshots using Playwright MCP when promotional images are unsatisfactory
- Track fetch timestamps and source URLs for all downloaded assets
- Exclude any events that fail URL validation from both JSON data and assets folder

**Visual Asset Generation**
- Create representative image for each event featuring brand logo prominently at top
- Generate collage of 3-5 promotional images from event materials/website
- Use Playwright MCP to capture 768x1024 browser screenshots as fallback option
- Ensure all final slide images conform to 16:9 aspect ratio
- Store both source images and generated composite images in event-specific folders

**Output Format - JSON**
- Generate structured JSON file containing all 50 events' complete data
- Follow existing event data schema: id, brand, title, date, location, description, activation, url, category
- Enable programmatic access for various presentation and reporting tools
- Include validation status and asset inventory for each event
- Maintain consistency with existing PresentationDeck.jsx component expectations

**Output Format - Markdown Report**
- Create markdown summary of research findings
- Include overview statistics (total events, brand distribution, categories)
- Provide event summaries organized by category
- Document validation results and excluded events
- Include asset inventory and file structure

**Presentation Slide Requirements**
- Generate slides in 16:9 aspect ratio format
- Each slide contains: event title as "Brand - Event Name", event details section, and representative image
- Event details include: timeframe, store scope, activation description, promotion methods, and URL links
- Visual asset positioned to fill left or right side of slide (768x1024 optimized sizing)
- Follow existing React-based presentation component patterns for consistency

## Visual Design
No visual mockups provided for this specification.

## Existing Code to Leverage

**React Presentation Component (PresentationDeck.jsx)**
- Existing slide navigation with ChevronLeft/ChevronRight controls and keyboard support
- Event data structure with id, brand, title, date, location, description, activation, url, and category fields
- Screenshot integration logic with local/API toggle (USE_LOCAL_SCREENSHOTS flag)
- Reuse component architecture and styling patterns for new presentation generation
- Leverage existing event schema for JSON output consistency

**Screenshot Download Script (download-screenshots.sh)**
- Shell script pattern using APIFlash service for URL-to-image conversion
- Configurable dimensions (768x1280) matching slide requirements
- Array-based batch processing with status tracking
- Error handling with file existence checks and curl failure detection
- Adapt script for Playwright MCP integration and validation workflow

**Screenshot Manifest (public/screenshots/manifest.json)**
- JSON structure tracking total, successful, and failed screenshot counts
- Screenshots array inventory for asset management
- Use pattern for tracking validation results and asset generation status
- Extend structure to include event metadata and validation timestamps
- Reference for building events/details.json aggregate file

**Package Configuration (package.json)**
- Existing React + Tailwind CSS + Lucide Icons stack
- Build scripts for development and production deployment
- Custom download-screenshots script pattern for asset automation
- Dependencies suitable for presentation rendering and image processing
- Extend with additional tools for web scraping, validation, and image manipulation

**Event Data Schema Pattern**
- Consistent field naming: id (numeric), brand (string), title (string), date (string), location (string)
- Separation of description (overview) and activation (specific details) fields
- URL field for source validation and reference
- Category field for event classification and filtering
- Maintain schema compatibility for seamless integration with existing presentation code

## Out of Scope
- Events from before 2023 are excluded from research
- Non-retail or online-only activations not included
- Single-location luxury brand events excluded unless part of multi-store activation
- Events with inaccessible URLs (404, paywall, region blocks) must be excluded entirely
- Manual image editing or enhancement beyond automated collage generation
- Custom branding or theming beyond 16:9 slide format requirements
- PowerPoint file generation (HTML intermediate format only in this phase)
- Real-time data updates or dynamic content fetching during presentations
- User authentication or access control for presentation viewing
- Analytics or tracking of presentation engagement metrics
