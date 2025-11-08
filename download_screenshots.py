#!/usr/bin/env python3
import urllib.request
import urllib.parse
import os
import time
import json

API_KEY = 'f3cae9688a794f2da5192eb2c50f1d3f'
SCREENSHOTS_DIR = 'public/screenshots'

events = [
    {"id": 1, "brand": "Burberry", "url": "https://wwd.com/fashion-news/fashion-features/burberry-jennifer-saunders-naomi-campbell-christmas-ad-film-1238334044/"},
    {"id": 2, "brand": "Gap x Sandy Liang", "url": "https://wwd.com/business-news/retail/gap-sandy-liang-collaboration-reimagining-gap-icons-downtown-edge-1238271666/"},
    {"id": 3, "brand": "Zara", "url": "https://www.hollywoodreporter.com/lifestyle/shopping/zara-50th-anniversary-collection-campaign-how-to-shop-1236211829/"},
    {"id": 4, "brand": "Nike", "url": "https://wwd.com/footwear-news/shoe-industry-news/nike-running-nordstrom-nyc-pop-up-1238031364/"},
    {"id": 5, "brand": "New Balance", "url": "https://wwd.com/footwear-news/shoe-industry-news/gallery/new-balance-nordstrom-nyc-pop-up-photos-1237799692/"},
    {"id": 6, "brand": "Nike Air Max", "url": "https://www.bizbash.com/experiential-marketing/see-inside-nike-s-shoe-inspired-pop-ups"},
    {"id": 7, "brand": "Prada", "url": "https://schonmagazine.com/prada-holiday-2025-campaign-a-winters-tale/"},
    {"id": 8, "brand": "Tory Burch", "url": "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/"},
    {"id": 9, "brand": "Coach", "url": "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc"},
    {"id": 10, "brand": "Adidas CLOT", "url": "https://news.adidas.com/global/the-first-adidas-clot-pop-up-store-in-london-is-offering-an-exclusive-experience-during-wimbledon-fr/s/7c341a9d-a11c-4bd2-8994-7d5c243c17f6"},
    {"id": 11, "brand": "Adidas x Qias Omar", "url": "https://officemagazine.net/adidas-superstar-gets-vintage-la-remix"},
    {"id": 12, "brand": "Marc Jacobs", "url": "https://nycplugged.com/nyfw-september-2025-pop-ups-parties-shows-and-more/"},
    {"id": 13, "brand": "Nana Jacqueline", "url": "https://us.fashionnetwork.com/news/Nana-jacqueline-opens-first-nyc-pop-up-in-soho,1678253.html"},
    {"id": 14, "brand": "A.P.C. x Marc Jacobs", "url": "https://www.thezoereport.com/fashion/october-2025-fashion-news"},
    {"id": 15, "brand": "Gymshark", "url": "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc"},
    {"id": 16, "brand": "Pleasing (Harry Styles)", "url": "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc"},
    {"id": 17, "brand": "Loewe", "url": "https://tryon.kivisense.com/blog/brand-activation/"},
    {"id": 18, "brand": "Tommy Hilfiger x JISOO", "url": "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/"},
    {"id": 19, "brand": "Jimmy Choo", "url": "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/"},
    {"id": 20, "brand": "Tiffany & Co.", "url": "https://www.wmagazine.com/fashion/best-holiday-2025-campaigns"},
    {"id": 21, "brand": "Bergdorf Goodman", "url": "https://www.wmagazine.com/fashion/best-holiday-2025-campaigns"},
    {"id": 22, "brand": "Tyler, the Creator x Converse", "url": "https://wwd.com/footwear-news/sneaker-news/sneaker-release-date-calendar-june-2025-1237875104/"},
    {"id": 23, "brand": "Loro Piana", "url": "https://sia-news.com/all-of-the-2025-holiday-campaigns-shaping-the-season/"},
    {"id": 24, "brand": "Zara 50th", "url": "https://www.wallpaper.com/design-interiors/zara-50-anniversary-collection"},
    {"id": 25, "brand": "Bella Hadid - Ôrəbella", "url": "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"},
    {"id": 26, "brand": "Brandon Maxwell x Walmart", "url": "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"},
    {"id": 27, "brand": "Jenni Kayne", "url": "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"},
    {"id": 28, "brand": "Tecovas", "url": "https://nycplugged.com/nyfw-september-2025-pop-ups-parties-shows-and-more/"},
    {"id": 29, "brand": "Ksubi x Alice Hollywood", "url": "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"},
    {"id": 30, "brand": "Louis Vuitton", "url": "https://www.averagesocialite.com/fashion-beauty"},
    {"id": 31, "brand": "Minnie Rose x Zibby Media", "url": "https://www.averagesocialite.com/fashion-beauty"},
    {"id": 32, "brand": "Gucci", "url": "https://thefashionography.com/fashion/fashion-campaigns/"},
    {"id": 33, "brand": "Bottega Veneta x Jacob Elordi", "url": "https://thefashionography.com/fashion/fashion-campaigns/"},
    {"id": 34, "brand": "JW Anderson", "url": "https://thefashionography.com/fashion/fashion-campaigns/"},
    {"id": 35, "brand": "Fendi x Yuna Shin", "url": "https://thefashionography.com/fashion/fashion-campaigns/"},
    {"id": 36, "brand": "Salomon x JJJJound", "url": "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"},
    {"id": 37, "brand": "Krispy Kreme x Crocs", "url": "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"},
    {"id": 38, "brand": "Cav Empt x Nike", "url": "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"},
    {"id": 39, "brand": "Nike x Bronx Girls Skate", "url": "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"},
    {"id": 40, "brand": "Abercrombie & Fitch", "url": "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/"},
    {"id": 41, "brand": "Anthropologie x Camila Mendes", "url": "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/"},
    {"id": 42, "brand": "Gap x Katseye", "url": "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/"}
]

