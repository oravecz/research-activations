import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Event 91: Target - Diane von Furstenberg Pop-Up at The Shed
// Using images from publicly available news sources and event coverage

const images = [
  {
    url: 'https://c8.alamy.com/comp/2WTYPT1/hundreds-of-customers-mob-the-shed-in-hudson-yards-for-the-two-day-pop-up-of-the-diane-von-furstenberg-for-target-collection-on-friday-march-15-2024-the-preview-event-allowed-customers-to-purchase-up-to-ten-items-from-the-collection-which-will-be-available-in-target-stores-next-week-on-march-23-richard-b-levine-2WTYPT1.jpg',
    filename: 'image-1.jpg',
    alt: 'Crowds at Target Diane von Furstenberg pop-up at The Shed'
  },
  {
    url: 'https://c7.alamy.com/comp/2WTYPT7/hundreds-of-customers-mob-the-shed-in-hudson-yards-for-the-two-day-pop-up-of-the-diane-von-furstenberg-for-target-collection-on-friday-march-15-2024-the-preview-event-allowed-customers-to-purchase-up-to-ten-items-from-the-collection-which-will-be-available-in-target-stores-next-week-on-march-23-richard-b-levine-2WTYPT7.jpg',
    filename: 'image-2.jpg',
    alt: 'Event attendees at DVF x Target pop-up'
  },
  {
    url: 'https://c7.alamy.com/comp/2WTYPT3/hundreds-of-customers-mob-the-shed-in-hudson-yards-for-the-two-day-pop-up-of-the-diane-von-furstenberg-for-target-collection-on-friday-march-15-2024-the-preview-event-allowed-customers-to-purchase-up-to-ten-items-from-the-collection-which-will-be-available-in-target-stores-next-week-on-march-23-richard-b-levine-2WTYPT3.jpg',
    filename: 'image-3.jpg',
    alt: 'Target DVF collaboration event interior'
  }
];

const outputDir = path.join(__dirname, '..', 'public', 'events', 'target', 'event-91', 'images');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadImage(imageUrl, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(imageUrl, (response) => {
      if (response.statusCode >= 400) {
        reject(new Error(`HTTP ${response.statusCode}: ${imageUrl}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log(`Downloading ${images.length} images for Target Event 91...`);

  for (const image of images) {
    const filePath = path.join(outputDir, image.filename);
    try {
      console.log(`Downloading: ${image.filename}...`);
      await downloadImage(image.url, filePath);
      console.log(`✓ Saved: ${image.filename}`);
    } catch (error) {
      console.error(`✗ Failed to download ${image.filename}: ${error.message}`);
    }
  }

  console.log(`\nDownload complete! Images saved to: ${outputDir}`);
  console.log(`Downloaded ${images.filter(img => fs.existsSync(path.join(outputDir, img.filename))).length}/${images.length} images`);
}

downloadAllImages().catch(console.error);
