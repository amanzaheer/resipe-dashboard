import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RecipeImage({ recipe, image }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const getImageUrl = (img) => {
      if (!img) return null;
      
      // If it's already a full URL, return it
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      
      // If it's a relative path, prepend the API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Handle different path formats
      if (img.startsWith('/uploads/')) {
        return `${apiUrl}${img}`;
      } else if (img.startsWith('uploads/')) {
        return `${apiUrl}/${img}`;
      } else if (img.startsWith('/')) {
        return `${apiUrl}${img}`;
      } else {
        // For any other format, assume it's a relative path
        return `${apiUrl}/${img}`;
      }
    };

    // Use the image prop if provided, otherwise try to get it from the recipe object
    const url = getImageUrl(image || recipe?.image);
    console.log('Image URL:', url); // Debug log
    setImageUrl(url);
  }, [image, recipe]);

  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl); // Debug log
    setImageError(true);
  };

  if (!imageUrl || imageError) {
    return (
      <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-16 w-16 relative rounded-lg overflow-hidden">
      <Image
        src={imageUrl}
        alt={recipe?.title || 'Recipe image'}
        fill
        className="object-cover"
        sizes="64px"
        unoptimized
        onError={handleImageError}
      />
    </div>
  );
} 