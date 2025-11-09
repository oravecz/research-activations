# Brand Activation Research and Presentation System

Research system to identify, document, and present retail brand activation events with automated data collection, URL validation, visual asset generation, and interactive presentation.

## Overview

- Research and validate 50+ brand activation events (2023+)
- Automated asset generation and organization
- Professional 16:9 presentation slides with brand logos
- Structured JSON and markdown output
- Interactive React-based presentation

## Project Status

**COMPLETE** - 50 events documented and ready for presentation

- 50 retail brand activations researched (2023-2024)
- 100% URL validation completed
- 50 professional slide images (1920x1080, 16:9)
- Interactive presentation deck functional
- Comprehensive research report generated

## Quick Start

### View the Presentation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Visit http://localhost:3000 to view the interactive presentation deck with all 50 brand activation events.

### Explore the Research Data

- **Interactive Presentation**: Launch with `npm start`
- **Research Report**: Read `events/research-report.md`
- **Raw Data**: Review `events/details.json`
- **Visual Assets**: Browse `events/[brand-name]/[event-id]/`

## Project Structure

```
research-activations/
├── src/                             # React presentation application
│   ├── PresentationDeck.jsx         # Main presentation component
│   └── index.js                     # React app entry point
│
├── public/                          # Static assets for web app
│   └── index.html                   # HTML template
│
├── events/                          # Event data and assets
│   ├── details.json                 # Aggregate data for all 50 events
│   ├── research-report.md           # Comprehensive research summary
│   └── [brand-name]/                # Brand-specific directories
│       └── [event-id]/              # Event-specific directories
│           ├── metadata.json        # Asset tracking and validation
│           ├── logo.png             # Brand logo
│           └── slide-image.png      # Final 16:9 presentation image
│
├── scripts/                         # Utility scripts
│   ├── validate-url.js              # URL validation utility
│   ├── capture-screenshot.js        # Screenshot capture wrapper
│   ├── create-collage.js            # Image collage generator
│   ├── generate-slide-images.js     # Batch slide generation
│   ├── batch-download-logos.js      # Automated logo downloading
│   └── process-visual-assets.js     # Visual asset processing
│
├── specs/                           # Project specifications
│   └── 2025-01-09-brand-activation-research/
│       ├── spec.md                  # Feature specification
│       ├── tasks.md                 # Task breakdown
│       └── planning/
│           └── requirements.md      # Detailed requirements
│
├── .github/workflows/               # GitHub Actions
│   └── deploy.yml                   # Automated deployment to GitHub Pages
│
├── package.json                     # Node.js dependencies
├── package-lock.json                # Locked dependency versions
└── README.md                        # This file
```

## Presentation Features

### Interactive Presentation Deck

The React-based presentation system includes:

- **50+ Professional Slides**: Title slide + 50 event slides with brand visuals
- **Category Filtering**: Filter events by category (footwear, apparel, beauty, etc.)
- **Keyboard Navigation**: Arrow keys for next/previous slide
- **Visual Indicators**: Progress dots showing current position
- **Responsive Design**: Optimized for various screen sizes
- **External Links**: Direct links to source articles
- **Dynamic Data Loading**: Loads from `events/details.json`

### Navigation Controls

- **Arrow Keys**: Left/Right for navigation
- **Click Controls**: Previous/Next buttons
- **Slide Indicators**: Click any dot to jump to that slide
- **Category Filters**: Filter events by category (resets to slide 1)

### Slide Content

Each event slide displays:
- Brand name and event title
- Event date and location
- Store scope (all stores vs. select)
- Event description
- Brand activation details
- Promotion methods
- Category badge
- Source article link
- Professional brand visual (16:9 aspect ratio)

## Research Summary

### Key Statistics

- **Total Events**: 50
- **Unique Brands**: 40
- **Categories**: 10 distinct retail categories
- **Validation Rate**: 100%
- **Asset Completion**: 100%

### Category Distribution

Apparel (15), Footwear (14), Home Goods (5), Beauty (3), General Retail (3), Technology (2), Outdoor (2), Sporting Goods (2), Grocery (2), Accessories (2)

### Featured Brands

**Footwear**: Nike, On Running, adidas, Foot Locker, Crocs, New Balance, Allbirds, Vans, Converse

**Apparel**: Lululemon, Athleta, Alo Yoga, Zara, Patagonia, Gap, H&M, Urban Outfitters, Anthropologie, Everlane, Madewell, Outdoor Voices, Free People Movement, Vuori

**Beauty**: Sephora, Ulta Beauty, Target (Ulta partnership)

**Technology**: Apple, Best Buy

**Home Goods**: IKEA, West Elm, CB2, Williams Sonoma

**Retail**: Target, Nordstrom, REI, Dick's Sporting Goods, Whole Foods, Trader Joe's

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd research-activations

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Development

### Running Locally

```bash
# Start React development server
npm start
# Visit http://localhost:3000

# Build production bundle
npm run build
# Output in /build directory

# Test production build locally
npx serve -s build
```

### Available Scripts

#### Presentation Scripts
```bash
npm start          # Start development server
npm run build      # Build production bundle
npm test           # Run tests
```

#### Utility Scripts
```bash
npm run validate-url          # Validate a URL
npm run capture-screenshot    # Capture screenshots
npm run create-collage        # Generate image collages
```

## Deployment

### GitHub Pages

The project includes automated GitHub Actions deployment:

1. **Automatic Deployment**:
   - Pushes to `main` or `master` branch trigger deployment
   - Build and deploy process handled automatically
   - Live site published to GitHub Pages

