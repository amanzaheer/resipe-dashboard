import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import UserLayout from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { recipeAPI, categoryAPI, favoritesAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Heart,
  Clock,
  Users,
  Star,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  ChefHat,
  Utensils,
  FileText,
  Loader2,
} from "lucide-react";
import RecipeImage from "@/components/user/RecipeImage";
import RecipeViewModal from "@/components/user/RecipeViewModal";
import RecipeEditModal from "@/components/user/RecipeEditModal";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [loadingFavorites, setLoadingFavorites] = useState({});

  // Memoize the fetchData function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recipes and favorites in parallel
      const [recipesResponse, favoritesResponse] = await Promise.all([
        recipeAPI.getAll(),
        favoritesAPI.getAll(),
      ]);

      let recipesData = [];
      if (recipesResponse?.data) {
        if (Array.isArray(recipesResponse.data)) {
          recipesData = recipesResponse.data;
        } else if (
          recipesResponse.data.recipes &&
          Array.isArray(recipesResponse.data.recipes)
        ) {
          recipesData = recipesResponse.data.recipes;
        } else if (typeof recipesResponse.data === "object") {
          recipesData = Object.values(recipesResponse.data);
        }
      }

      // Get favorites data and ensure it's an array
      const favoritesData = Array.isArray(favoritesResponse?.data)
        ? favoritesResponse.data
        : [];

      // Create a Set of favorited recipe IDs for faster lookup
      const favoritedRecipeIds = new Set(
        favoritesData
          .map(
            (fav) =>
              fav.recipe?._id || fav.recipe?.id || fav.recipeId || fav._id
          )
          .filter(Boolean)
      );

      // Filter active recipes and add favorite status
      const activeRecipesWithFavorites = recipesData
        .filter(
          (recipe) =>
            !recipe.isDeleted &&
            recipe.status !== "deleted" &&
            !recipe.deletedAt
        )
        .map((recipe) => ({
          ...recipe,
          isFavorite: favoritedRecipeIds.has(recipe._id),
        }));

      setRecipes(activeRecipesWithFavorites);
      setFavorites(favoritesData);

      // Fetch categories
      const categoriesResponse = await categoryAPI.getAll();
      setCategories(categoriesResponse?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required. Please log in again.");
      router.push("/login");
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
      setRecipes(recipes.filter((recipe) => recipe._id !== recipeToDelete._id));
      toast.success("Recipe deleted successfully");
      setIsDeleteDialogOpen(false);
      setRecipeToDelete(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe. Please try again later.");
    }
  };

  const handleToggleFavorite = async (recipeId) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe._id === recipeId 
          ? { ...recipe, isFavorite: !recipe.isFavorite }
          : recipe
      )
    );
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
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.description &&
          recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [recipes, searchTerm]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-recipe.jpg";
    if (imagePath.startsWith("http")) return imagePath;
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
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">My Recipes</h1>
            <p className="text-amber-600 mt-1">
              Manage and organize your culinary creations
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCreateRecipe}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-amber-900 font-medium flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" />
                Total Recipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {recipes.length}
              </div>
              <p className="text-amber-600 text-sm mt-1">
                recipes in your collection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-amber-900 font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {categories.length}
              </div>
              <p className="text-amber-600 text-sm mt-1">recipe categories</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-amber-900 font-medium flex items-center gap-2">
                <Heart className="h-5 w-5 text-amber-600" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {favorites.length}
              </div>
              <p className="text-amber-600 text-sm mt-1">favorite recipes</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-amber-100">
          <Search className="h-5 w-5 text-amber-500" />
          <Input
            placeholder="Search recipes by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-amber-200 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Recipes Table */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
          <table className="min-w-full divide-y divide-amber-200">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Recipe Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Info
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {filteredRecipes.map((recipe) => (
                <tr
                  key={recipe._id}
                  className="hover:bg-amber-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="h-20 w-20 rounded-lg overflow-hidden">
                      <RecipeImage
                        image={recipe.image}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-base font-medium text-amber-900 mb-1">
                      {recipe.title}
                    </div>
                    <div className="text-sm text-amber-600 line-clamp-2">
                      {recipe.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                      {recipe.categoryName || "Uncategorized"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 text-sm text-amber-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.prepTime || 0} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings || 0} servings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-400" />
                        <span>{recipe.rating?.toFixed(1) || "No ratings"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRecipe(recipe)}
                        className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {recipe.author?._id === user?._id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRecipe(recipe)}
                            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecipe(recipe)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(recipe._id)}
                        disabled={loadingFavorites[recipe._id]}
                        className={`hover:text-red-600 ${
                          recipe.isFavorite ? "text-red-600" : "text-gray-400"
                        }`}
                      >
                        {loadingFavorites[recipe._id] ? (
                          <div className="animate-spin">
                            <Loader2 className="h-5 w-5" />
                          </div>
                        ) : (
                          <Heart
                            className={`h-5 w-5 ${
                              recipe.isFavorite ? "fill-current" : ""
                            }`}
                          />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12 bg-amber-50/50">
              <Utensils className="h-12 w-12 text-amber-300 mx-auto mb-3" />
              <p className="text-amber-800 font-medium">No recipes found</p>
              <p className="text-amber-600 text-sm mt-1">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>

        {/* Keep existing modals and dialogs */}
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

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                recipe "{recipeToDelete?.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteRecipe}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </UserLayout>
  );
}
