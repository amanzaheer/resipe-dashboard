import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Image as ImageIcon, Eye } from 'lucide-react';
import { favoritesAPI, recipeAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import UserLayout from '@/components/layout/UserLayout';
import { toast } from 'sonner';
import RecipeViewModal from '@/components/user/RecipeViewModal';

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      router.push('/login');
      return;
    }
    
    fetchFavorites();
  }, [isAuthenticated, router]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesAPI.getAll();
      
      // Process favorites to ensure they have the expected structure
      let favoritesData = response.data || [];
      
      // If favorites don't have recipe data, fetch the recipes
      const favoritesWithRecipes = await Promise.all(
        favoritesData.map(async (favorite) => {
          // If favorite already has recipe data, use it
          if (favorite.recipe && favorite.recipe._id) {
            return {
              ...favorite,
              recipe: {
                ...favorite.recipe,
                isFavorite: true
              }
            };
          }
          
          // Otherwise, fetch the recipe data
          try {
            const recipeId = favorite.recipeId || favorite._id;
            const recipeResponse = await recipeAPI.getRecipeById(recipeId);
            const recipeData = recipeResponse.data;
            
            return {
              ...favorite,
              recipe: {
                ...recipeData,
                isFavorite: true
              }
            };
          } catch (recipeError) {
            console.error(`Error fetching recipe for favorite:`, recipeError);
            // Return a placeholder if recipe fetch fails
            return {
              ...favorite,
              recipe: {
                title: 'Recipe not found',
                description: 'No description available',
                image: null,
                _id: favorite.recipeId || favorite._id,
                isFavorite: true
              }
            };
          }
        })
      );
      
      setFavorites(favoritesWithRecipes);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to fetch your favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId) => {
    try {
      await favoritesAPI.removeFavorite(recipeId);
      setFavorites(favorites.filter(fav => 
        (fav.recipe._id !== recipeId && fav.recipe.id !== recipeId)
      ));
      toast.success('Recipe removed from favorites');
      
      // Close the modal if the removed recipe was being viewed
      if (selectedRecipe && (selectedRecipe._id === recipeId || selectedRecipe.id === recipeId)) {
        setIsViewModalOpen(false);
        setSelectedRecipe(null);
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to remove recipe from favorites');
    }
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setIsViewModalOpen(true);
  };

  const handleFavoriteToggle = (recipeId) => {
    // Update the favorites list
    setFavorites(favorites.filter(fav => 
      (fav.recipe._id !== recipeId && fav.recipe.id !== recipeId)
    ));
    
    // Close the modal if the recipe was removed from favorites
    if (selectedRecipe && (selectedRecipe._id === recipeId || selectedRecipe.id === recipeId)) {
      setIsViewModalOpen(false);
      setSelectedRecipe(null);
    }
  };

  // Helper function to get image URL
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
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="text-center text-red-600">{error}</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Favorites</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/recipes">
              <Button variant="outline" className="flex items-center gap-2">
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No favorites yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't saved any recipes as favorites yet.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/recipes">
                    <Button>
                      Browse Recipes
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite._id || favorite.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  {favorite.recipe && favorite.recipe.image ? (
                    <Image
                      src={getImageUrl(favorite.recipe.image)}
                      alt={favorite.recipe.title || 'Recipe'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">
                    {favorite.recipe ? favorite.recipe.title : 'Recipe not found'}
                  </CardTitle>
                  <CardDescription>
                    {favorite.recipe ? (
                      <>
                        {(favorite.recipe.prepTime || 0) + (favorite.recipe.cookTime || 0)} min • {favorite.recipe.difficulty || 'Medium'}
                      </>
                    ) : (
                      'No details available'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewRecipe(favorite.recipe)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Recipe
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveFavorite(favorite.recipe?._id || favorite.recipeId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recipe View Modal */}
      <RecipeViewModal
        recipe={selectedRecipe}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onToggleFavorite={handleFavoriteToggle}
      />
    </UserLayout>
  );
} 