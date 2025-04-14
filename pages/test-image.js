import { useState, useEffect } from 'react';
import Image from 'next/image';
import { recipeAPI } from '@/lib/api';

export default function TestImagePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await recipeAPI.getAll();
        setRecipes(response.data || []);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const getImageUrl = (image) => {
    if (!image) return null;
    
    // If it's already a full URL, return it
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // If it's a relative path, prepend the API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Handle different path formats
    if (image.startsWith('/uploads/')) {
      return `${apiUrl}${image}`;
    } else if (image.startsWith('uploads/')) {
      return `${apiUrl}/${image}`;
    } else if (image.startsWith('/')) {
      return `${apiUrl}${image}`;
    } else {
      // For any other format, assume it's a relative path
      return `${apiUrl}/${image}`;
    }
  };

  if (loading) {
    return <div className="p-8">Loading recipes...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Image Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">API URL</h2>
        <p className="bg-gray-100 p-2 rounded">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}</p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recipes ({recipes.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => {
            const imageUrl = getImageUrl(recipe.image);
            console.log(`Recipe: ${recipe.title}, Image: ${recipe.image}, URL: ${imageUrl}`);
            
            return (
              <div key={recipe._id} className="border rounded-lg overflow-hidden">
                <div className="p-4">
                  <h3 className="font-medium">{recipe.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">Image path: {recipe.image}</p>
                  <p className="text-sm text-gray-500 mb-4">Full URL: {imageUrl}</p>
                </div>
                <div className="relative h-48 w-full">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        console.error(`Image failed to load: ${imageUrl}`);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full bg-red-100 flex items-center justify-center"><span class="text-red-500">Image failed to load</span></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 