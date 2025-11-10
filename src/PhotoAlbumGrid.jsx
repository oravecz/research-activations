import React, { useState, useEffect } from 'react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

/**
 * PhotoAlbumGrid Component
 *
 * Displays event images in a responsive photo album layout with lightbox viewer.
 * Replaces the Masonry grid with react-photo-album and yet-another-react-lightbox.
 *
 * Props:
 *   - images: Array of image objects with { path, isLogo, order } properties
 *   - basePath: Base URL path for assets (import.meta.env.BASE_URL)
 */
const PhotoAlbumGrid = ({ images, basePath = '/' }) => {
  const [index, setIndex] = useState(-1);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load images and get their dimensions
  useEffect(() => {
    if (!images || images.length === 0) {
      setLoading(false);
      return;
    }

    // Sort images to ensure logo is first
    const sortedImages = [...images].sort((a, b) => a.order - b.order);

    // Load all images to get their actual dimensions
    const imagePromises = sortedImages.map((image, idx) => {
      return new Promise((resolve) => {
        const imagePath = basePath + image.path;
        const isLogo = image.isLogo || idx === 0;
        const img = new Image();

        img.onload = () => {
          resolve({
            src: imagePath,
            width: img.naturalWidth || 800,
            height: img.naturalHeight || 600,
            alt: isLogo ? 'Brand Logo' : `Event image ${idx + 1}`,
            isLogo: isLogo
          });
        };

        img.onerror = () => {
          // Fallback dimensions if image fails to load
          resolve({
            src: imagePath,
            width: isLogo ? 1200 : 800,
            height: isLogo ? 800 : 600,
            alt: isLogo ? 'Brand Logo' : `Event image ${idx + 1}`,
            isLogo: isLogo
          });
        };

        img.src = imagePath;
      });
    });

    Promise.all(imagePromises).then((loadedPhotos) => {
      console.log('PhotoAlbumGrid loaded photos:', loadedPhotos.map(p => ({
        src: p.src,
        width: p.width,
        height: p.height,
        aspectRatio: (p.width / p.height).toFixed(2)
      })));
      setPhotos(loadedPhotos);
      setLoading(false);
    });
  }, [images, basePath]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-50 p-4">
      <div className="w-full mx-auto">
        <PhotoAlbum
          photos={photos}
          layout="masonry"
          columns={(containerWidth) => {
            if (containerWidth < 640) return 2;
            if (containerWidth < 1024) return 3;
            return 4;
          }}
          spacing={8}
          padding={0}
          onClick={({ index: current }) => setIndex(current)}
          componentsProps={{
            imageProps: {
              loading: 'eager',
              style: { cursor: 'pointer' }
            }
          }}
        />

        <Lightbox
          slides={photos}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
          thumbnails={{
            position: 'bottom',
            width: 120,
            height: 80,
            border: 1,
            borderRadius: 4,
            padding: 4,
            gap: 8
          }}
          zoom={{
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
            doubleClickMaxStops: 2,
            keyboardMoveDistance: 50,
            wheelZoomDistanceFactor: 100,
            pinchZoomDistanceFactor: 100,
            scrollToZoom: true
          }}
          animation={{ fade: 250, swipe: 250 }}
          carousel={{
            finite: false,
            preload: 2,
            padding: '16px',
            spacing: '30%',
            imageFit: 'contain'
          }}
        />
      </div>
    </div>
  );
};

export default PhotoAlbumGrid;
