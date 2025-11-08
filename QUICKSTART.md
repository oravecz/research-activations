# Quick Start Guide

Get your presentation deck running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This installs React and all required packages.

## Step 2: Download Screenshots

You have two options:

### Option A: Download All Screenshots (Recommended)

```bash
python3 download_screenshots.py
```

This will download all 42 campaign screenshots. Takes about 2-3 minutes.

### Option B: Test with Sample Screenshots

To quickly test the app, download just a few screenshots manually:

```bash
# Create the screenshots directory
mkdir -p public/screenshots

# Download 3 sample screenshots using curl
curl -o "public/screenshots/event-1.jpg" "https://api.apiflash.com/v1/urltoimage?access_key=f3cae9688a794f2da5192eb2c50f1d3f&wait_until=page_loaded&url=https%3A%2F%2Fwwd.com%2Ffashion-news%2Ffashion-features%2Fburberry-jennifer-saunders-naomi-campbell-christmas-ad-film-1238334044%2F&width=768&height=1280&format=jpeg&quality=85"

curl -o "public/screenshots/event-2.jpg" "https://api.apiflash.com/v1/urltoimage?access_key=f3cae9688a794f2da5192eb2c50f1d3f&wait_until=page_loaded&url=https%3A%2F%2Fwwd.com%2Fbusiness-news%2Fretail%2Fgap-sandy-liang-collaboration-reimagining-gap-icons-downtown-edge-1238271666%2F&width=768&height=1280&format=jpeg&quality=85"

curl -o "public/screenshots/event-3.jpg" "https://api.apiflash.com/v1/urltoimage?access_key=f3cae9688a794f2da5192eb2c50f1d3f&wait_until=page_loaded&url=https%3A%2F%2Fwww.hollywoodreporter.com%2Flifestyle%2Fshopping%2Fzara-50th-anniversary-collection-campaign-how-to-shop-1236211829%2F&width=768&height=1280&format=jpeg&quality=85"
```

## Step 3: Start the App

```bash
npm start
```

The app will open at http://localhost:3000

## Step 4: Navigate the Presentation

- Use **Previous/Next** buttons to navigate
- Click **category filters** to filter by campaign type
- Click **slide indicators** at the bottom to jump to slides
- Click **"View Source Article"** to see the original campaign page

## Troubleshooting

### "Screenshots not loading"

1. Check if screenshots were downloaded:
   ```bash
   ls -la public/screenshots/
   ```

2. Verify the configuration in `src/PresentationDeck.jsx`:
   ```javascript
   const USE_LOCAL_SCREENSHOTS = true;  // Should be true
   ```

### "Module not found: lucide-react"

```bash
npm install lucide-react
```

### "Command not found: react-scripts"

```bash
npm install react-scripts
```

## Using Your Own API Key

To use your own APIFlash API key:

1. Sign up at https://apiflash.com/ (free tier available)

2. Update the key in these files:
   - `download_screenshots.py` (line 3)
   - `src/PresentationDeck.jsx` (line 5)

3. Run the download script again:
   ```bash
   python3 download_screenshots.py
   ```

## Next Steps

- **Customize**: Edit `src/PresentationDeck.jsx` to add your own events
- **Style**: Modify Tailwind CSS classes to match your brand
- **Deploy**: Run `npm run build` to create production build
- **Share**: Deploy to Netlify, Vercel, or GitHub Pages

## Full Documentation

See [README.md](README.md) for complete documentation.

---

**Need help?** Check the README or open an issue on GitHub.
