import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Star, MessageSquare, LogOut, Clock, ChefHat, User, Key, Image as ImageIcon } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import ProfileDialog from '@/components/admin/ProfileDialog';
import ChangePasswordDialog from '@/components/admin/ChangePasswordDialog';

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    totalReviews: 0,
    recentRecipes: [],
    recentReviews: []
  });
  const [error, setError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (!isAdmin()) {
      router.push('/');
    } else {
      fetchStats();
    }
  }, [user, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      
      if (response && response.data) {
        setStats({
          totalUsers: response.data.users.total || 0,
          totalRecipes: response.data.recipes.total || 0,
          totalReviews: response.data.reviews.total || 0,
          recentRecipes: response.data.recipes.recent || [],
          recentReviews: response.data.reviews.recent || []
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Dashboard stats error:', err);
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

  if (!user || !isAdmin()) {
    return null;
  }

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
                <Users size={24} />
                Users
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Total Users:</strong> {stats.totalUsers}</p>
                <p><strong>Admin Users:</strong> {user.role === 'admin' ? 'Yes' : 'No'}</p>
                <p><strong>Your Email:</strong> {user.email}</p>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full mt-4">
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={24} />
                Recipes
              </CardTitle>
              <CardDescription>
                Manage recipe content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Total Recipes:</strong> {stats.totalRecipes}</p>
                {stats.recentRecipes.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Recent Recipes:</p>
                    {stats.recentRecipes.map((recipe) => (
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
                )}
              </div>
              <Link href="/admin/recipes">
                <Button variant="outline" className="w-full mt-4">
                  Manage Recipes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={24} />
                Reviews
              </CardTitle>
              <CardDescription>
                Manage user reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Total Reviews:</strong> {stats.totalReviews}</p>
                {stats.recentReviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Recent Reviews:</p>
                    {stats.recentReviews.map((review) => (
                      <div key={review._id} className="p-2 hover:bg-gray-50 rounded-md">
                        <p className="font-medium">{review.recipe.title}</p>
                        <p className="text-sm text-gray-500">
                          Rating: {review.rating}/5 • {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/admin/reviews">
                <Button variant="outline" className="w-full mt-4">
                  Manage Reviews
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome, {user.name}!</CardTitle>
            <CardDescription>
              This is your admin dashboard where you can manage the website content and user accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/admin/recipes">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Recipes
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Users
                    </Button>
                  </Link>
                  <Link href="/admin/reviews">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Reviews
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Admin Settings</h3>
                <div className="space-y-2">
                  <Link href="/admin/categories">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Categories
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsProfileOpen(true)}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsPasswordOpen(true)}>
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Recipes</CardTitle>
            <CardDescription>
              Latest recipes added to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentRecipes.length === 0 ? (
              <div className="text-center py-4">No recipes found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.recentRecipes.map((recipe) => (
                  <div key={recipe._id} className="border rounded-lg overflow-hidden">
                    <div className="relative h-40">
                      {recipe.image ? (
                        <Image
                          src={getImageUrl(recipe.image)}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{recipe.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{recipe.preparationTime + recipe.cookingTime} min</span>
                        <span className="mx-2">•</span>
                        <ChefHat className="h-4 w-4 mr-1" />
                        <span>{recipe.difficulty}</span>
                      </div>
                      <Link href={`/recipes/${recipe.slug}`}>
                        <Button variant="outline" className="w-full">
                          View Recipe
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/admin/recipes">
                <Button>Manage All Recipes</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfileDialog 
        open={isProfileOpen} 
        onOpenChange={setIsProfileOpen}
        onSuccess={() => {
          // Refresh user data if needed
          fetchStats();
        }}
      />

      <ChangePasswordDialog 
        open={isPasswordOpen} 
        onOpenChange={setIsPasswordOpen}
      />
    </AdminLayout>
  );
} 