def download_screenshot(event):
    """Download a single screenshot"""
    filename = f"event-{event['id']}.jpg"
    filepath = os.path.join(SCREENSHOTS_DIR, filename)

    # Skip if already exists
    if os.path.exists(filepath):
        print(f"✓ Screenshot already exists: {filename} ({event['brand']})")
        return {'success': True, 'cached': True, 'id': event['id']}

    # Build API URL
    encoded_url = urllib.parse.quote(event['url'], safe='')
    api_url = f"https://api.apiflash.com/v1/urltoimage?access_key={API_KEY}&wait_until=page_loaded&url={encoded_url}&width=768&height=1280&format=jpeg&quality=85"

    try:
        print(f"Downloading screenshot for: {event['brand']} (ID: {event['id']})...")

        # Download the image
        urllib.request.urlretrieve(api_url, filepath)

        # Check if file was created and has content
        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            print(f"✓ Downloaded: {filename} ({event['brand']})")
            return {'success': True, 'cached': False, 'id': event['id']}
        else:
            if os.path.exists(filepath):
                os.remove(filepath)
            print(f"✗ Failed: {filename} ({event['brand']}) - Empty file")
            return {'success': False, 'id': event['id'], 'brand': event['brand'], 'error': 'Empty file'}

    except Exception as e:
        # Clean up partial download
        if os.path.exists(filepath):
            os.remove(filepath)
        print(f"✗ Failed: {filename} ({event['brand']}) - {str(e)}")
        return {'success': False, 'id': event['id'], 'brand': event['brand'], 'error': str(e)}

def main():
    # Create directory
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    print(f"\nStarting download of {len(events)} screenshots...\n")

    start_time = time.time()
    results = []

    # Process in batches to avoid rate limiting
    batch_size = 3
    for i in range(0, len(events), batch_size):
        batch = events[i:i+batch_size]
        batch_num = i // batch_size + 1
        total_batches = (len(events) + batch_size - 1) // batch_size

        print(f"\nProcessing batch {batch_num}/{total_batches}...")

        for event in batch:
            result = download_screenshot(event)
            results.append(result)

            # Small delay between downloads
            time.sleep(0.5)

        # Longer delay between batches
        if i + batch_size < len(events):
            time.sleep(2)

    # Summary
    end_time = time.time()
    duration = end_time - start_time

    successful = [r for r in results if r['success']]
    cached = [r for r in results if r.get('cached', False)]
    new_downloads = [r for r in results if r['success'] and not r.get('cached', False)]
    failed = [r for r in results if not r['success']]

    print(f"\n{'='*60}")
    print(f"Download Complete!")
    print(f"{'='*60}")
    print(f"Total time: {duration:.1f} seconds")
    print(f"Total events: {len(events)}")
    print(f"Successful: {len(successful)}")
    print(f"  - New downloads: {len(new_downloads)}")
    print(f"  - Already cached: {len(cached)}")
    print(f"Failed: {len(failed)}")

    if failed:
        print(f"\nFailed downloads:")
        for f in failed:
            print(f"  - {f['brand']} (ID: {f['id']}): {f.get('error', 'Unknown error')}")

    print(f"\nScreenshots saved to: {SCREENSHOTS_DIR}")

    # Create a manifest file
    manifest = {
        'total': len(events),
        'successful': len(successful),
        'failed': len(failed),
        'screenshots': [
            {'id': r['id'], 'filename': f"event-{r['id']}.jpg"}
            for r in results if r['success']
        ]
    }

    manifest_path = os.path.join(SCREENSHOTS_DIR, 'manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f"Manifest saved to: {manifest_path}")

if __name__ == '__main__':
    main()
