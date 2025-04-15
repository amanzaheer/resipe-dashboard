import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Image as ImageIcon, Eye, Heart, Clock, ChefHat, ArrowLeft, Search, Utensils } from 'lucide-react';
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
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">My Favorites</h1>
            <p className="text-amber-600 mt-1">Your collection of saved recipes</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/recipes">
              <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 font-medium flex items-center gap-2">
                <Heart className="h-5 w-5 text-amber-600" />
                Total Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">{favorites.length}</div>
              <p className="text-amber-600 text-sm mt-1">saved recipes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Quick Recipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {favorites.filter(f => (f.recipe.prepTime + f.recipe.cookTime) <= 30).length}
              </div>
              <p className="text-amber-600 text-sm mt-1">under 30 minutes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 font-medium flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-amber-600" />
                Easy Recipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {favorites.filter(f => f.recipe.difficulty === 'Easy').length}
              </div>
              <p className="text-amber-600 text-sm mt-1">beginner-friendly</p>
            </CardContent>
          </Card>
        </div>

        {favorites.length === 0 ? (
          <Card className="border-amber-100 shadow-sm text-center">
            <CardContent className="py-16">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-10 w-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-semibold text-amber-900 mb-3">No Favorites Yet</h3>
              <p className="text-amber-600 mb-8 max-w-md mx-auto">
                Start building your collection by saving recipes you love. Click the heart icon on any recipe to add it to your favorites.
              </p>
              <Link href="/dashboard/recipes">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Discover Recipes
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite._id || favorite.id} className="group overflow-hidden border-amber-100 shadow-sm hover:shadow-md transition-all">
                <div className="relative h-48 w-full overflow-hidden">
                  {favorite.recipe && favorite.recipe.image ? (
                    <Image
                      src={getImageUrl(favorite.recipe.image)}
                      alt={favorite.recipe.title || 'Recipe'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                      <Utensils className="h-12 w-12 text-amber-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                </div>
                
                <CardHeader className="-mt-12 relative z-10">
                  <CardTitle className="text-white line-clamp-1 mb-6">
                    {favorite.recipe ? favorite.recipe.title : 'Recipe not found'}
                  </CardTitle>
                  <CardDescription className="text-amber-100 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {(favorite.recipe.prepTime || 0) + (favorite.recipe.cookTime || 0)} min
                    </span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="h-4 w-4" />
                      {favorite.recipe.difficulty || 'Medium'}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewRecipe(favorite.recipe)}
                      className="flex items-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
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

        {/* Recipe View Modal */}
        <RecipeViewModal
          recipe={selectedRecipe}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          onToggleFavorite={handleFavoriteToggle}
        />
      </div>
    </UserLayout>
  );
} 