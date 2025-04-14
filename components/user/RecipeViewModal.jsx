import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star, Heart } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { favoritesAPI, reviewsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewForm from './ReviewForm';

export default function RecipeViewModal({ recipe, isOpen, onClose, onToggleFavorite }) {
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (recipe && isOpen) {
      fetchReviews();
      
      // Set image URL
      const getImageUrl = (image) => {
        if (!image) return null;
        
        if (image.startsWith('http://') || image.startsWith('https://')) {
          return image;
        }
        
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
      
      const url = getImageUrl(recipe.image);
      console.log('Modal Image URL:', url); // Debug log
      setImageUrl(url);
    }
  }, [recipe, isOpen]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await reviewsAPI.getByRecipe(recipe._id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleImageError = () => {
    console.error('Modal image failed to load:', imageUrl); // Debug log
    setImageError(true);
  };

  const handleFavoriteToggle = async () => {
    if (!recipe) return;
    
    setIsLoading(true);
    try {
      if (recipe.isFavorite) {
        await favoritesAPI.removeFavorite(recipe._id);
        toast.success('Recipe removed from favorites');
      } else {
        await favoritesAPI.addFavorite(recipe._id);
        toast.success('Recipe added to favorites');
      }
      
      if (onToggleFavorite) {
        onToggleFavorite(recipe._id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('An error occurred while updating favorite status');
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{recipe.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                unoptimized
                onError={handleImageError}
              />
            ) : (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Prep: {recipe.preparationTime} min</span>
              <span>•</span>
              <span>Cook: {recipe.cookingTime} min</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Serves {recipe.servings}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{recipe.rating.toFixed(1)} ({recipe.reviewCount} reviews)</span>
            </div>
            
            <p className="text-sm text-gray-600">{recipe.description}</p>
            
            <Button
              variant="outline"
              onClick={handleFavoriteToggle}
              disabled={isLoading}
              className="w-full"
            >
              <Heart
                className={`h-4 w-4 mr-2 ${
                  recipe.isFavorite ? 'fill-red-500 text-red-500' : ''
                }`}
              />
              {recipe.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ingredients">
            <ul className="list-disc pl-4 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </TabsContent>
          
          <TabsContent value="instructions">
            <ol className="list-decimal pl-4 space-y-2">
              {recipe.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="space-y-6">
              <ReviewForm recipe={recipe} onReviewAdded={handleReviewAdded} />
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">All Reviews</h3>
                {loadingReviews ? (
                  <div className="text-center py-4">Loading reviews...</div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{review.user.name}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
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