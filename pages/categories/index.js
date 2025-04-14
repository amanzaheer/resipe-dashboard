import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChefHat, Utensils, Coffee, Cake, Carrot, Pizza } from 'lucide-react';

// Mock categories data with icons and descriptions
const categories = [
  {
    name: "Breakfast",
    slug: "breakfast",
    icon: Coffee,
    description: "Start your day with delicious breakfast recipes",
    recipeCount: 12,
    color: "text-orange-500"
  },
  {
    name: "Main Course",
    slug: "main-course",
    icon: Utensils,
    description: "Hearty meals for lunch and dinner",
    recipeCount: 25,
    color: "text-blue-500"
  },
  {
    name: "Desserts",
    slug: "desserts",
    icon: Cake,
    description: "Sweet treats and delightful desserts",
    recipeCount: 18,
    color: "text-pink-500"
  },
  {
    name: "Vegetarian",
    slug: "vegetarian",
    icon: Carrot,
    description: "Healthy and delicious vegetarian dishes",
    recipeCount: 15,
    color: "text-green-500"
  },
  {
    name: "Italian",
    slug: "italian",
    icon: Pizza,
    description: "Classic Italian recipes and dishes",
    recipeCount: 20,
    color: "text-red-500"
  },
  {
    name: "Advanced Recipes",
    slug: "advanced",
    icon: ChefHat,
    description: "Challenge yourself with these complex dishes",
    recipeCount: 8,
    color: "text-purple-500"
  }
];

export default function CategoriesPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Recipe Categories</h1>
          <p className="text-muted-foreground">
            Browse our collection of recipes by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link 
                key={category.slug} 
                href={`/categories/${category.slug}`}
                className="block group"
              >
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${category.color} bg-opacity-10`}>
                        <Icon className={`h-8 w-8 ${category.color}`} />
                      </div>
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {category.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {category.recipeCount} recipes
                        </p>
                      </div>
                    </div>
                    <CardDescription>
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
} 