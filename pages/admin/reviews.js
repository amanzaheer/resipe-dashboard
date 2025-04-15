import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reviewsAPI } from '@/lib/api';
import { Search, Star, Trash2, MessageSquare, User, BookOpen, Calendar, ThumbsUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getAll();
      setReviews(response.data);
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error('Reviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsAPI.delete(reviewId);
        setReviews(reviews.filter(review => review._id !== reviewId));
      } catch (err) {
        setError('Failed to delete review');
        console.error('Review delete error:', err);
      }
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center text-red-600">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Review Management</h1>
            <p className="text-slate-600 mt-1">Monitor and moderate user reviews across the platform</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-900 font-medium flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{reviews.length}</div>
              <p className="text-blue-600 text-sm mt-1">across all recipes</p>
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
              <p className="text-amber-600 text-sm mt-1">stars overall</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-900 font-medium flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-600" />
                5-Star Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {reviews.filter(review => review.rating === 5).length}
              </div>
              <p className="text-green-600 text-sm mt-1">excellent ratings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-900 font-medium flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Low Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">
                {reviews.filter(review => review.rating <= 2).length}
              </div>
              <p className="text-red-600 text-sm mt-1">need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by recipe, user, or review content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[180px] border-slate-200">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars Only</SelectItem>
              <SelectItem value="4">4 Stars Only</SelectItem>
              <SelectItem value="3">3 Stars Only</SelectItem>
              <SelectItem value="2">2 Stars Only</SelectItem>
              <SelectItem value="1">1 Star Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Review List</h2>
            <p className="text-slate-600 text-sm mt-1">
              Showing {filteredReviews.length} of {reviews.length} total reviews
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredReviews.map((review) => (
              <div key={review._id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="space-y-1">
                    <Link href={`/admin/recipes/${review.recipe.slug}`}>
                      <h3 className="text-lg font-medium text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {review.recipe.title}
                      </h3>
                    </Link>
                    <Link href={`/admin/users/${review.user._id}`}>
                      <p className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {review.user.name}
                      </p>
                    </Link>
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-full">
                      {Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating 
                              ? 'text-amber-500 fill-amber-500' 
                              : 'text-amber-200'
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-medium text-amber-700">
                        {review.rating}/5
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(review._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400 mt-1" />
                    <p className="text-slate-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No Reviews Found</h3>
                <p className="text-slate-600">
                  {searchTerm || ratingFilter !== 'all' 
                    ? 'Try adjusting your search filters'
                    : 'No reviews have been submitted yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 