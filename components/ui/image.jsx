import { useState } from 'react';
import Image from 'next/image';

export function CustomImage({ 
  src, 
  alt, 
  width, 
  height, 
  fill = false, 
  className = '', 
  priority = false,
  sizes,
  ...props 
}) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle image loading error
  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setError(true);
    setIsLoading(false);
  };

  // Handle image loading success
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Determine the image source
  const imageSrc = error ? '/placeholder-recipe.jpg' : src;

  return (
    <div className={`relative ${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}>
      {!error && (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          priority={priority}
          sizes={sizes}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      )}
      {error && (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <span className="text-gray-400">Image not available</span>
        </div>
      )}
    </div>
  );
} 