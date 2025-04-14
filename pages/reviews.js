import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import { reviewsAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import UserLayout from '@/components/layout/UserLayout';
import { toast } from 'sonner';

export default function ReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchReviews();
    }
  }, [user, router]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getByUser();
      setReviews(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to fetch your reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewsAPI.delete(reviewId);
      setReviews(reviews.filter(review => review._id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Failed to delete review');
    }
  };

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return '/images/placeholder-recipe.jpg';
    
    // If it's already a full URL, return it
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // If it's a relative path, prepend the API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${apiUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  };

  // Helper function to render stars
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="text-center text-red-600">{error}</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Reviews</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/recipes">
              <Button variant="outline" className="flex items-center gap-2">
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't written any reviews yet.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/recipes">
                    <Button>
                      Browse Recipes
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/dashboard/recipes/${review.recipe.slug}`}>
                        <CardTitle className="hover:underline">{review.recipe.title}</CardTitle>
                      </Link>
                      <CardDescription>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      {review.recipe.image ? (
                        <Image
                          src={getImageUrl(review.recipe.image)}
                          alt={review.recipe.title}
                          fill
                          className="object-cover rounded-md"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{review.comment}</p>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/dashboard/recipes/${review.recipe.slug}`}>
                          <Button variant="outline" size="sm">View Recipe</Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
} 