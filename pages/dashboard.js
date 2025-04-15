import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, LogOut, Clock, ChefHat, User, Key, Image as ImageIcon, BookOpen, Utensils, FileText, ListChecks, Check, ClipboardList, Edit, Trash2, Flame } from 'lucide-react';
import { reviewsAPI, favoritesAPI, recipeAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import ProfileDialog from '@/components/admin/ProfileDialog';
import ChangePasswordDialog from '@/components/admin/ChangePasswordDialog';
import UserLayout from '@/components/layout/UserLayout';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    reviews: [],
    favorites: [],
    totalReviews: 0,
    totalFavorites: 0,
    recentRecipes: []
  });
  const [error, setError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchUserData();
    }
  }, [user, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user reviews
      const reviewsResponse = await reviewsAPI.getByUser();
      const reviews = reviewsResponse.data || [];
      
      // Fetch user favorites
      const favoritesResponse = await favoritesAPI.getAll();
      let favorites = favoritesResponse.data || [];
      
      // Ensure favorites have the expected structure
      favorites = favorites.map(favorite => {
        // If favorite is just an ID or doesn't have a recipe property, create a placeholder
        if (!favorite.recipe) {
          return {
            ...favorite,
            recipe: {
              title: 'Recipe not found',
              description: 'No description available',
              image: null
            }
          };
        }
        return favorite;
      });
      
      // Fetch recent recipes
      const recipesResponse = await recipeAPI.getAll({ limit: 5, sort: 'createdAt' });
      const recentRecipes = recipesResponse.data || [];
      
      setUserData({
        reviews,
        favorites,
        totalReviews: reviews.length,
        totalFavorites: favorites.length,
        recentRecipes
      });
      
      setError('');
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch your data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
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

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="font-medium">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-red-300 text-red-600 hover:bg-red-100"
            onClick={fetchUserData}
          >
            Try Again
          </Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-800">My Dashboard</h1>
            <p className="text-amber-600 mt-1">Welcome back, {user.name}!</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsProfileOpen(true)} 
              className="flex items-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <User size={18} />
              Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordOpen(true)} 
              className="flex items-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <Key size={18} />
              Change Password
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Star size={20} className="text-amber-600" />
                </div>
                My Reviews
              </CardTitle>
              <CardDescription className="text-amber-600">
                Reviews you've written for recipes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-amber-700"><strong>Total Reviews:</strong> {userData.totalReviews}</p>
                {userData.reviews.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-medium text-amber-800">Recent Reviews:</p>
                    {userData.reviews.slice(0, 3).map((review) => (
                      <div key={review._id} className="p-2 hover:bg-amber-50 rounded-md transition-colors border border-amber-100">
                        <p className="font-medium text-amber-900">{review.recipe.title}</p>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-amber-200"} 
                              />
                            ))}
                          </div>
                          <p className="text-xs text-amber-600 ml-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {userData.reviews.length > 3 && (
                      <p className="text-sm text-amber-600">+ {userData.reviews.length - 3} more reviews</p>
                    )}
                  </div>
                ) : (
                  <p className="text-amber-600">You haven't written any reviews yet.</p>
                )}
              </div>
              <Link href="/dashboard/reviews">
                <Button variant="outline" className="w-full mt-4 border-amber-200 text-amber-700 hover:bg-amber-50">
                  View All Reviews
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <div className="p-2 bg-amber-100 rounded-full">
                  <MessageSquare size={20} className="text-amber-600" />
                </div>
                My Favorites
              </CardTitle>
              <CardDescription className="text-amber-600">
                Recipes you've saved as favorites
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-amber-700"><strong>Total Favorites:</strong> {userData.totalFavorites}</p>
                {userData.favorites.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-medium text-amber-800">Recent Favorites:</p>
                    {userData.favorites.slice(0, 3).map((favorite) => (
                      <div key={favorite._id || favorite.id} className="flex items-center gap-2 p-2 hover:bg-amber-50 rounded-md transition-colors border border-amber-100">
                        <div className="relative h-12 w-12 flex-shrink-0">
                          {favorite.recipe && favorite.recipe.image ? (
                            <Image
                              src={getImageUrl(favorite.recipe.image)}
                              alt={favorite.recipe.title || 'Recipe'}
                              fill
                              className="object-cover rounded-md"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-amber-100 rounded-md flex items-center justify-center">
                              <Utensils className="h-5 w-5 text-amber-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-amber-900">
                            {favorite.recipe ? favorite.recipe.title : 'Recipe not found'}
                          </p>
                          <p className="text-xs text-amber-600 truncate">
                            {favorite.recipe ? favorite.recipe.description : 'No description available'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {userData.favorites.length > 3 && (
                      <p className="text-sm text-amber-600">+ {userData.favorites.length - 3} more favorites</p>
                    )}
                  </div>
                ) : (
                  <p className="text-amber-600">You haven't saved any favorites yet.</p>
                )}
              </div>
              <Link href="/dashboard/favorites">
                <Button variant="outline" className="w-full mt-4 border-amber-200 text-amber-700 hover:bg-amber-50">
                  View All Favorites
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <div className="p-2 bg-amber-100 rounded-full">
                  <BookOpen size={20} className="text-amber-600" />
                </div>
                Recent Recipes
              </CardTitle>
              <CardDescription className="text-amber-600">
                Latest recipes added to the site
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {userData.recentRecipes.length > 0 ? (
                  <div className="space-y-3">
                    {userData.recentRecipes.map((recipe) => (
                      <Link href={`/recipes/${recipe._id}`} key={recipe._id}>
                        <div className="group flex items-center gap-4 p-3 hover:bg-amber-50 rounded-lg transition-all duration-200 border border-amber-100 hover:border-amber-300 cursor-pointer">
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                            {recipe.image ? (
                              <Image
                                src={getImageUrl(recipe.image)}
                                alt={recipe.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                                <Utensils className="h-6 w-6 text-amber-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-amber-900 group-hover:text-amber-700 transition-colors mb-1">
                              {recipe.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-amber-600">
                              <div className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                <span>{recipe.preparationTime + recipe.cookingTime} min</span>
                              </div>
                              <div className="flex items-center">
                                <ChefHat size={14} className="mr-1" />
                                <span className="capitalize">{recipe.difficulty}</span>
                              </div>
                              {recipe.category && (
                                <div className="hidden sm:flex items-center">
                                  <Utensils size={14} className="mr-1" />
                                  <span className="capitalize">{recipe.category}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <BookOpen size={20} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-amber-50/50 rounded-lg border border-dashed border-amber-200">
                    <Utensils className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-amber-600">No recent recipes available.</p>
                  </div>
                )}
              </div>
              <Link href="/dashboard/recipes">
                <Button 
                  variant="outline" 
                  className="w-full mt-6 border-amber-200 text-amber-700 hover:bg-amber-50 group"
                >
                  Browse All Recipes
                  <BookOpen className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-amber-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
          <CardHeader className="bg-amber-50 border-b border-amber-100">
            <CardTitle className="text-amber-800">Welcome to Your Recipe Dashboard</CardTitle>
            <CardDescription className="text-amber-600">
              This is your personal dashboard where you can manage your reviews and favorites.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h3 className="font-semibold mb-2 text-amber-800 flex items-center">
                  <Utensils size={18} className="mr-2 text-amber-600" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link href="/dashboard/recipes">
                    <Button variant="outline" className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-100">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Recipes
                    </Button>
                  </Link>
                  <Link href="/dashboard/reviews">
                    <Button variant="outline" className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-100">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      My Reviews
                    </Button>
                  </Link>
                  <Link href="/dashboard/favorites">
                    <Button variant="outline" className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-100">
                      <Star className="mr-2 h-4 w-4" />
                      My Favorites
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h3 className="font-semibold mb-2 text-amber-800 flex items-center">
                  <User size={18} className="mr-2 text-amber-600" />
                  Account Settings
                </h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-100"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-100"
                    onClick={() => setIsPasswordOpen(true)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog 
        open={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
        user={user} 
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog 
        open={isPasswordOpen} 
        onOpenChange={setIsPasswordOpen} 
      />
    </UserLayout>
  );
} 