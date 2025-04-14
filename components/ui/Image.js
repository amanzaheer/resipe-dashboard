import React, { useState, useEffect } from 'react';

/**
 * A robust image component that handles loading, errors, and caching
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - CSS classes to apply to the image
 * @param {Object} props.style - Inline styles to apply to the image
 * @param {string} props.fallbackSrc - Fallback image URL if the main image fails to load
 * @param {boolean} props.lazy - Whether to lazy load the image
 * @param {string} props.width - Width of the image
 * @param {string} props.height - Height of the image
 * @param {string} props.objectFit - Object-fit property for the image
 * @returns {JSX.Element} - The image component
 */
const Image = ({
  src,
  alt,
  className = '',
  style = {},
  fallbackSrc = '/placeholder-recipe.jpg',
  lazy = true,
  width,
  height,
  objectFit = 'cover',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  // Format the image URL if needed
  const formattedSrc = imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')
    ? `/uploads/${imgSrc}`
    : imgSrc;

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImgSrc(fallbackSrc);
  };

  // Create a cache key for the image
  const cacheKey = `img-${formattedSrc}`;

  return (
    <div 
      className={`relative ${className}`}
      style={{
        width: width || '100%',
        height: height || '100%',
        ...style
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={formattedSrc}
        alt={alt}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ objectFit }}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        data-cache-key={cacheKey}
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-xs">Image not available</span>
        </div>
      )}
    </div>
  );
};

export default Image; 