import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  Star,
  Heart,
  ChefHat,
  Utensils,
  MessageCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { favoritesAPI, reviewsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewForm from "./ReviewForm";

export default function RecipeViewModal({
  recipe,
  isOpen,
  onClose,
  onToggleFavorite,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(recipe?.isFavorite || false);

  useEffect(() => {
    if (recipe && isOpen) {
      fetchReviews();

      // Set image URL
      const getImageUrl = (image) => {
        if (!image) return null;

        if (image.startsWith("http://") || image.startsWith("https://")) {
          return image;
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // Handle different path formats
        if (image.startsWith("/uploads/")) {
          return `${apiUrl}${image}`;
        } else if (image.startsWith("uploads/")) {
          return `${apiUrl}/${image}`;
        } else if (image.startsWith("/")) {
          return `${apiUrl}${image}`;
        } else {
          // For any other format, assume it's a relative path
          return `${apiUrl}/${image}`;
        }
      };

      const url = getImageUrl(recipe.image);
      console.log("Modal Image URL:", url); // Debug log
      setImageUrl(url);
    }
  }, [recipe, isOpen]);

  useEffect(() => {
    if (recipe) {
      setLocalIsFavorite(recipe.isFavorite || false);
    }
  }, [recipe]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await reviewsAPI.getByRecipe(recipe._id);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleImageError = () => {
    console.error("Modal image failed to load:", imageUrl); // Debug log
    setImageError(true);
  };

  const handleFavoriteToggle = async () => {
    if (!recipe?._id) return;

    setIsLoading(true);
    try {
      if (localIsFavorite) {
        // Remove from favorites
        await favoritesAPI.removeFavorite(recipe._id);
        
        // Update both local and parent state immediately
        setLocalIsFavorite(false);
        onToggleFavorite(recipe._id); // Just pass the ID to the parent
        
        toast.success("Recipe removed from favorites");
      } else {
        // Add to favorites
        await favoritesAPI.addFavorite(recipe._id);
        
        // Update both local and parent state immediately
        setLocalIsFavorite(true);
        onToggleFavorite(recipe._id); // Just pass the ID to the parent
        
        toast.success("Recipe added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      
      // Revert the local state on error
      setLocalIsFavorite(!localIsFavorite);
      
      if (error.response?.status === 404) {
        toast.error("Could not find the recipe");
      } else if (error.response?.status === 400) {
        toast.error("Recipe is already in favorites");
      } else {
        toast.error("An error occurred while updating favorite status");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAdded = () => {
    fetchReviews();
  };

  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-amber-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-amber-600" />
            {recipe?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={recipe.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                unoptimized
                onError={handleImageError}
              />
            ) : (
              <div className="h-full w-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600">No image available</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-4 border border-amber-100">
              <div className="flex items-center gap-3 text-amber-800">
                <Clock className="h-5 w-5 text-amber-600" />
                <div className="flex gap-2 items-center">
                  <span className="font-medium">Prep:</span>
                  <span>{recipe?.preparationTime} min</span>
                  <span className="text-amber-300">•</span>
                  <span className="font-medium">Cook:</span>
                  <span>{recipe?.cookingTime} min</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-amber-800">
                <Users className="h-5 w-5 text-amber-600" />
                <span className="font-medium">Serves {recipe?.servings}</span>
              </div>

              <div className="flex items-center gap-3 text-amber-800">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="font-medium">
                  {recipe?.rating?.toFixed(1)} ({recipe?.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
              <p className="text-amber-900 leading-relaxed">
                {recipe?.description}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleFavoriteToggle}
              disabled={isLoading}
              className={`w-full h-12 text-base font-medium transition-colors
                ${
                  localIsFavorite
                    ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                    : "border-amber-200 text-amber-700 hover:bg-amber-50"
                }`}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Heart
                  className={`h-5 w-5 mr-2 ${
                    localIsFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              )}
              {localIsFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="ingredients" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-amber-100/50">
            <TabsTrigger
              value="ingredients"
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <Utensils className="h-4 w-4 mr-2" />
              Ingredients
            </TabsTrigger>
            <TabsTrigger
              value="instructions"
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              Instructions
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="ingredients"
            className="bg-white p-6 rounded-lg shadow-sm mt-4 border border-amber-100"
          >
            <ul className="space-y-3">
              {recipe?.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-amber-900"
                >
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent
            value="instructions"
            className="bg-white p-6 rounded-lg shadow-sm mt-4 border border-amber-100"
          >
            <ol className="space-y-4">
              {recipe?.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4 text-amber-900">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-medium">
                    {index + 1}
                  </span>
                  <p className="leading-relaxed">{instruction}</p>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent
            value="reviews"
            className="bg-white p-6 rounded-lg shadow-sm mt-4 border border-amber-100"
          >
            <div className="space-y-6">
              <ReviewForm recipe={recipe} onReviewAdded={handleReviewAdded} />

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">
                  Reviews
                </h3>
                {loadingReviews ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="border-b border-amber-100 pb-4 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-amber-900">
                              {review.user.name}
                            </span>
                            <span className="text-sm text-amber-600">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-amber-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-amber-800">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-amber-600">
                    No reviews yet. Be the first to review this recipe!
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
