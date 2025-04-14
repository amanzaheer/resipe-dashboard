import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Clock, ChefHat, Star, Youtube } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Function to convert title to URL-friendly slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Remove leading/trailing spaces
};

export default function RecipeCard({ recipe }) {
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite);
  const {
    id,
    title,
    description,
    image,
    prepTime,
    cookTime,
    difficulty,
    rating,
    hasVideo,
  } = recipe;

  const slug = createSlug(title);

  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Prevent navigation when clicking the heart
    setIsFavorite(!isFavorite);
    // TODO: Implement API call to update favorite status
  };

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-video">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {hasVideo && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Youtube className="h-4 w-4" />
              Video
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 left-2 bg-background/50 backdrop-blur-sm hover:bg-background/70 ${
            isFavorite ? 'text-red-500' : 'text-muted-foreground'
          }`}
          onClick={handleFavoriteClick}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <CardHeader className="space-y-2">
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{prepTime + cookTime} min</span>
          </div>
          <div className="flex items-center">
            <ChefHat className="h-4 w-4 mr-1" />
            <span>{difficulty}</span>
          </div>
          {rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/recipes/${slug}`}>View Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 