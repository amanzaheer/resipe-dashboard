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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChefHat, 
  Clock, 
  Utensils, 
  ImageIcon, 
  X, 
  Loader2, 
  Save,
  Tag,
  Star,
  Edit2,
  AlertCircle,
  List,
  ListOrdered
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

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
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);

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
          setCategories(categories);
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
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Recipes</h1>
          <Button onClick={handleCreateRecipe}>
            <Plus className="mr-2 h-4 w-4" />
            Add Recipe
          </Button>
        </div>

        {/* Enhanced Table Section */}
        <Card className="border-amber-100">
          <CardHeader className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9 border-slate-200 w-full md:max-w-xs"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-[180px] border-slate-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setIsAddRecipeOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Recipe</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto" />
                        <p className="text-slate-600 mt-2">Loading recipes...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredRecipes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <ChefHat className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No Recipes Found</h3>
                        <p className="text-slate-600">
                          {searchTerm ? 'Try adjusting your search or filters' : 'Start by adding your first recipe'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecipes.map((recipe) => (
                      <TableRow key={recipe._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-amber-50 flex-shrink-0">
                              {recipe.image ? (
                                <Image
                                  src={recipe.image}
                                  alt={recipe.title}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-amber-200" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{recipe.title}</div>
                              <div className="text-sm text-slate-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {recipe.preparationTime + recipe.cookingTime} min
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                            {recipe.categoryName || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${
                              recipe.status === 'published' 
                                ? 'bg-green-50 text-green-700' 
                                : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            {recipe.status || 'draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-amber-500" />
                            {recipe.averageRating?.toFixed(1) || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="h-4 w-4 text-slate-400" />
                            {recipe.views || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewRecipe(recipe)}
                              className="hover:text-amber-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRecipe(recipe)}
                              className="hover:text-blue-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(recipe._id)}
                              className="hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </AdminLayout>
  );
}

export function AddRecipeDialog({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [ingredients, setIngredients] = useState(['']);
  const [formProgress, setFormProgress] = useState(0);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  const resetForm = () => {
    // Reset form fields
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-white p-0 overflow-hidden">
        {/* Enhanced Header with Progress Steps */}
        <DialogHeader className="p-6 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-b sticky top-0 z-10">
          <DialogTitle className="text-2xl font-semibold text-amber-900 flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-amber-600" />
            Create New Recipe
          </DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 h-2 rounded-full bg-amber-100 overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${formProgress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-amber-600">
              {formProgress}% Complete
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="relative">
          {/* Main Content Area */}
          <div className="px-6 py-4 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Enhanced Basic Info */}
              <div className="space-y-6">
                <div className="bg-amber-50/50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-medium text-amber-900 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-amber-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                      Recipe Title
                    </Label>
                    <Input 
                      id="title"
                      className="border-slate-200"
                      placeholder="Enter recipe title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                      Description
                    </Label>
                    <Textarea 
                      id="description"
                      className="border-slate-200 min-h-[100px]"
                      placeholder="Enter recipe description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prepTime" className="text-sm font-medium text-slate-700">
                        Prep Time (mins)
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          id="prepTime"
                          type="number"
                          className="pl-9 border-slate-200"
                          placeholder="30"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cookTime" className="text-sm font-medium text-slate-700">
                        Cook Time (mins)
                      </Label>
                      <div className="relative">
                        <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          id="cookTime"
                          type="number"
                          className="pl-9 border-slate-200"
                          placeholder="45"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Enhanced Image Upload Section */}
                <div className="bg-blue-50/50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-medium text-blue-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    Recipe Image
                  </h3>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                    {imagePreview ? (
                      <div className="relative aspect-video">
                        <img 
                          src={imagePreview} 
                          alt="Recipe preview" 
                          className="rounded-lg object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-slate-50"
                        >
                          <X className="h-4 w-4 text-slate-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                        <div className="text-sm text-slate-600">
                          Drag and drop or click to upload
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="recipe-image"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('recipe-image').click()}
                          className="mt-2 border-slate-200"
                        >
                          Select Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Enhanced Ingredients & Instructions */}
              <div className="space-y-6">
                {/* Enhanced Ingredients Section */}
                <div className="bg-green-50/50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-medium text-green-900 flex items-center gap-2">
                    <List className="h-5 w-5 text-green-600" />
                    Ingredients
                  </h3>
                  <div className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={ingredient}
                          onChange={(e) => {
                            const newIngredients = [...ingredients];
                            newIngredients[index] = e.target.value;
                            setIngredients(newIngredients);
                          }}
                          className="border-slate-200"
                          placeholder="Enter ingredient"
                        />
                        {ingredients.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const newIngredients = ingredients.filter((_, i) => i !== index);
                              setIngredients(newIngredients);
                            }}
                            className="border-slate-200"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIngredients([...ingredients, ''])}
                      className="w-full border-slate-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>
                </div>

                {/* Enhanced Instructions Section */}
                <div className="bg-purple-50/50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-medium text-purple-900 flex items-center gap-2">
                    <ListOrdered className="h-5 w-5 text-purple-600" />
                    Instructions
                  </h3>
                  <Textarea 
                    id="instructions"
                    className="border-slate-200 min-h-[100px]"
                    placeholder="Enter recipe instructions"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <DialogFooter className="p-6 border-t border-slate-200 bg-white sticky bottom-0 z-10">
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
                className="flex-1 border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || formProgress < 100}
                className={`flex-1 ${
                  formProgress < 100
                    ? 'bg-slate-400'
                    : 'bg-amber-600 hover:bg-amber-700'
                } text-white transition-colors`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Recipe...
                  </>
                ) : formProgress < 100 ? (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Complete All Fields
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Recipe
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteRecipeDialog({ open, onOpenChange, onConfirm, loading, recipeName }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Delete Recipe
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Are you sure you want to delete {recipeName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-2">
          <p className="text-sm">
            This will permanently delete the recipe and all associated data.
          </p>
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-slate-200"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Recipe
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 