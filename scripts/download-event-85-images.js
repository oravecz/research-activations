import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const images = [
  {
    url: 'https://media.nbcchicago.com/2025/07/09_Group_02_Family_323.jpg',
    filename: 'image-1.jpg',
    alt: 'Warby Parker shop-in-shop in Target - family trying on glasses'
  },
  {
    url: 'https://media.nbcchicago.com/2025/07/Target-Shop-in-Shop-5.jpg',
    filename: 'image-2.jpg',
    alt: 'Warby Parker shop-in-shop interior'
  },
  {
    url: 'https://arc.stimg.co/startribunemedia/NXUBMOSI7NAERMAH4DXYKNVYSA.jpg?w=1080',
    filename: 'image-3.jpg',
    alt: 'Customer trying on glasses at Warby Parker Target location'
  },
  {
    url: 'https://arc.stimg.co/startribunemedia/7N36ZIEIJNFMTGNGNOK2G7XX7U.jpg?w=1080',
    filename: 'image-4.jpg',
    alt: 'Warby Parker sunglasses display in Target'
  },
  {
    url: 'https://mma.prnewswire.com/media/2628781/Warby_Parker_at_Target.jpg',
    filename: 'image-5.jpg',
    alt: 'Warby Parker at Target logo and branding'
  },
  {
    url: 'https://mma.prnewswire.com/media/2628782/Warby_Parket_at_Target_Rendering.jpg',
    filename: 'image-6.jpg',
    alt: 'Warby Parker shop-in-shop rendering and design'
  },
  {
    url: 'https://imgproxy.divecdn.com/7DajjT3zcwVcYn85X34qtbMzLiEF4tx7ExYOt05rlMg/g:ce/rs:fill:1200:675:1/Z3M6Ly9kaXZlc2l0ZS1zdG9yYWdlL2RpdmVpbWFnZS9XYXJieV9QYXJrZXRfYXRfVGFyZ2V0X1JlbmRlcmluZy5qcGc=.webp',
    filename: 'image-7.webp',
    alt: 'Artistic rendering of Warby Parker store inside Target'
  }
];

const outputDir = path.join(__dirname, '..', 'public', 'events', 'target', 'event-85', 'images');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

let downloaded = 0;
let failed = 0;

const downloadImage = (imageUrl, filepath, index) => {
  return new Promise((resolve) => {
    const urlObj = new URL(imageUrl);
    const protocol = urlObj.protocol === 'https:' ? https : https;

    const request = protocol.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`  Redirect detected for image ${index}, following...`);
        downloadImage(response.headers.location, filepath, index).then(resolve);
        return;
      }

      if (response.statusCode !== 200) {
        console.log(`  ✗ Image ${index}: HTTP ${response.statusCode}`);
        failed++;
        resolve();
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        console.log(`  ✓ Image ${index}: ${path.basename(filepath)} (${Math.round(stats.size / 1024)} KB)`);
        downloaded++;
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        console.log(`  ✗ Image ${index}: Write error - ${err.message}`);
        failed++;
        resolve();
      });
    });

    request.on('error', (err) => {
      console.log(`  ✗ Image ${index}: Download error - ${err.message}`);
      failed++;
      resolve();
    });

    request.setTimeout(10000, () => {
      request.destroy();
      console.log(`  ✗ Image ${index}: Timeout`);
      failed++;
      resolve();
    });
  });
};

const downloadAll = async () => {
  console.log('\n📥 Downloading Warby Parker at Target images...\n');
  console.log(`Output directory: ${outputDir}\n`);

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const filepath = path.join(outputDir, image.filename);

    console.log(`[${i + 1}/${images.length}] ${image.alt}`);
    await downloadImage(image.url, filepath, i + 1);
  }

  console.log(`\n✅ Download complete: ${downloaded} succeeded, ${failed} failed\n`);

  if (downloaded > 0) {
    console.log(`Images saved to: ${outputDir}`);
    console.log(`Next steps: Update details.json with imageInventory for event-85`);
  }
};

downloadAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
