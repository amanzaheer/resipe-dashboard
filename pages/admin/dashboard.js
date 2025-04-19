import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ChefHat,
  Star,
  MessageSquare,
  TrendingUp,
  Clock,
  Utensils,
  Coffee,
  Pizza,
  User,
  Key,
  LogOut,
  ImageIcon,
  BookOpen,
  Heart,
  ArrowUpRight,
  Settings,
  Eye,
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import ProfileDialog from "@/components/admin/ProfileDialog";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";
import RecipeEditModal from "@/components/admin/RecipeEditModal";
import { toast } from "react-hot-toast";
import RecipeViewModal from '@/components/admin/RecipeViewModal';

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    totalReviews: 0,
    recentRecipes: [],
    recentReviews: [],
  });
  const [error, setError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (!isAdmin()) {
      router.push("/");
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
          recentReviews: response.data.reviews.recent || [],
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError("Failed to fetch dashboard statistics");
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setViewModalOpen(true);
  };

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return "/images/placeholder-recipe.jpg";

    // If it's already a full URL, return it
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // If it's a relative path, prepend the API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-amber-700 mt-1">
              Here's what's cooking in your kitchen today
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setIsProfileOpen(true)}
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPasswordOpen(true)}
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <Key className="h-4 w-4 mr-2" />
              Password
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {stats.totalUsers}
              </div>
              <p className="text-blue-600 text-sm mt-1">Active members</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" />
                Total Recipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {stats.totalRecipes}
              </div>
              <p className="text-amber-600 text-sm mt-1">Published recipes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-green-600" />
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {stats.totalReviews}
              </div>
              <p className="text-green-600 text-sm mt-1">Total feedback</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Active Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">24</div>
              <p className="text-purple-600 text-sm mt-1">Active users today</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-amber-900">Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-amber-200 hover:bg-amber-50"
                onClick={() => {
                  setSelectedRecipe(null);
                  setEditModalOpen(true);
                }}
              >
                <ChefHat className="h-6 w-6 text-amber-600" />
                <span>Add Recipe</span>
              </Button>
              <Link href="/admin/categories" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col gap-2 border-amber-200 hover:bg-amber-50"
                >
                  <Utensils className="h-6 w-6 text-amber-600" />
                  <span>Categories</span>
                </Button>
              </Link>
              <Link href="/admin/users" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col gap-2 border-amber-200 hover:bg-amber-50"
                >
                  <Users className="h-6 w-6 text-amber-600" />
                  <span>Users</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-amber-900">Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentRecipes?.slice(0, 3).map((recipe) => (
                <div
                  key={recipe._id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-amber-50 transition-all"
                >
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                    {recipe.image ? (
                      <Image
                        src={getImageUrl(recipe.image)}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-amber-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900 truncate">
                      {recipe.title}
                    </p>
                    <p className="text-sm text-amber-600">New recipe added</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-amber-600" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Recipes */}
        <Card className="border-amber-100">
          <CardHeader>
            <CardTitle className="text-amber-900">Latest Recipes</CardTitle>
            <CardDescription>
              Recently added recipes to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.recentRecipes?.map((recipe) => (
                <div
                  key={recipe._id}
                  className="group overflow-hidden rounded-xl border border-amber-100 bg-white transition-all hover:shadow-md"
                >
                  <div className="aspect-video relative overflow-hidden">
                    {recipe.image ? (
                      <Image
                        src={getImageUrl(recipe.image)}
                        alt={recipe.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-amber-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-amber-900 line-clamp-1">
                      {recipe.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-amber-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {recipe.preparationTime + recipe.cookingTime} min
                      </div>
                      <div className="flex items-center">
                        <ChefHat className="h-4 w-4 mr-1" />
                        {recipe.difficulty}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRecipe(recipe)}
                        className="border-amber-200 hover:bg-amber-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <div className="flex items-center text-amber-600">
                        <Heart className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {recipe.favorites?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/admin/recipes">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  View All Recipes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Keep existing dialogs */}
        <ProfileDialog
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          onSuccess={() => {
            fetchStats();
          }}
        />

        <ChangePasswordDialog
          open={isPasswordOpen}
          onOpenChange={setIsPasswordOpen}
        />

        <RecipeEditModal 
          recipe={selectedRecipe}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={() => {
            toast.success('Recipe created successfully');
            setEditModalOpen(false);
          }}
        />

        <RecipeViewModal 
          recipe={selectedRecipe}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
