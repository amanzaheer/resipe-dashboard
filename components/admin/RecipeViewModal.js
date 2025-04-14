import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ChefHat,
  Star,
  Youtube,
  Users,
  Utensils,
  Timer,
  CheckCircle2
} from 'lucide-react';
import { recipesAPI } from '../../lib/api';
import { toast } from 'sonner';

export default function RecipeViewModal({ recipe, isOpen, onClose }) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{recipe.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={recipe.image || '/placeholder-recipe.jpg'}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Recipe Info */}
          <div>
            <p className="text-muted-foreground">{recipe.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Prep: {recipe.prepTime}min
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                Cook: {recipe.cookTime}min
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <ChefHat className="h-4 w-4" />
                {recipe.difficulty}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Serves {recipe.servings}
              </Badge>
              {recipe.hasVideo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Youtube className="h-4 w-4" />
                  Video Recipe
                </Badge>
              )}
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {recipe.rating} ({recipe.reviews?.length || 0} reviews)
              </Badge>
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
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Ingredients</h3>
                  <ul className="space-y-1">
                    {recipe.ingredients?.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Equipment Needed</h3>
                  <ul className="space-y-1">
                    {recipe.equipment?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Utensils className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="instructions">
              <ol className="space-y-4">
                {recipe.instructions?.map((instruction) => (
                  <li key={instruction.step} className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                      {instruction.step}
                    </span>
                    <p className="flex-1 pt-1">{instruction.description}</p>
                  </li>
                ))}
              </ol>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="space-y-4">
                {recipe.reviews?.length > 0 ? (
                  recipe.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
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
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No reviews yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 