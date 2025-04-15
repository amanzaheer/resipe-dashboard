import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Edit, Image as ImageIcon, MessageSquare, Calendar, Utensils, Eye } from 'lucide-react';
import { reviewsAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import UserLayout from '@/components/layout/UserLayout';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, Search, ThumbsUp } from 'lucide-react';

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
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">My Reviews</h1>
            <p className="text-amber-600 mt-1">Track and manage your recipe reviews</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/recipes">
              <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 font-medium flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">{reviews.length}</div>
              <p className="text-amber-600 text-sm mt-1">reviews written</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 font-medium flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-600" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0).toFixed(1)}
              </div>
              <p className="text-amber-600 text-sm mt-1">stars given</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 font-medium flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-amber-600" />
                5-Star Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {reviews.filter(review => review.rating === 5).length}
              </div>
              <p className="text-amber-600 text-sm mt-1">perfect ratings</p>
            </CardContent>
          </Card>
        </div>

        {reviews.length === 0 ? (
          <Card className="border-amber-100 shadow-sm text-center">
            <CardContent className="py-16">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center mb-6">
                <Star className="h-10 w-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-semibold text-amber-900 mb-3">No Reviews Yet</h3>
              <p className="text-amber-600 mb-8 max-w-md mx-auto">
                Share your culinary experiences by reviewing recipes you've tried. Your feedback helps the community!
              </p>
              <Link href="/dashboard/recipes">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Discover Recipes to Review
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review._id} className="border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-amber-100 bg-amber-50/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <Link href={`/dashboard/recipes/${review.recipe.slug}`}>
                        <CardTitle className="text-amber-900 hover:text-amber-700 transition-colors flex items-center gap-2">
                          <Utensils className="h-5 w-5" />
                          {review.recipe.title}
                        </CardTitle>
                      </Link>
                      <CardDescription className="flex items-center gap-2 text-amber-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 px-4 py-2 rounded-full">
                      {renderStars(review.rating)}
                      <span className="ml-2 font-medium text-amber-700">{review.rating}/5</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex gap-6">
                    <div className="relative h-28 w-28 flex-shrink-0">
                      {review.recipe.image ? (
                        <Image
                          src={getImageUrl(review.recipe.image)}
                          alt={review.recipe.title}
                          fill
                          className="object-cover rounded-lg"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg flex items-center justify-center">
                          <Utensils className="h-10 w-10 text-amber-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="bg-amber-50/50 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-amber-500 mt-1" />
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/dashboard/recipes/${review.recipe.slug}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-amber-200 text-amber-700 hover:bg-amber-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Recipe
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Review
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