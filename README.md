# Brand Activation Presentation Deck

An interactive React presentation showcasing 42 fashion and footwear brand activations from 2025, complete with live screenshots of each campaign.

## Features

- 📊 Interactive slide deck with 42 brand activations
- 🖼️ Live website screenshots for each campaign
- 🏷️ Category filtering (Holiday Campaigns, Pop-Ups, Collaborations, etc.)
- 📱 Responsive design
- ⌨️ Keyboard navigation
- 🔗 Direct links to source articles
- 🚀 Automatic deployment to GitHub Pages

## Quick Start

### Prerequisites

- Node.js 16+ or Python 3.7+
- An APIFlash account (for screenshot downloads)

### Installation

1. **Clone this repository**
   ```bash
   git clone <your-repo-url>
   cd research-activations
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Download Screenshots**
   ```bash
   chmod +x download-screenshots.sh
   ./download-screenshots.sh
   ```

   Or use npm script:
   ```bash
   npm run download-screenshots
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## Screenshots

All campaign screenshots are stored as static assets in `public/screenshots/` directory.

### Downloading Screenshots

The download script uses curl to fetch all 42 campaign screenshots:

```bash
chmod +x download-screenshots.sh
./download-screenshots.sh
```

Or use the npm script:
```bash
npm run download-screenshots
```

**Features:**
- Downloads all 42 screenshots automatically
- Skips already downloaded files
- Progress tracking
- Error handling with retry capability

**Output:**
- Screenshots saved to: `public/screenshots/event-{1-42}.jpg`

### Custom API Key

To use your own APIFlash API key, edit `download-screenshots.sh`:

```bash
API_KEY="your_api_key_here"
```

Get a free API key at: https://apiflash.com/

## Project Structure

```
research-activations/
├── public/
│   └── screenshots/          # Downloaded campaign screenshots
│       ├── event-1.jpg
│       ├── event-2.jpg
│       ├── ...
│       └── event-42.jpg
├── src/
│   └── PresentationDeck.jsx  # Main presentation component
├── download-screenshots.sh   # Screenshot download script
└── README.md
```

## Event Data

The presentation includes 42 brand activations:

### Categories
- Holiday Campaigns (8 events)
- Designer Collaborations (5 events)
- Pop-Up Activations (7 events)
- Product Launches (4 events)
- Brand Partnerships (3 events)
- Fashion Week Events (4 events)
- And more...

### Featured Brands
Burberry, Gap, Zara, Nike, Prada, Tory Burch, Coach, Adidas, Marc Jacobs, Gucci, Louis Vuitton, Tiffany & Co., and many more.

## Usage

### Keyboard Navigation
- `→` Next slide
- `←` Previous slide
- Click slide indicators to jump to specific slides

### Filtering
Click category buttons at the top to filter events by type:
- All
- Holiday Campaign
- Designer Collaboration
- Retail Takeover
- Product Launch
- And more...

## Customization

### Adding New Events

Edit `src/PresentationDeck.jsx` and add to the `events` array:

```javascript
{
  id: 43,
  brand: "Your Brand",
  title: "Event Title",
  date: "Date",
  location: "Location",
  description: "Event description...",
  activation: "Activation details...",
  url: "https://source-url.com",
  category: "Event Category"
}
```

Then download the screenshot:
```bash
./download-screenshots.sh
```

### Styling

The component uses Tailwind CSS. Customize colors and styles in `src/PresentationDeck.jsx`.

## Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

**Setup:**

1. **Enable GitHub Pages in your repository:**
   - Go to **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**

2. **Enable workflow permissions:**
   - Go to **Settings** → **Actions** → **General**
   - Under "Workflow permissions", select **Read and write permissions**

3. **Push to main branch:**
   ```bash
   git push origin main
   ```

Your site will be deployed to: **https://oravecz.github.io/research-activations**

The deployment workflow automatically:
- Builds the React app
- Deploys to GitHub Pages
- Runs on every push to main/master

**Check deployment status:** Go to the **Actions** tab in your repository

### Manual Deployment

Alternatively, deploy manually:

```bash
npm run deploy
```

### Configuration

If your repository name differs, update `package.json`:

```json
{
  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
}
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment documentation.

## Troubleshooting

### Screenshots Not Loading

1. **Check if screenshots are downloaded:**
   ```bash
   ls -la public/screenshots/
   ```

2. **Re-download screenshots:**
   ```bash
   rm -rf public/screenshots/*.jpg
   ./download-screenshots.sh
   ```

3. **Make script executable:**
   ```bash
   chmod +x download-screenshots.sh
   ```

### API 403 Errors

If you get 403 errors when downloading:
- Verify your API key is correct
- Check APIFlash account quotas
- Ensure IP is not blocked
- Try downloading from a different network

### Missing Dependencies

```bash
npm install lucide-react
```

## Technical Details

### Screenshot API
Screenshots are captured using [APIFlash](https://apiflash.com/), which provides:
- Consistent rendering across all sites
- 768x1280px resolution
- JPEG format (85% quality)
- Full page load waiting

### React Component
- Built with React Hooks (useState)
- Responsive design with Tailwind CSS
- Lazy image loading
- Error handling with fallbacks
- Loading states

## License

MIT

## Credits

Campaign data sourced from:
- WWD (Women's Wear Daily)
- Schon Magazine
- Fashionista
- Hypebeast
- The Zoe Report
- And other fashion publications

---

For questions or issues, please open an issue on GitHub.
