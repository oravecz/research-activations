# NPM Scripts Reference

Complete automation scripts for the Brand Activation Research system.

## Quick Start

```bash
# Complete workflow: validate, setup, download logos, update inventory, build
npm run workflow:complete

# Or run individual steps:
npm run events:validate    # Validate all event URLs
npm run events:setup       # Create directory structure
npm run events:logos       # Download all brand logos
npm run events:inventory   # Update imageInventory in database
```

## Development Scripts

### Core Development
```bash
npm start              # Start Vite dev server (alias: npm run dev)
npm run build          # Build production bundle
npm run preview        # Preview production build locally
npm test               # Run Vitest in watch mode
npm run test:ui        # Run Vitest with UI interface
```

## Event Management Scripts

### Validation Scripts
```bash
# Validate all 50 event URLs
npm run events:validate

# Check logo download status
npm run events:status
```

**Output:**
- URL accessibility report
- Success/failure counts
- List of any failed URLs

### Setup & Asset Collection
```bash
# Create directory structure for all events
npm run events:setup

# Download logos for all events (uses Clearbit API)
npm run events:logos

# Update imageInventory in events/details.json
npm run events:inventory

# Get instructions for manual image collection
npm run events:instructions
npm run events:instructions -- 61  # For specific event ID
```

**Directory Structure Created:**
```
events/
  nike/
    event-1/
      images/
        image-0.png  # Logo (downloaded automatically)
        image-1.png  # Promotional image (manual)
        ...
        image-8.png  # Promotional image (manual)
```

### Complete Event Pipeline
```bash
# Run full setup: directories + logos + inventory
npm run events:complete
```

**This runs:**
1. `events:setup` - Create all directories
2. `events:logos` - Download all 50 logos
3. `events:inventory` - Update database with asset info

## Batch Operations

### Working with Event Batches
```bash
# Validate URLs in a JSON array file
npm run batch:validate -- new-events-batch-1.json

# Add new events from JSON file to database
npm run batch:add -- new-events-batch-1.json

# Remove events with failed URLs
npm run cleanup:failed
```

**Example Workflow for Adding New Events:**
```bash
# 1. Create new-events.json with your events array
# 2. Validate the URLs
npm run batch:validate -- new-events.json

# 3. If all pass, add to database
npm run batch:add -- new-events.json

# 4. Download logos for new events
npm run events:logos

# 5. Update inventory
npm run events:inventory
```

## Workflow Automation

### End-to-End Workflows
```bash
# Validate all event URLs
npm run workflow:validate

# Setup directories and download logos
npm run workflow:setup

# Complete workflow: validate → setup → logos → inventory → build
npm run workflow:complete

# Prep for deployment: complete workflow + preview
npm run deploy:prep
```

### Workflow Breakdown

**`workflow:complete`** runs:
1. `events:validate` - Validate all 50 event URLs
2. `events:setup` - Create directory structure
3. `events:logos` - Download all logos
4. `events:inventory` - Update database
5. `build` - Build production bundle

**Total time:** ~2-3 minutes

## Legacy/Advanced Scripts

```bash
npm run validate-url        # Single URL validation (old script)
npm run capture-screenshot  # Screenshot tool (legacy)
npm run create-collage      # Collage creation (legacy)
```

## Script Combinations

### Fresh Start
```bash
# Starting from scratch with events/details.json
npm run workflow:complete
npm start
```

### After Adding New Events
```bash
npm run events:logos
npm run events:inventory
npm run build
```

### Before Deployment
```bash
npm run events:validate     # Ensure all URLs still work
npm run workflow:complete   # Rebuild everything
npm run preview            # Test production build
```

### Development Cycle
```bash
npm start                   # Start dev server
# Make changes to React components
npm run build              # Test production build
npm run preview            # Preview production build
```

## Image Collection Workflow

### Automated (Logos Only) ✓ COMPLETED
```bash
npm run events:logos
npm run events:status      # Verify 50/50 downloaded
```

### Manual (Promotional Images)
```bash
# Get instructions for specific event
npm run events:instructions -- 61

# After manually adding images to events/[brand]/event-[id]/images/
npm run events:inventory
```

### Updating Image Inventory
```bash
# Update for all events
npm run events:inventory

# Or for specific event
node scripts/collect-images-playwright.js update-inventory 61
```

## Common Scenarios

### Scenario 1: New Repository Clone
```bash
npm install
npm run workflow:complete
npm start
```

### Scenario 2: URL Went Bad
```bash
# Find and remove bad URL event
npm run events:validate
# Manually remove event or run cleanup
npm run cleanup:failed
# Add replacement event
npm run batch:add -- new-event.json
npm run events:logos
```

### Scenario 3: Adding 10 New Events
```bash
# Create new-events.json with 10 events
npm run batch:validate -- new-events.json
npm run batch:add -- new-events.json
npm run events:logos
npm run events:inventory
npm run build
```

### Scenario 4: Deploying to GitHub Pages
```bash
npm run deploy:prep       # Complete workflow + preview
# If preview looks good:
npm run build
git add .
git commit -m "Update events and rebuild"
git push
```

## Environment Variables

No environment variables required! All scripts work out of the box.

## Exit Codes

All scripts return:
- `0` - Success
- `1` - Error (check console output)

## Performance Notes

- **`events:logos`**: ~30-60 seconds (downloads 50 logos)
- **`events:validate`**: ~30-45 seconds (validates 50 URLs)
- **`workflow:complete`**: ~2-3 minutes (full pipeline)
- **`build`**: ~10-20 seconds (Vite production build)

## Troubleshooting

### Logo Download Fails
```bash
# Check status
npm run events:status

# Re-run logo download (safe to run multiple times)
npm run events:logos
```

### URLs Failing Validation
```bash
# See which URLs are failing
npm run events:validate

# Remove failed events
npm run cleanup:failed

# Add replacement events
npm run batch:add -- new-events.json
```

### Build Errors
```bash
# Clean and rebuild
rm -rf dist node_modules/.vite
npm run build
```

## Script Dependencies

```
workflow:complete
  ├── events:validate
  ├── events:setup
  ├── events:logos
  ├── events:inventory
  └── build

events:complete
  ├── events:setup
  ├── events:logos
  └── events:inventory
```

## Next Steps After Running Scripts

After running `npm run workflow:complete`:

1. **✓ Database**: 50 events with validated URLs
2. **✓ Logos**: All brand logos downloaded
3. **✓ Inventory**: Database updated with asset paths
4. **✓ Build**: Production bundle ready

**Optional:**
- Add promotional images manually for priority events
- Run `npm run events:inventory` after adding images
- Deploy to GitHub Pages or other hosting

## Support

See documentation:
- `CLAUDE.md` - Architecture and commands
- `PROGRESS-REPORT.md` - Current project status
- `IMAGE-COLLECTION-STRATEGY.md` - Image collection options
- `COMPLETION-SUMMARY.md` - Final results summary