2. **Manual Deployment**:
   - Go to Actions tab in GitHub
   - Select "Deploy to GitHub Pages" workflow
   - Click "Run workflow"

3. **Configuration**:
   - Workflow: `.github/workflows/deploy.yml`
   - Enable GitHub Pages in repository settings
   - Set source to "GitHub Actions"

### Static Hosting

The production build can be deployed to any static hosting service:

```bash
# Build production bundle
npm run build

# Deploy /build directory to:
# - Netlify
# - Vercel
# - AWS S3
# - Firebase Hosting
# - Any static file server
```

## Data Schema

### Event Object Structure

```json
{
  "id": 1,
  "brand": "Nike",
  "title": "Nike Rise Store Concept",
  "date": "2023-2024",
  "location": "Multiple US cities",
  "description": "Event overview and context...",
  "activation": "Specific activation tactics and features...",
  "url": "https://source-url.com",
  "category": "footwear",
  "storeScope": "select",
  "promotionMethods": "Marketing and promotion channels...",
  "validationStatus": "accessible",
  "validatedAt": "2025-11-09T16:00:00Z",
  "assetInventory": {
    "hasLogo": true,
    "logoPath": "events/nike/event-1/logo.png",
    "hasCollage": true,
    "collagePath": "events/nike/event-1/slide-image.png",
    "lastUpdated": "2025-11-09T16:16:10.626Z"
  }
}
```

### Required Fields

- **id**: Unique numeric identifier (1-50)
- **brand**: Brand name
- **title**: Event title
- **date**: Event timeframe
- **location**: Store locations or scope
- **description**: Event overview
- **activation**: Activation details
- **url**: Source URL (validated)
- **category**: Event category

### Optional Fields

- **storeScope**: "all" or "select"
- **promotionMethods**: Marketing channels
- **validationStatus**: URL validation result
- **assetInventory**: Asset tracking metadata

## Research Methodology

1. **Brand Discovery** - Retail industry publications/press releases, store-level activations (2023+), multi-store focus, luxury brands limited to multi-store only
2. **URL Validation** - Automated HTTP testing, status verification, paywall detection
3. **Asset Collection** - Brand logos (Clearbit API), professional slide images (1920x1080, 16:9), metadata tracking
4. **Quality Standards** - 100% validation, complete data fields, professional visuals, comprehensive documentation

## Key Trends Identified

### 1. Experiential Retail
- In-store customization and personalization
- Community programming (fitness, workshops, events)
- Expert consultations and styling services
- Technology integration (AR, apps, smart mirrors)

### 2. Sustainability Focus
- Repair and alterations services
- Trade-in and recycling programs
- Production transparency
- Extended garment life education

### 3. Community-Centric
- Free fitness classes and wellness programs
- Local artist and creator partnerships
- Social gathering spaces
- Activism and advocacy integration

### 4. Technology Integration
- App-exclusive benefits
- Virtual try-on and AR
- Digital product information
- RFID checkout systems

### 5. Service Expansion
- Personal styling consultations
- Equipment rental programs
- Installation and tech support
- Educational workshops

## Maintenance

### Updating Events

1. Add new events to `events/details.json`
2. Create event directory and assets
3. Run `npm run build` to rebuild presentation
4. Push changes to trigger deployment

### Asset Management

Assets are organized by brand and event:
```
events/[brand-name]/[event-id]/
├── logo.png          # Brand logo
├── slide-image.png   # 16:9 presentation image
└── metadata.json     # Asset tracking
```

### URL Validation

Periodically revalidate URLs:
```bash
node scripts/validate-url.js --json events/details.json
```

## Technologies Used

### Frontend
- **React 18**: UI framework
- **Tailwind CSS**: Styling (via CDN)
- **Lucide React**: Icon library

### Build Tools
- **React Scripts**: Build and dev server
- **Create React App**: Project scaffolding

### Asset Processing
- **Sharp**: Image processing
- **Node.js**: Scripting runtime

### Deployment
- **GitHub Actions**: CI/CD
- **GitHub Pages**: Static hosting

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Build Size**: ~49 KB gzipped (main bundle)
- **Load Time**: < 2 seconds on fast connection
- **Image Loading**: Lazy loading for slide images
- **Assets**: ~15-20 MB total (logos + slide images)

## Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Asset Loading Issues

- Verify file paths in `events/details.json`
- Check `assetInventory.collagePath` values
- Ensure images exist at specified paths
- Verify 16:9 aspect ratio (1920x1080)

### Deployment Issues

- Check GitHub Actions logs
- Verify GitHub Pages is enabled
- Ensure workflow has proper permissions
- Check `package.json` homepage field if using subdirectory

## Documentation

- **Research Report**: `events/research-report.md`
- **Event Data**: `events/details.json`
- **Specification**: `specs/2025-01-09-brand-activation-research/spec.md`
- **Tasks**: `specs/2025-01-09-brand-activation-research/tasks.md`
- **Requirements**: `specs/2025-01-09-brand-activation-research/planning/requirements.md`

## Future Enhancements

Potential improvements:
- Export to PowerPoint/PDF
- Search functionality
- Advanced filtering options
- Analytics tracking
- Share individual slides
- Print-optimized views
- Bookmark favorite events

## License

MIT

## Support

For questions or issues:
1. Review documentation in `specs/` directory
2. Check research report in `events/research-report.md`
3. Examine event data schema in `events/details.json`
4. Review component code in `src/PresentationDeck.jsx`

## Acknowledgments

Research system documenting innovative retail brand activation strategies across the United States (2023-2025), focusing on experiential retail trends.

---

**Version**: 1.0.0
**Last Updated**: November 9, 2025
**Status**: Production Ready
**Events**: 50 documented and validated
