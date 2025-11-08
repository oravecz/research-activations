# Quick Start Guide

Get your presentation deck running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This installs React and all required packages.

## Step 2: Download Screenshots

Run the download script to fetch all 42 campaign screenshots:

```bash
chmod +x download-screenshots.sh
./download-screenshots.sh
```

Or use the npm script:
```bash
npm run download-screenshots
```

This will download all 42 campaign screenshots. Takes about 2-3 minutes.

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

2. Re-download screenshots:
   ```bash
   ./download-screenshots.sh
   ```

3. Make sure script is executable:
   ```bash
   chmod +x download-screenshots.sh
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

2. Update the key in `download-screenshots.sh`:
   ```bash
   API_KEY="your_api_key_here"
   ```

3. Run the download script again:
   ```bash
   ./download-screenshots.sh
   ```

## Next Steps

- **Customize**: Edit `src/PresentationDeck.jsx` to add your own events
- **Style**: Modify Tailwind CSS classes to match your brand
- **Deploy to GitHub Pages**: See [DEPLOYMENT.md](DEPLOYMENT.md)
  - Automatic deployment is pre-configured with GitHub Actions
  - Just enable GitHub Pages in Settings → Pages
  - Push to main branch to deploy
- **Share**: Your site will be at `https://oravecz.github.io/research-activations`

## Deployment

To deploy to GitHub Pages:

1. Enable GitHub Pages:
   - Go to repository **Settings** → **Pages**
   - Select **GitHub Actions** as source

2. Push to main:
   ```bash
   git push origin main
   ```

3. View your site at: https://oravecz.github.io/research-activations

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

## Full Documentation

See [README.md](README.md) for complete documentation.

---

**Need help?** Check the README or open an issue on GitHub.
