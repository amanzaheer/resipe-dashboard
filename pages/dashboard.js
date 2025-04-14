import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, LogOut, Clock, ChefHat, User, Key, Image as ImageIcon, BookOpen } from 'lucide-react';
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
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2">
              <User size={18} />
              Profile
            </Button>
            <Button variant="outline" onClick={() => setIsPasswordOpen(true)} className="flex items-center gap-2">
              <Key size={18} />
              Change Password
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={24} />
                My Reviews
              </CardTitle>
              <CardDescription>
                Reviews you've written for recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Total Reviews:</strong> {userData.totalReviews}</p>
                {userData.reviews.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-medium">Recent Reviews:</p>
                    {userData.reviews.slice(0, 3).map((review) => (
                      <div key={review._id} className="p-2 hover:bg-gray-50 rounded-md">
                        <p className="font-medium">{review.recipe.title}</p>
                        <p className="text-sm text-gray-500">
                          Rating: {review.rating}/5 • {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {userData.reviews.length > 3 && (
                      <p className="text-sm text-gray-500">+ {userData.reviews.length - 3} more reviews</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">You haven't written any reviews yet.</p>
                )}
              </div>
              <Link href="/dashboard/reviews">
                <Button variant="outline" className="w-full mt-4">
                  View All Reviews
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={24} />
                My Favorites
              </CardTitle>
              <CardDescription>
                Recipes you've saved as favorites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Total Favorites:</strong> {userData.totalFavorites}</p>
                {userData.favorites.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-medium">Recent Favorites:</p>
                    {userData.favorites.slice(0, 3).map((favorite) => (
                      <div key={favorite._id || favorite.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md">
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
                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {favorite.recipe ? favorite.recipe.title : 'Recipe not found'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {favorite.recipe ? favorite.recipe.description : 'No description available'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {userData.favorites.length > 3 && (
                      <p className="text-sm text-gray-500">+ {userData.favorites.length - 3} more favorites</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">You haven't saved any favorites yet.</p>
                )}
              </div>
              <Link href="/dashboard/favorites">
                <Button variant="outline" className="w-full mt-4">
                  View All Favorites
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={24} />
                Recent Recipes
              </CardTitle>
              <CardDescription>
                Latest recipes added to the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userData.recentRecipes.length > 0 ? (
                  <div className="space-y-2">
                    {userData.recentRecipes.map((recipe) => (
                      <div key={recipe._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md">
                        <div className="relative h-12 w-12 flex-shrink-0">
                          {recipe.image ? (
                            <Image
                              src={getImageUrl(recipe.image)}
                              alt={recipe.title}
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
                        <div>
                          <p className="font-medium">{recipe.title}</p>
                          <p className="text-sm text-gray-500">
                            {recipe.preparationTime + recipe.cookingTime} min • {recipe.difficulty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent recipes available.</p>
                )}
              </div>
              <Link href="/dashboard/recipes">
                <Button variant="outline" className="w-full mt-4">
                  Browse All Recipes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome, {user.name}!</CardTitle>
            <CardDescription>
              This is your personal dashboard where you can manage your reviews and favorites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/dashboard/recipes">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Recipes
                    </Button>
                  </Link>
                  <Link href="/dashboard/reviews">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      My Reviews
                    </Button>
                  </Link>
                  <Link href="/dashboard/favorites">
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="mr-2 h-4 w-4" />
                      My Favorites
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Account Settings</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
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