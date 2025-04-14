import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ChefHat,
  Heart,
  Star,
  Youtube,
  Users,
  Utensils,
  Timer,
  CheckCircle2
} from 'lucide-react';
import { recipeAPI, favoritesAPI } from '@/lib/api';

// Function to convert title to URL-friendly slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

export async function getServerSideProps({ params }) {
  try {
    const { slug } = params;
    
    // Try to fetch by slug first
    let recipe;
    try {
      const response = await recipeAPI.getBySlug(slug);
      recipe = response.data;
    } catch (error) {
      // If slug fetch fails, try to fetch by ID
      if (error.response?.status === 404) {
        try {
          const response = await recipeAPI.getRecipeById(slug);
          recipe = response.data;
        } catch (idError) {
          console.error('Failed to fetch recipe:', idError);
          return { notFound: true };
        }
      } else {
        console.error('Failed to fetch recipe:', error);
        return { notFound: true };
      }
    }

    return {
      props: {
        recipe,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
}

export default function RecipePage({ recipe }) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(recipe?.isFavorite || false);

  // Handle loading state
  if (router.isFallback) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </MainLayout>
    );
  }

  // Handle 404 if recipe not found
  if (!recipe) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The recipe you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link href="/recipes">Browse All Recipes</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        await favoritesAPI.remove(recipe.id);
      } else {
        await favoritesAPI.add(recipe.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      // You might want to show an error toast here
    }
  };

  return (
    <MainLayout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Recipe Header */}
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-4 right-4 bg-background/50 backdrop-blur-sm hover:bg-background/70 ${
              isFavorite ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Recipe Info */}
        <div>
          <h1 className="text-4xl font-bold">{recipe.title}</h1>
          <p className="mt-2 text-muted-foreground">{recipe.description}</p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Prep: {recipe.prepTime}min
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Cook: {recipe.cookTime}min
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              {recipe.difficulty}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Serves {recipe.servings}
            </Badge>
            {recipe.hasVideo && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                Video Recipe
              </Badge>
            )}
          </div>
        </div>

        {/* Recipe Content */}
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Ingredients & Equipment
                </CardTitle>
                <CardDescription>
                  Everything you need to make this recipe
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Ingredients</h3>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Equipment Needed</h3>
                  <ul className="space-y-2">
                    {recipe.equipment.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Utensils className="h-5 w-5 text-muted-foreground shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>Step by Step Instructions</CardTitle>
                <CardDescription>
                  Follow these steps to make the perfect {recipe.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-6">
                  {recipe.instructions.map((instruction) => (
                    <li key={instruction.step} className="flex gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                        {instruction.step}
                      </span>
                      <p className="flex-1 pt-1">{instruction.description}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  {recipe.rating} ({recipe.reviews.length} reviews)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recipe.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.user}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </article>
    </MainLayout>
  );
} 