#!/bin/bash

# Download all brand activation screenshots
# Usage: ./download-screenshots.sh

set -e

API_KEY="f3cae9688a794f2da5192eb2c50f1d3f"
SCREENSHOTS_DIR="public/screenshots"

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"

echo "=========================================="
echo "Brand Activation Screenshot Downloader"
echo "=========================================="
echo ""

# Counter for progress
total=42
downloaded=0
skipped=0
failed=0

# Function to URL encode
urlencode() {
    python3 -c "import urllib.parse; print(urllib.parse.quote('$1'))"
}

# Function to download a screenshot
download_screenshot() {
    local id=$1
    local url=$2
    local filename="event-${id}.jpg"
    local filepath="${SCREENSHOTS_DIR}/${filename}"

    # Skip if already exists
    if [ -f "$filepath" ]; then
        echo "[$id/$total] ✓ Already exists: $filename"
        ((skipped++))
        return 0
    fi

    echo "[$id/$total] Downloading: $filename"

    # URL encode the target URL
    local encoded_url=$(urlencode "$url")
    local api_url="https://api.apiflash.com/v1/urltoimage?access_key=${API_KEY}&wait_until=page_loaded&url=${encoded_url}&width=768&height=1280&format=jpeg&quality=85"

    # Download with curl
    if curl -f -s -o "$filepath" "$api_url"; then
        # Verify file was created and has content
        if [ -f "$filepath" ] && [ -s "$filepath" ]; then
            echo "[$id/$total] ✓ Downloaded: $filename"
            ((downloaded++))
        else
            echo "[$id/$total] ✗ Failed: Empty file"
            rm -f "$filepath"
            ((failed++))
        fi
    else
        echo "[$id/$total] ✗ Failed: Download error"
        rm -f "$filepath"
        ((failed++))
    fi

    # Small delay to avoid rate limiting
    sleep 1
}

# Download all screenshots
echo "Starting download of $total screenshots..."
echo ""

download_screenshot 1 "https://wwd.com/fashion-news/fashion-features/burberry-jennifer-saunders-naomi-campbell-christmas-ad-film-1238334044/"
download_screenshot 2 "https://wwd.com/business-news/retail/gap-sandy-liang-collaboration-reimagining-gap-icons-downtown-edge-1238271666/"
download_screenshot 3 "https://www.hollywoodreporter.com/lifestyle/shopping/zara-50th-anniversary-collection-campaign-how-to-shop-1236211829/"
download_screenshot 4 "https://wwd.com/footwear-news/shoe-industry-news/nike-running-nordstrom-nyc-pop-up-1238031364/"
download_screenshot 5 "https://wwd.com/footwear-news/shoe-industry-news/gallery/new-balance-nordstrom-nyc-pop-up-photos-1237799692/"
download_screenshot 6 "https://www.bizbash.com/experiential-marketing/see-inside-nike-s-shoe-inspired-pop-ups"
download_screenshot 7 "https://schonmagazine.com/prada-holiday-2025-campaign-a-winters-tale/"
download_screenshot 8 "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/"
download_screenshot 9 "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc"
download_screenshot 10 "https://news.adidas.com/global/the-first-adidas-clot-pop-up-store-in-london-is-offering-an-exclusive-experience-during-wimbledon-fr/s/7c341a9d-a11c-4bd2-8994-7d5c243c17f6"
download_screenshot 11 "https://officemagazine.net/adidas-superstar-gets-vintage-la-remix"
download_screenshot 12 "https://nycplugged.com/nyfw-september-2025-pop-ups-parties-shows-and-more/"
download_screenshot 13 "https://us.fashionnetwork.com/news/Nana-jacqueline-opens-first-nyc-pop-up-in-soho,1678253.html"
download_screenshot 14 "https://www.thezoereport.com/fashion/october-2025-fashion-news"
download_screenshot 15 "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc"
download_screenshot 16 "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc"
download_screenshot 17 "https://tryon.kivisense.com/blog/brand-activation/"
download_screenshot 18 "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/"
download_screenshot 19 "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/"
download_screenshot 20 "https://www.wmagazine.com/fashion/best-holiday-2025-campaigns"
download_screenshot 21 "https://www.wmagazine.com/fashion/best-holiday-2025-campaigns"
download_screenshot 22 "https://wwd.com/footwear-news/sneaker-news/sneaker-release-date-calendar-june-2025-1237875104/"
download_screenshot 23 "https://sia-news.com/all-of-the-2025-holiday-campaigns-shaping-the-season/"
download_screenshot 24 "https://www.wallpaper.com/design-interiors/zara-50-anniversary-collection"
download_screenshot 25 "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"
download_screenshot 26 "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"
download_screenshot 27 "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"
download_screenshot 28 "https://nycplugged.com/nyfw-september-2025-pop-ups-parties-shows-and-more/"
download_screenshot 29 "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"
download_screenshot 30 "https://www.averagesocialite.com/fashion-beauty"
download_screenshot 31 "https://www.averagesocialite.com/fashion-beauty"
download_screenshot 32 "https://thefashionography.com/fashion/fashion-campaigns/"
download_screenshot 33 "https://thefashionography.com/fashion/fashion-campaigns/"
download_screenshot 34 "https://thefashionography.com/fashion/fashion-campaigns/"
download_screenshot 35 "https://thefashionography.com/fashion/fashion-campaigns/"
download_screenshot 36 "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"
download_screenshot 37 "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"
download_screenshot 38 "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"
download_screenshot 39 "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"
download_screenshot 40 "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/"
download_screenshot 41 "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/"
download_screenshot 42 "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/"

# Summary
echo ""
echo "=========================================="
echo "Download Complete!"
echo "=========================================="
echo "Total screenshots: $total"
echo "Downloaded: $downloaded"
echo "Skipped (already exists): $skipped"
echo "Failed: $failed"
echo ""
echo "Screenshots saved to: $SCREENSHOTS_DIR"
echo ""

if [ $failed -gt 0 ]; then
    echo "⚠️  Warning: $failed screenshot(s) failed to download"
    echo "You can re-run this script to retry failed downloads"
    exit 1
else
    echo "✓ All screenshots downloaded successfully!"
    exit 0
fi
