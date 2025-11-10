import React, { useEffect, useRef, useState } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

/**
 * MasonryImageGrid Component
 *
 * Displays event images in a Masonry grid layout with logo first (upper-left)
 * followed by up to 8 promotional images.
 *
 * Props:
 *   - images: Array of image objects with { path, isLogo, order } properties
 *   - basePath: Base URL path for assets (import.meta.env.BASE_URL)
 */
const MasonryImageGrid = ({ images, basePath = '/' }) => {
  const gridRef = useRef(null);
  const masonryRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [imageErrors, setImageErrors] = useState(new Set());

  useEffect(() => {
    if (!gridRef.current || !images || images.length === 0) return;

    // Wait for all images to load before initializing Masonry
    const imgLoad = imagesLoaded(gridRef.current);

    imgLoad.on('always', () => {
      // Initialize Masonry after images are loaded
      masonryRef.current = new Masonry(gridRef.current, {
        itemSelector: '.masonry-item',
        columnWidth: '.masonry-sizer',
        percentPosition: true,
        gutter: 10,
        transitionDuration: '0.3s'
      });
    });

    imgLoad.on('progress', (instance, image) => {
      if (image.isLoaded) {
        setLoadedImages(prev => new Set([...prev, image.img.src]));
      }
    });

    imgLoad.on('fail', (instance, image) => {
      setImageErrors(prev => new Set([...prev, image.img.src]));
    });

    // Cleanup
    return () => {
      if (masonryRef.current) {
        masonryRef.current.destroy();
      }
    };
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Sort images to ensure logo is first
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-50">
      <div ref={gridRef} className="masonry-grid">
        {/* Sizer element for column width calculation */}
        <div className="masonry-sizer w-full sm:w-1/2 lg:w-1/3"></div>

        {sortedImages.map((image, index) => {
          const imagePath = basePath + image.path;
          const isLogo = image.isLogo || index === 0;
          const hasError = imageErrors.has(imagePath);
          const isLoaded = loadedImages.has(imagePath);

          return (
            <div
              key={`${image.path}-${index}`}
              className={`masonry-item w-full sm:w-1/2 lg:w-1/3 p-2 ${
                isLogo ? 'masonry-item--logo' : ''
              }`}
            >
              <div className="relative bg-white rounded-lg overflow-hidden">
                {!hasError ? (
                  <img
                    src={imagePath}
                    alt={isLogo ? 'Brand Logo' : `Event image ${index + 1}`}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-gray-200 p-8">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 mx-auto text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm">Failed to load</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .masonry-grid {
          max-width: 1400px;
          margin: 0 auto;
        }

        .masonry-sizer,
        .masonry-item {
          box-sizing: border-box;
        }

        /* Make logo larger on larger screens */
        @media (min-width: 1024px) {
          .masonry-item--logo {
            width: 50% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MasonryImageGrid;
