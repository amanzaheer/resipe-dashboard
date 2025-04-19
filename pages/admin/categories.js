import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/admin/AdminLayout";
import CategoryDialog from "../../components/admin/CategoryDialog";
import { categoryAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { categoriesAPI } from "@/lib/api";
import { Plus, Pencil, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CategoriesPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (!isAdmin()) {
      router.push("/");
    } else {
      fetchCategories();
    }
  }, [user, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.response?.data?.message || "Failed to fetch categories");
      toast.error(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    setIsSubmitting(true);
    try {
      await categoryAPI.delete(id);
      await fetchCategories();
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSuccess = async () => {
    await fetchCategories();
    handleDialogClose();
  };

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Categories Management</h1>
          <Button
            onClick={handleAddNew}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-600">
                    Total Categories
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {categories.length}
                  </p>
                  <p className="text-sm text-orange-600/60">
                    Active categories
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100/50 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-600">Most Used</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {categories[0]?.name || "None"}
                  </p>
                  <p className="text-sm text-blue-600/60">Popular category</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100/50 flex items-center justify-center">
                  <Pencil className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-600">
                    Last Added
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {categories[categories.length - 1]?.name || "None"}
                  </p>
                  <p className="text-sm text-purple-600/60">Recent category</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100/50 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <Card className="border-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50">
            <CardTitle>All Categories</CardTitle>
            <CardDescription>Manage your recipe categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 text-orange-600 mx-auto">
                  <Loader2 className="h-8 w-8" />
                </div>
                <p className="text-slate-600 mt-2">Loading categories...</p>
              </div>
            ) : (
              <div className="rounded-md border border-orange-200">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-orange-200 bg-orange-50/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-orange-900">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-orange-900">
                        Description
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-orange-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr
                        key={category._id}
                        className="border-b border-orange-100 hover:bg-orange-50/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: category.bgColor || "#FFF7ED",
                                color: category.color || "#EA580C",
                              }}
                            >
                              <i
                                className={`fas fa-${
                                  category.icon || "utensils"
                                }`}
                              ></i>
                            </div>
                            <span className="font-medium text-slate-900">
                              {category.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {category.description}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                              disabled={isSubmitting}
                              className="hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category._id)}
                              disabled={isSubmitting}
                              className="hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && categories.length === 0 && (
              <div className="text-center py-12">
                <Plus className="h-12 w-12 text-orange-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">
                  No Categories Found
                </h3>
                <p className="text-slate-600">
                  Get started by creating your first category
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <CategoryDialog
          category={editingCategory}
          onSuccess={handleSuccess}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </AdminLayout>
  );
}
