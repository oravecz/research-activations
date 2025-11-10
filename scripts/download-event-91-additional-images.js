import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Event 91: Target - Diane von Furstenberg Pop-Up at The Shed
// Additional images from Instagram event coverage

const images = [
  {
    url: 'https://scontent-ord5-3.cdninstagram.com/v/t51.29350-15/432612993_378302908429747_4524803635514893409_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjE0NDB4MTExNS5zZHIuZjI5MzUwLmRlZmF1bHRfaW1hZ2UuYzIifQ&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QEuWe-clSywjgkE-g_89pqPXbYxnqWg0MhT5R8-k3gnwRhsKo5vIjU9WQDZwPwBzCQ&_nc_ohc=Fha7OAH3FM4Q7kNvwEIDaqT&_nc_gid=f1QLuVmyfqQR6JJjkZXGVg&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzMyNDM4MDc0NjUzMjc2MzY3Mg%3D%3D.3-ccb7-5&oh=00_Afj7uZ4iqlHFE94EuPjug-P56_c0s5ClYPY2Ex9EWuTwFQ&oe=6917C80D&_nc_sid=10d13b',
    filename: 'image-4.jpg',
    alt: 'Instagram event photo from DVF x Target pop-up'
  },
  {
    url: 'https://scontent-ord5-2.cdninstagram.com/v/t51.29350-15/433127580_1080606703196512_1536085331137050855_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjE0NDB4MTExNC5zZHIuZjI5MzUwLmRlZmF1bHRfaW1hZ2UuYzIifQ&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=104&_nc_oc=Q6cZ2QEuWe-clSywjgkE-g_89pqPXbYxnqWg0MhT5R8-k3gnwRhsKo5vIjU9WQDZwPwBzCQ&_nc_ohc=70ycJ4RICFoQ7kNvwHKioQt&_nc_gid=f1QLuVmyfqQR6JJjkZXGVg&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzMyNDM4MDc0NjQ4MjI5NzM4OA%3D%3D.3-ccb7-5&oh=00_AfiJ_eYNRWakI2-xhsg1MQ0P5zNkpDmTcXEfGbm-o2SXIQ&oe=6917D606&_nc_sid=10d13b',
    filename: 'image-5.jpg',
    alt: 'Instagram event photo from DVF x Target pop-up'
  },
  {
    url: 'https://scontent-ord5-3.cdninstagram.com/v/t51.29350-15/433123944_1484155405836943_2273031311348635007_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjE0NDB4MTExMy5zZHIuZjI5MzUwLmRlZmF1bHRfaW1hZ2UuYzIifQ&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QEuWe-clSywjgkE-g_89pqPXbYxnqWg0MhT5R8-k3gnwRhsKo5vIjU9WQDZwPwBzCQ&_nc_ohc=wVg7u3Sw4CEQ7kNvwG5PUN4&_nc_gid=f1QLuVmyfqQR6JJjkZXGVg&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzMyNDM4MDc0NjQ0MDQ3MDY5NQ%3D%3D.3-ccb7-5&oh=00_AfjqheXF7lvjdR68IHgwNa1dP6f9VEN4FMYCPpJMtuM_5g&oe=6917E74B&_nc_sid=10d13b',
    filename: 'image-6.jpg',
    alt: 'Instagram event photo from DVF x Target pop-up'
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
  console.log(`Downloading ${images.length} additional images for Target Event 91...`);

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
  const downloaded = images.filter(img => fs.existsSync(path.join(outputDir, img.filename))).length;
  console.log(`Downloaded ${downloaded}/${images.length} images`);
}

downloadAllImages().catch(console.error);
