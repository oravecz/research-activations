# Deployment Guide

This document explains how to deploy the Brand Activation Deck to GitHub Pages.

## Automatic Deployment (Recommended)

The project is configured with GitHub Actions for automatic deployment.

### Setup

1. **Enable GitHub Pages in your repository settings:**
   - Go to your GitHub repository
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**

2. **Push to main/master branch:**
   ```bash
   git push origin main
   ```

The GitHub Actions workflow will automatically:
- Build your React app
- Deploy to GitHub Pages
- Make it available at: `https://oravecz.github.io/research-activations`

### Workflow Details

The workflow (`.github/workflows/deploy.yml`) runs when:
- Code is pushed to `main` or `master` branch
- Manually triggered via GitHub Actions tab

**Build steps:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Build React app
5. Deploy to GitHub Pages

### View Deployment Status

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. View the latest workflow run

## Manual Deployment (Alternative)

If you prefer to deploy manually:

### Prerequisites

```bash
npm install -g gh-pages
```

### Deploy

```bash
npm run deploy
```

This will:
1. Build the production version (`npm run build`)
2. Deploy the `build` folder to the `gh-pages` branch
3. GitHub Pages will automatically serve from that branch

## Configuration

### Repository Name

If your repository name is different from `research-activations`, update the homepage in `package.json`:

```json
{
  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
}
```

Also update the `PUBLIC_URL` in `.github/workflows/deploy.yml`:

```yaml
- name: Build application
  run: npm run build
  env:
    CI: false
    PUBLIC_URL: /YOUR_REPO_NAME
```

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to the `public` directory:
   ```
   yourdomain.com
   ```

2. Configure your domain's DNS:
   - Create a CNAME record pointing to `YOUR_USERNAME.github.io`

3. In GitHub Settings → Pages, enter your custom domain

## Troubleshooting

### Deployment fails

**Check these common issues:**

1. **GitHub Pages not enabled:**
   - Settings → Pages → Source should be "GitHub Actions"

2. **Permissions error:**
   - Settings → Actions → General → Workflow permissions
   - Select "Read and write permissions"

3. **Build errors:**
   - Check the Actions tab for error logs
   - Test build locally: `npm run build`

### Blank page after deployment

1. **Check homepage in package.json:**
   ```json
   "homepage": "https://oravecz.github.io/research-activations"
   ```

2. **Verify PUBLIC_URL in workflow:**
   ```yaml
   PUBLIC_URL: /research-activations
   ```

3. **Check browser console** for 404 errors on assets

### Screenshots not loading

If screenshots don't load on GitHub Pages:

1. **Check if screenshots are committed:**
   ```bash
   git ls-files public/screenshots/
   ```

2. **Ensure screenshots are downloaded before deploying:**
   ```bash
   python3 download_screenshots.py
   git add public/screenshots/
   git commit -m "Add screenshots"
   git push
   ```

3. **Check the USE_LOCAL_SCREENSHOTS setting** in `src/PresentationDeck.jsx`:
   ```javascript
   const USE_LOCAL_SCREENSHOTS = true;
   ```

## Environment-Specific Configuration

### Development
```bash
npm start
# Runs on http://localhost:3000
```

### Production Build (Local)
```bash
npm run build
# Creates optimized build in ./build
```

### Preview Production Build Locally
```bash
npm install -g serve
serve -s build
# Preview at http://localhost:3000
```

## Screenshots for Production

Before deploying to production, ensure screenshots are downloaded:

```bash
# Download all screenshots
python3 download_screenshots.py

# Verify screenshots were downloaded
ls -la public/screenshots/

# Add to git if not already committed
git add public/screenshots/*.jpg
git commit -m "Add campaign screenshots"
git push
```

## Deployment Checklist

Before deploying, ensure:

- [ ] All screenshots are downloaded and committed
- [ ] `npm run build` succeeds locally
- [ ] GitHub Pages is enabled in repository settings
- [ ] Workflow permissions are set to "Read and write"
- [ ] Homepage URL is correct in package.json
- [ ] PUBLIC_URL matches your repository name

## GitHub Pages URL

Once deployed, your presentation will be available at:

**https://oravecz.github.io/research-activations**

(Replace with your actual username/repository if different)

## Updating the Deployment

To update the live site:

1. Make your changes
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

3. GitHub Actions will automatically rebuild and deploy

## Need Help?

- Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
- Review the [GitHub Pages documentation](https://docs.github.com/en/pages)
- See workflow logs in the Actions tab of your repository
