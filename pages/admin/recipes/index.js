import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import AdminLayout from '../../../components/admin/AdminLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { recipeAPI } from '../../../lib/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import RecipeViewModal from '@/components/admin/RecipeViewModal';
import RecipeEditModal from '@/components/admin/RecipeEditModal';
import { categoryAPI } from '../../../lib/api';
import RecipeImage from '@/components/admin/RecipeImage';

export default function ManageRecipes() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Memoize the fetchRecipes function to prevent unnecessary re-renders
  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await recipeAPI.getAll();
      
      if (response && response.data) {
        const recipeData = response.data.recipes || response.data;
        
        // Filter out soft-deleted recipes and recipes marked as deleted
        const activeRecipes = Array.isArray(recipeData) 
          ? recipeData.filter(recipe => 
              !recipe.isDeleted && 
              recipe.status !== 'deleted' && 
              !recipe.deletedAt
            )
          : [];
        
        // Fetch categories to map IDs to names
        try {
          const categoriesResponse = await categoryAPI.getAll();
          const categoriesMap = {};
          
          if (categoriesResponse && categoriesResponse.data) {
            const categories = Array.isArray(categoriesResponse.data) 
              ? categoriesResponse.data 
              : categoriesResponse.data.categories || [];
              
            categories.forEach(category => {
              categoriesMap[category._id] = category.name;
            });
          }
          
          // Map category IDs to names
          const recipesWithCategoryNames = activeRecipes.map(recipe => ({
            ...recipe,
            categoryName: recipe.category?.name || 
                          (recipe.category && categoriesMap[recipe.category]) || 
                          'Uncategorized'
          }));
          
          setRecipes(recipesWithCategoryNames);
        } catch (categoryError) {
          console.error('Error fetching categories:', categoryError);
          setRecipes(activeRecipes);
        }
      } else {
        setRecipes([]);
      }
      
    } catch (err) {
      console.error('Error fetching recipes:', err);
      
      // Handle network errors
      if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check if the server is running.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch recipes');
      }
      
      toast.error(err.response?.data?.message || 'Failed to fetch recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
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
    
    fetchRecipes();
  }, [user, router, fetchRecipes]);

  const handleDelete = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Attempt to delete the recipe
      const response = await recipeAPI.delete(recipeId);
      
      // Show success message
      if (response.data?.softDelete) {
        toast.success('Recipe has been archived');
      } else {
        toast.success('Recipe deleted successfully');
      }
      
      // Refresh the recipe list to ensure it's up to date
      await fetchRecipes();
      
    } catch (err) {
      console.error('Error deleting recipe:', err);
      
      // Handle different error cases
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Authentication required. Please log in again.');
        // Redirect to login page
        router.push('/login');
      } else if (err.response?.status === 404) {
        toast.error('Recipe not found. It may have been already deleted.');
      } else if (err.response?.data?.message === "recipe.remove is not a function") {
        // Special handling for the remove function error
        toast.error('Unable to delete recipe. Please try again or contact support.');
      } else if (err.response?.status === 500) {
        toast.error('Server error occurred. Please try again later.');
      } else if (err.message === 'Network Error') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to delete recipe. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setViewModalOpen(true);
  };

  const handleEditRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setEditModalOpen(true);
  };

  const handleCreateRecipe = () => {
    setSelectedRecipe(null);
    setEditModalOpen(true);
  };

  const handleSaveRecipe = () => {
    fetchRecipes();
  };

  // Memoize the filtered recipes to prevent unnecessary re-renders
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [recipes, searchTerm]);

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Recipes</h1>
          <Button onClick={handleCreateRecipe}>
            <Plus className="mr-2 h-4 w-4" />
            Add Recipe
          </Button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecipes.map((recipe) => (
                  <tr key={recipe._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RecipeImage recipe={recipe} />
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
                      <Badge
                        variant={recipe.status === 'published' ? 'default' : 'secondary'}
                      >
                        {recipe.status || 'draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRecipe(recipe)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRecipe(recipe)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(recipe._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredRecipes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm
                ? `No recipes found matching "${searchTerm}"`
                : 'No recipes found. Create your first recipe!'}
            </p>
          </div>
        )}
      </div>

      {/* Recipe View Modal */}
      <RecipeViewModal 
        recipe={selectedRecipe}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />

      {/* Recipe Edit Modal */}
      <RecipeEditModal 
        recipe={selectedRecipe}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveRecipe}
      />
    </AdminLayout>
  );
} 