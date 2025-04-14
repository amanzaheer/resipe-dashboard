import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { recipeAPI, categoryAPI, favoritesAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Eye, Heart, Clock, Users, Star, Plus, Pencil, Trash2 } from 'lucide-react';
import RecipeImage from '@/components/user/RecipeImage';
import RecipeViewModal from '@/components/user/RecipeViewModal';
import RecipeEditModal from '@/components/user/RecipeEditModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserRecipesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // Memoize the fetchData function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recipes
      const recipesResponse = await recipeAPI.getAll();
      
      let recipesData = [];
      
      if (recipesResponse?.data) {
        // Handle different response structures
        if (Array.isArray(recipesResponse.data)) {
          recipesData = recipesResponse.data;
        } else if (recipesResponse.data.recipes && Array.isArray(recipesResponse.data.recipes)) {
          recipesData = recipesResponse.data.recipes;
        } else if (typeof recipesResponse.data === 'object') {
          recipesData = Object.values(recipesResponse.data);
        }
      }
      
      // Filter out soft-deleted recipes
      const activeRecipes = recipesData.filter(recipe => 
        !recipe.isDeleted && 
        recipe.status !== 'deleted' && 
        !recipe.deletedAt
      );
      
      // Fetch categories
      const categoriesResponse = await categoryAPI.getAll();
      const categoriesData = categoriesResponse?.data || [];
      
      // Create categories map for easy lookup
      const categoriesMap = {};
      categoriesData.forEach(category => {
        categoriesMap[category._id || category.id] = category.name;
      });
      
      // Add category names to recipes
      const recipesWithCategories = activeRecipes.map(recipe => ({
        ...recipe,
        categoryName: recipe.category?.name || 
                     (recipe.category && categoriesMap[recipe.category]) || 
                     'Uncategorized',
        categoryId: recipe.category?._id || recipe.category
      }));
      
      // Fetch favorites
      const favoritesResponse = await favoritesAPI.getAll();
      const favoritesData = favoritesResponse?.data || [];
      
      // Mark recipes as favorites
      const recipesWithFavorites = recipesWithCategories.map(recipe => ({
        ...recipe,
        isFavorite: favoritesData.some(fav => 
          fav.recipe?._id === recipe._id || 
          fav.recipe?.id === recipe.id || 
          fav.recipeId === recipe._id || 
          fav.recipeId === recipe.id
        )
      }));

      setRecipes(recipesWithFavorites);
      setCategories(categoriesData);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again later.');
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

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
    
    fetchData();
  }, [isAuthenticated, router, fetchData]);

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setIsViewModalOpen(true);
  };

  const handleEditRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setIsEditModalOpen(true);
  };

  const handleDeleteRecipe = (recipe) => {
    setRecipeToDelete(recipe);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRecipe = async () => {
    if (!recipeToDelete) return;
    
    try {
      await recipeAPI.delete(recipeToDelete._id);
      setRecipes(recipes.filter(recipe => recipe._id !== recipeToDelete._id));
      toast.success('Recipe deleted successfully');
      setIsDeleteDialogOpen(false);
      setRecipeToDelete(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe. Please try again later.');
    }
  };

  const handleToggleFavorite = async (recipe) => {
    try {
      if (recipe.isFavorite) {
        await favoritesAPI.removeFavorite(recipe._id);
        setRecipes(recipes.map(r => 
          r._id === recipe._id ? { ...r, isFavorite: false } : r
        ));
        toast.success('Recipe removed from favorites');
      } else {
        await favoritesAPI.addFavorite(recipe._id);
        setRecipes(recipes.map(r => 
          r._id === recipe._id ? { ...r, isFavorite: true } : r
        ));
        toast.success('Recipe added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites. Please try again later.');
    }
  };

  const handleCreateRecipe = () => {
    setSelectedRecipe(null); // No recipe for creating new
    setIsEditModalOpen(true);
  };

  const handleSaveRecipe = () => {
    fetchData(); // Refresh the recipes list
  };

  // Memoize the filtered recipes to prevent unnecessary re-renders
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [recipes, searchTerm]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-recipe.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="mb-6">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="p-0">
                <Skeleton className="aspect-video w-full rounded-t-lg" />
              </CardHeader>
              <CardContent className="pt-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
                <Skeleton className="h-9 w-9" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Recipes</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recipes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading recipes...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecipes.map((recipe) => (
                  <tr key={recipe._id || recipe.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RecipeImage image={recipe.image} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{recipe.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{recipe.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">
                        {recipe.categoryName || 'Uncategorized'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{recipe.prepTime || 0} min</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{recipe.servings || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          <span>{recipe.rating?.toFixed(1) || 'No ratings'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRecipe(recipe)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {recipe.author?._id === user?._id && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRecipe(recipe)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRecipe(recipe)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                        <Button
                          variant={recipe.isFavorite ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleFavorite(recipe)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          {recipe.isFavorite ? 'Remove' : 'Add'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No recipes found.</p>
          </div>
        )}
      </div>

      <RecipeViewModal
        recipe={selectedRecipe}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onToggleFavorite={handleToggleFavorite}
      />

      <RecipeEditModal
        recipe={selectedRecipe}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecipe(null);
        }}
        onSave={handleSaveRecipe}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the recipe
              "{recipeToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRecipe}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UserLayout>
  );
} 