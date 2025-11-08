#!/bin/bash

API_KEY="f3cae9688a794f2da5192eb2c50f1d3f"
SCREENSHOTS_DIR="public/screenshots"

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"

# Array of URLs and IDs
declare -a EVENTS=(
  "1|https://wwd.com/fashion-news/fashion-features/burberry-jennifer-saunders-naomi-campbell-christmas-ad-film-1238334044/"
  "2|https://wwd.com/business-news/retail/gap-sandy-liang-collaboration-reimagining-gap-icons-downtown-edge-1238271666/"
  "3|https://www.hollywoodreporter.com/lifestyle/shopping/zara-50th-anniversary-collection-campaign-how-to-shop-1236211829/"
  "4|https://wwd.com/footwear-news/shoe-industry-news/nike-running-nordstrom-nyc-pop-up-1238031364/"
  "5|https://wwd.com/footwear-news/shoe-industry-news/gallery/new-balance-nordstrom-nyc-pop-up-photos-1237799692/"
)

echo "Downloading screenshots..."
echo ""

for event in "${EVENTS[@]}"; do
  IFS='|' read -r id url <<< "$event"

  output_file="$SCREENSHOTS_DIR/event-${id}.jpg"

  # Skip if already exists
  if [ -f "$output_file" ]; then
    echo "✓ Screenshot already exists: event-${id}.jpg"
    continue
  fi

  echo "Downloading screenshot for event ${id}..."

  # URL encode the target URL
  encoded_url=$(printf %s "$url" | jq -sRr @uri)

  api_url="https://api.apiflash.com/v1/urltoimage?access_key=${API_KEY}&wait_until=page_loaded&url=${encoded_url}&width=768&height=1280&format=jpeg&quality=85"

  # Download with curl
  if curl -f -s -o "$output_file" "$api_url"; then
    echo "✓ Downloaded: event-${id}.jpg"
  else
    echo "✗ Failed to download: event-${id}.jpg"
    rm -f "$output_file"
  fi

  # Small delay to avoid rate limiting
  sleep 1
done

echo ""
echo "Download complete!"
echo "Screenshots saved to: $SCREENSHOTS_DIR"
