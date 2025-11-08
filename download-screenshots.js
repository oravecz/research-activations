const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'f3cae9688a794f2da5192eb2c50f1d3f';

const events = [
  {
    id: 1,
    brand: "Burberry",
    url: "https://wwd.com/fashion-news/fashion-features/burberry-jennifer-saunders-naomi-campbell-christmas-ad-film-1238334044/"
  },
  {
    id: 2,
    brand: "Gap x Sandy Liang",
    url: "https://wwd.com/business-news/retail/gap-sandy-liang-collaboration-reimagining-gap-icons-downtown-edge-1238271666/"
  },
  {
    id: 3,
    brand: "Zara",
    url: "https://www.hollywoodreporter.com/lifestyle/shopping/zara-50th-anniversary-collection-campaign-how-to-shop-1236211829/"
  },
  {
    id: 4,
    brand: "Nike",
    url: "https://wwd.com/footwear-news/shoe-industry-news/nike-running-nordstrom-nyc-pop-up-1238031364/"
  },
  {
    id: 5,
    brand: "New Balance",
    url: "https://wwd.com/footwear-news/shoe-industry-news/gallery/new-balance-nordstrom-nyc-pop-up-photos-1237799692/"
  },
  {
    id: 6,
    brand: "Nike",
    url: "https://www.bizbash.com/experiential-marketing/see-inside-nike-s-shoe-inspired-pop-ups"
  },
  {
    id: 7,
    brand: "Prada",
    url: "https://schonmagazine.com/prada-holiday-2025-campaign-a-winters-tale/"
  },
  {
    id: 8,
    brand: "Tory Burch",
    url: "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/"
  },
  {
    id: 9,
    brand: "Coach",
    url: "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc"
  },
  {
    id: 10,
    brand: "Adidas CLOT",
    url: "https://news.adidas.com/global/the-first-adidas-clot-pop-up-store-in-london-is-offering-an-exclusive-experience-during-wimbledon-fr/s/7c341a9d-a11c-4bd2-8994-7d5c243c17f6"
  },
  {
    id: 11,
    brand: "Adidas x Qias Omar",
    url: "https://officemagazine.net/adidas-superstar-gets-vintage-la-remix"
  },
  {
    id: 12,
    brand: "Marc Jacobs",
    url: "https://nycplugged.com/nyfw-september-2025-pop-ups-parties-shows-and-more/"
  },
  {
    id: 13,
    brand: "Nana Jacqueline",
    url: "https://us.fashionnetwork.com/news/Nana-jacqueline-opens-first-nyc-pop-up-in-soho,1678253.html"
  },
  {
    id: 14,
    brand: "A.P.C. x Marc Jacobs",
    url: "https://www.thezoereport.com/fashion/october-2025-fashion-news"
  },
  {
    id: 15,
    brand: "Gymshark",
    url: "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc"
  },
  {
    id: 16,
    brand: "Pleasing (Harry Styles)",
    url: "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc"
  },
  {
    id: 17,
    brand: "Loewe",
    url: "https://tryon.kivisense.com/blog/brand-activation/"
  },
  {
    id: 18,
    brand: "Tommy Hilfiger x JISOO",
    url: "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/"
  },
  {
    id: 19,
    brand: "Jimmy Choo",
    url: "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/"
  },
  {
    id: 20,
    brand: "Tiffany & Co.",
    url: "https://www.wmagazine.com/fashion/best-holiday-2025-campaigns"
  },
  {
    id: 21,
    brand: "Bergdorf Goodman",
    url: "https://www.wmagazine.com/fashion/best-holiday-2025-campaigns"
  },
  {
    id: 22,
    brand: "Tyler, the Creator x Converse",
    url: "https://wwd.com/footwear-news/sneaker-news/sneaker-release-date-calendar-june-2025-1237875104/"
  },
  {
    id: 23,
    brand: "Loro Piana",
    url: "https://sia-news.com/all-of-the-2025-holiday-campaigns-shaping-the-season/"
  },
  {
    id: 24,
    brand: "Zara",
    url: "https://www.wallpaper.com/design-interiors/zara-50-anniversary-collection"
  },
  {
    id: 25,
    brand: "Bella Hadid - Ôrəbella",
    url: "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"
  },
  {
    id: 26,
    brand: "Brandon Maxwell x Walmart",
    url: "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"
  },
  {
    id: 27,
    brand: "Jenni Kayne",
    url: "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"
  },
  {
    id: 28,
    brand: "Tecovas",
    url: "https://nycplugged.com/nyfw-september-2025-pop-ups-parties-shows-and-more/"
  },
  {
    id: 29,
    brand: "Ksubi x Alice Hollywood",
    url: "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025"
  },
  {
    id: 30,
    brand: "Louis Vuitton",
    url: "https://www.averagesocialite.com/fashion-beauty"
  },
  {
    id: 31,
    brand: "Minnie Rose x Zibby Media",
    url: "https://www.averagesocialite.com/fashion-beauty"
  },
  {
    id: 32,
    brand: "Gucci",
    url: "https://thefashionography.com/fashion/fashion-campaigns/"
  },
  {
    id: 33,
    brand: "Bottega Veneta x Jacob Elordi",
    url: "https://thefashionography.com/fashion/fashion-campaigns/"
  },
  {
    id: 34,
    brand: "JW Anderson",
    url: "https://thefashionography.com/fashion/fashion-campaigns/"
  },
  {
    id: 35,
    brand: "Fendi x Yuna Shin",
    url: "https://thefashionography.com/fashion/fashion-campaigns/"
  },
  {
    id: 36,
    brand: "Salomon x JJJJound",
    url: "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"
  },
  {
    id: 37,
    brand: "Krispy Kreme x Crocs",
    url: "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"
  },
  {
    id: 38,
    brand: "Cav Empt x Nike",
    url: "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"
  },
  {
    id: 39,
    brand: "Nike x Bronx Girls Skate",
    url: "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance"
  },
  {
    id: 40,
    brand: "Abercrombie & Fitch",
    url: "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/"
  },
  {
    id: 41,
    brand: "Anthropologie x Camila Mendes",
    url: "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/"
  },
  {
    id: 42,
    brand: "Gap x Katseye",
    url: "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/"
  }
];

