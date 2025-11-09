import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const PresentationDeck = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filter, setFilter] = useState('All');
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoaded, setImageLoaded] = useState({});

  // Load events data from events/details.json
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch('/events/details.json');
        if (!response.ok) {
          throw new Error('Failed to load events data');
        }
        const data = await response.json();
        setEvents(data.events || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Generate categories from events
  const categories = React.useMemo(() => {
    const cats = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];
    return cats;
  }, [events]);

  // Filter events based on selected category
  const filteredEvents = filter === 'All'
    ? events
    : events.filter(e => e.category === filter);

  const totalSlides = filteredEvents.length + 1; // +1 for title slide

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, filteredEvents.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const getImagePath = (event) => {
    // Get image path from assetInventory
    if (event.assetInventory && event.assetInventory.hasCollage && event.assetInventory.collagePath) {
      return '/' + event.assetInventory.collagePath;
    }
    // Fallback to constructed path
    return `/events/${event.brand.toLowerCase().replace(/\s+/g, '-')}/event-${event.id}/slide-image.png`;
  };

  const handleImageError = (eventId, e) => {
    console.warn(`Failed to load image for event ${eventId}`);
    setImageErrors(prev => ({ ...prev, [eventId]: true }));
  };

  const handleImageLoad = (eventId) => {
    setImageLoaded(prev => ({ ...prev, [eventId]: true }));
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Brand Activation Research...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white max-w-2xl px-8">
          <h1 className="text-4xl font-bold mb-4">Error Loading Events</h1>
          <p className="text-xl text-gray-300 mb-8">{error}</p>
          <p className="text-gray-400">Please ensure events/details.json is accessible.</p>
        </div>
      </div>
    );
  }

  const TitleSlide = () => {
    const footwearCount = events.filter(e => e.category === 'footwear').length;
    const footwearPercentage = Math.round((footwearCount / events.length) * 100);

    return (
      <div className="h-full flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-12">
        <h1 className="text-6xl font-bold mb-6 text-center">Brand Activation Research</h1>
        <h2 className="text-4xl font-light mb-8 text-center">US Retail Store-Level Activations</h2>
        <div className="text-xl text-gray-300 mb-8">2023 - 2025</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-8">
          <div>
            <div className="text-5xl font-bold text-blue-400">{events.length}</div>
            <div className="text-lg text-gray-400 mt-2">Total Events</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-green-400">{footwearCount}</div>
            <div className="text-lg text-gray-400 mt-2">Footwear Brands</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-purple-400">{footwearPercentage}%</div>
            <div className="text-lg text-gray-400 mt-2">Footwear Focus</div>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-12">
          Complete with validated URLs, visual assets, and comprehensive event details
        </div>
      </div>
    );
  };

  const EventSlide = ({ event }) => (
    <div className="h-full bg-white overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visual Asset Section - Left Side */}
          <div className="flex flex-col">
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {!imageErrors[event.id] ? (
                  <>
                    {!imageLoaded[event.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="text-center p-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading image...</p>
                        </div>
                      </div>
                    )}
                    <img
                      src={getImagePath(event)}
                      alt={`${event.brand} - ${event.title}`}
                      className={`absolute inset-0 w-full h-full object-cover ${imageLoaded[event.id] ? 'opacity-100' : 'opacity-0'}`}
                      onError={(e) => handleImageError(event.id, e)}
                      onLoad={() => handleImageLoad(event.id)}
                      loading="lazy"
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center p-8">
                      <div className="mb-4 text-gray-400">
                        <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-semibold text-xl">{event.brand}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section - Right Side */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{event.brand}</h2>
                <h3 className="text-2xl text-gray-700 mb-4">{event.title}</h3>
              </div>
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold whitespace-nowrap ml-4">
                {event.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="font-semibold text-gray-600 block mb-1">Date:</span>
                <p className="text-gray-900">{event.date}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">Location:</span>
                <p className="text-gray-900">{event.location}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">Store Scope:</span>
                <p className="text-gray-900 capitalize">{event.storeScope || 'Multiple'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">Event ID:</span>
                <p className="text-gray-900">#{event.id}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2 text-lg">Event Description</h4>
              <p className="text-gray-800 leading-relaxed">{event.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2 text-lg">Brand Activation Details</h4>
              <p className="text-gray-800 leading-relaxed">{event.activation}</p>
            </div>

            {event.promotionMethods && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2 text-lg">Promotion Methods</h4>
                <p className="text-gray-800 leading-relaxed">{event.promotionMethods}</p>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-gray-200">
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Source Article
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          <span className="text-sm font-semibold text-gray-700 flex items-center mr-4">Filter by Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                setCurrentSlide(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat === 'All' ? 'All Events' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 relative overflow-hidden">
        {currentSlide === 0 ? (
          <TitleSlide />
        ) : (
          <EventSlide event={filteredEvents[currentSlide - 1]} />
        )}
      </div>

      {/* Navigation Controls */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              currentSlide === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Slide {currentSlide + 1} of {totalSlides}
            </span>
            <span className="text-xs text-gray-500">
              ({filteredEvents.length} events)
            </span>
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              currentSlide === totalSlides - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="bg-gray-50 py-3 overflow-x-auto">
        <div className="flex justify-center gap-2 px-4 min-w-max mx-auto">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresentationDeck;
