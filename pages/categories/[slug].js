import { useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import RecipeCard from '@/components/recipe/RecipeCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChefHat, Coffee, Cake, Carrot, Pizza, Utensils } from 'lucide-react';
import Link from 'next/link';

// Categories data with icon names instead of components
const categoryData = [
  {
    name: "Breakfast",
    slug: "breakfast",
    iconName: "Coffee",
    description: "Start your day with delicious breakfast recipes",
    recipeCount: 12,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20"
  },
  {
    name: "Main Course",
    slug: "main-course",
    iconName: "Utensils",
    description: "Hearty meals for lunch and dinner",
    recipeCount: 25,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20"
  },
  {
    name: "Desserts",
    slug: "desserts",
    iconName: "Cake",
    description: "Sweet treats and delightful desserts",
    recipeCount: 18,
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/20"
  },
  {
    name: "Vegetarian",
    slug: "vegetarian",
    iconName: "Carrot",
    description: "Healthy and delicious vegetarian dishes",
    recipeCount: 15,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20"
  },
  {
    name: "Italian",
    slug: "italian",
    iconName: "Pizza",
    description: "Classic Italian recipes and dishes",
    recipeCount: 20,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20"
  },
  {
    name: "Advanced Recipes",
    slug: "advanced",
    iconName: "ChefHat",
    description: "Challenge yourself with these complex dishes",
    recipeCount: 8,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20"
  }
];

// Icon mapping
const iconComponents = {
  Coffee,
  Utensils,
  Cake,
  Carrot,
  Pizza,
  ChefHat
};

// Mock recipes data with categories
const mockRecipes = [
  // Breakfast Recipes
  {
    id: 1,
    title: "Blueberry Pancakes",
    description: "Fluffy pancakes loaded with fresh blueberries and maple syrup.",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&auto=format&fit=crop&q=60",
    prepTime: 15,
    cookTime: 20,
    difficulty: "Easy",
    rating: 4.5,
    hasVideo: false,
    isFavorite: true,
    category: "breakfast"
  },
  {
    id: 2,
    title: "Avocado Toast with Poached Eggs",
    description: "Creamy avocado on toasted sourdough with perfectly poached eggs.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=60",
    prepTime: 10,
    cookTime: 10,
    difficulty: "Easy",
    rating: 4.3,
    hasVideo: true,
    isFavorite: false,
    category: "breakfast"
  },
  
  // Italian Recipes
  {
    id: 3,
    title: "Classic Margherita Pizza",
    description: "A traditional Italian pizza with fresh mozzarella, tomatoes, and basil.",
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=60",
    prepTime: 20,
    cookTime: 15,
    difficulty: "Medium",
    rating: 4.8,
    hasVideo: true,
    isFavorite: false,
    category: "italian"
  },
  {
    id: 4,
    title: "Homemade Pasta Carbonara",
    description: "Authentic Italian carbonara with pancetta and Pecorino Romano.",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=60",
    prepTime: 15,
    cookTime: 20,
    difficulty: "Medium",
    rating: 4.7,
    hasVideo: true,
    isFavorite: false,
    category: "italian"
  },

  // Main Course Recipes
  {
    id: 5,
    title: "Mushroom Risotto",
    description: "Creamy Italian risotto with wild mushrooms and Parmesan.",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&auto=format&fit=crop&q=60",
    prepTime: 20,
    cookTime: 30,
    difficulty: "Advanced",
    rating: 4.7,
    hasVideo: true,
    isFavorite: false,
    category: "main-course"
  },
  {
    id: 6,
    title: "Grilled Salmon with Asparagus",
    description: "Fresh salmon fillet with grilled asparagus and lemon butter sauce.",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=60",
    prepTime: 15,
    cookTime: 25,
    difficulty: "Medium",
    rating: 4.6,
    hasVideo: false,
    isFavorite: true,
    category: "main-course"
  },

  // Vegetarian Recipes
  {
    id: 7,
    title: "Buddha Bowl",
    description: "Nutritious bowl with quinoa, roasted vegetables, and tahini dressing.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60",
    prepTime: 20,
    cookTime: 30,
    difficulty: "Easy",
    rating: 4.5,
    hasVideo: true,
    isFavorite: false,
    category: "vegetarian"
  },
  {
    id: 8,
    title: "Spinach and Mushroom Quiche",
    description: "Savory vegetarian quiche with fresh spinach and mushrooms.",
    image: "https://images.unsplash.com/photo-1647353337660-8b03b8e9880a?w=800&auto=format&fit=crop&q=60",
    prepTime: 25,
    cookTime: 45,
    difficulty: "Medium",
    rating: 4.4,
    hasVideo: false,
    isFavorite: false,
    category: "vegetarian"
  },

  // Dessert Recipes
  {
    id: 9,
    title: "Chocolate Lava Cake",
    description: "Decadent chocolate cake with a molten center, served with vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&auto=format&fit=crop&q=60",
    prepTime: 15,
    cookTime: 12,
    difficulty: "Medium",
    rating: 4.9,
    hasVideo: true,
    isFavorite: true,
    category: "desserts"
  },
  {
    id: 10,
    title: "French Macarons",
    description: "Delicate almond meringue cookies with various fillings.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800&auto=format&fit=crop&q=60",
    prepTime: 40,
    cookTime: 20,
    difficulty: "Advanced",
    rating: 4.6,
    hasVideo: true,
    isFavorite: false,
    category: "desserts"
  },

  // Advanced Recipes
  {
    id: 11,
    title: "Beef Wellington",
    description: "Classic British dish with beef tenderloin wrapped in puff pastry.",
    image: "https://images.unsplash.com/photo-1662487048245-06c0ac91f6af?w=800&auto=format&fit=crop&q=60",
    prepTime: 60,
    cookTime: 45,
    difficulty: "Advanced",
    rating: 4.8,
    hasVideo: true,
    isFavorite: false,
    category: "advanced"
  },
  {
    id: 12,
    title: "Soufflé au Chocolat",
    description: "Light and airy chocolate soufflé with perfect rise.",
    image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&auto=format&fit=crop&q=60",
    prepTime: 30,
    cookTime: 15,
    difficulty: "Advanced",
    rating: 4.7,
    hasVideo: true,
    isFavorite: false,
    category: "advanced"
  }
];

export default function CategoryPage({ category }) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState("rating");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle initial loading state
  if (router.isFallback || !category) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </MainLayout>
    );
  }

  // Get recipes for this category
  const categoryRecipes = mockRecipes
    .filter(recipe => recipe.category === category.slug)
    .filter(recipe => 
      searchQuery === "" || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "time") return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
      if (sortBy === "difficulty") {
        const difficultyOrder = { "Easy": 1, "Medium": 2, "Advanced": 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      return 0;
    });

  const Icon = iconComponents[category.iconName] || ChefHat;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-4 rounded-lg ${category.bgColor}`}>
            <Icon className={`h-12 w-12 ${category.color}`} />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground mt-1">
              {category.description}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="time">Quickest</SelectItem>
              <SelectItem value="difficulty">Easiest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recipe Grid or Empty State */}
        {categoryRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Icon className={`h-16 w-16 ${category.color} mx-auto mb-4 opacity-20`} />
            <h2 className="text-2xl font-semibold mb-2">No Recipes Available</h2>
            <p className="text-muted-foreground mb-8">
              {searchQuery 
                ? "No recipes found matching your search criteria." 
                : "No recipes are available for this category right now."}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export async function getStaticPaths() {
  const paths = categoryData.map((category) => ({
    params: { slug: category.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const category = categoryData.find((cat) => cat.slug === params.slug);

  if (!category) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      category,
    },
  };
} 