const screenshotsDir = path.join(__dirname, 'public', 'screenshots');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  console.log(`Created directory: ${screenshotsDir}`);
}

function downloadScreenshot(event) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${API_KEY}&wait_until=page_loaded&url=${encodeURIComponent(event.url)}&width=768&height=1280&format=jpeg&quality=85`;

    const filename = `event-${event.id}.jpg`;
    const filepath = path.join(screenshotsDir, filename);

    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ Screenshot already exists: ${filename} (${event.brand})`);
      resolve({ id: event.id, filename, cached: true });
      return;
    }

    console.log(`Downloading screenshot for: ${event.brand} (ID: ${event.id})...`);

    https.get(apiUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${event.brand}: HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Downloaded: ${filename} (${event.brand})`);
        resolve({ id: event.id, filename, cached: false });
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadAllScreenshots() {
  console.log(`\nStarting download of ${events.length} screenshots...\n`);
  const startTime = Date.now();

  const results = [];
  const batchSize = 3; // Download 3 at a time to avoid rate limiting

  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}...`);

    try {
      const batchResults = await Promise.all(
        batch.map(event => downloadScreenshot(event).catch(err => ({
          id: event.id,
          error: err.message,
          brand: event.brand
        })))
      );

      results.push(...batchResults);

      // Wait 2 seconds between batches to avoid rate limiting
      if (i + batchSize < events.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error(`Batch error:`, err);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Download Complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total time: ${duration} seconds`);
  console.log(`Total events: ${events.length}`);

  const successful = results.filter(r => r.filename && !r.error);
  const cached = results.filter(r => r.cached);
  const newDownloads = results.filter(r => r.filename && !r.cached);
  const failed = results.filter(r => r.error);

  console.log(`Successful: ${successful.length}`);
  console.log(`  - New downloads: ${newDownloads.length}`);
  console.log(`  - Already cached: ${cached.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed downloads:`);
    failed.forEach(f => {
      console.log(`  - ${f.brand} (ID: ${f.id}): ${f.error}`);
    });
  }

  console.log(`\nScreenshots saved to: ${screenshotsDir}`);
}

downloadAllScreenshots().catch(console.error);
