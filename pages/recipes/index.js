import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import RecipeCard from '@/components/recipe/RecipeCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChefHat, Clock } from 'lucide-react';
import { recipeAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

export default function RecipesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    difficulty: "all",
    maxTime: 120
  });

  const categories = ["All", "Breakfast", "Main Course", "Desserts", "Vegetarian", "Snacks"];
  const difficulties = ["All", "Easy", "Medium", "Advanced"];

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll();
      
      // Ensure recipes is always an array
      let recipesData = [];
      
      if (response && response.data) {
        // Check if response.data is an array or has a recipes property
        if (Array.isArray(response.data)) {
          recipesData = response.data;
        } else if (response.data.recipes && Array.isArray(response.data.recipes)) {
          recipesData = response.data.recipes;
        } else if (typeof response.data === 'object') {
          // If it's an object but not an array, try to convert it to an array
          recipesData = Object.values(response.data);
        }
      }
      
      // Filter out any non-recipe objects
      recipesData = recipesData.filter(item => item && typeof item === 'object' && item.title);
      
      console.log('Fetched recipes:', recipesData.length);
      setRecipes(recipesData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to fetch recipes. Please try again later.');
      setLoading(false);
      // Ensure recipes is an empty array on error
      setRecipes([]);
    }
  };

  // Ensure recipes is an array before filtering
  const filteredRecipes = Array.isArray(recipes) ? recipes.filter(recipe => {
    if (!recipe || typeof recipe !== 'object') return false;
    
    if (filters.search && recipe.title && !recipe.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category !== "all" && recipe.category !== filters.category) {
      return false;
    }
    if (filters.difficulty !== "all" && recipe.difficulty && recipe.difficulty.toLowerCase() !== filters.difficulty) {
      return false;
    }
    if ((recipe.preparationTime + recipe.cookingTime) > filters.maxTime) {
      return false;
    }
    return true;
  }) : [];

  // Map API recipe format to the format expected by RecipeCard
  const mappedRecipes = filteredRecipes.map(recipe => ({
    id: recipe._id,
    title: recipe.title,
    description: recipe.description,
    image: recipe.image || 'https://via.placeholder.com/300x200',
    prepTime: recipe.preparationTime || 0,
    cookTime: recipe.cookingTime || 0,
    difficulty: recipe.difficulty || 'Medium',
    rating: 4.5, // Default rating since it's not in the API response
    hasVideo: false, // Default value since it's not in the API response
    isFavorite: false, // Default value since it's not in the API response
    category: recipe.category || 'Main Course'
  }));

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold">All Recipes</h1>
          <p className="text-muted-foreground mt-2">
            Discover our collection of delicious recipes
          </p>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Input
              placeholder="Search recipes..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.toLowerCase()} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.difficulty}
            onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty.toLowerCase()} value={difficulty.toLowerCase()}>
                  <span className="flex items-center">
                    <ChefHat className="w-4 h-4 mr-2" />
                    {difficulty}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Max Time</span>
              <span className="text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-1" />
                {filters.maxTime} min
              </span>
            </div>
            <Slider
              value={[filters.maxTime]}
              onValueChange={([value]) => setFilters({ ...filters, maxTime: value })}
              max={180}
              step={15}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={fetchRecipes}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mappedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && mappedRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recipes found matching your filters.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setFilters({
                search: "",
                category: "all",
                difficulty: "all",
                maxTime: 120
              })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 