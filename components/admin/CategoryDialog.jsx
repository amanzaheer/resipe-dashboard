import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { categoryAPI } from "../../lib/api";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";

export default function CategoryDialog({
  category,
  onSuccess,
  open,
  onOpenChange,
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "utensils",
    color: "#4F46E5",
    bgColor: "#EEF2FF",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        icon: category.icon || "utensils",
        color: category.color || "#4F46E5",
        bgColor: category.bgColor || "#EEF2FF",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        icon: "utensils",
        color: "#4F46E5",
        bgColor: "#EEF2FF",
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category) {
        await categoryAPI.update(category._id, formData);
        toast.success("Category updated successfully");
      } else {
        await categoryAPI.create(formData);
        toast.success("Category created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error saving category:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Authentication required. Please log in again.");
        window.location.href = "/login";
      } else if (
        err.response?.status === 400 &&
        err.response?.data?.message === "Category already exists"
      ) {
        toast.error(
          "A category with this name already exists. Please choose a different name."
        );
      } else {
        toast.error(err.response?.data?.message || "Failed to save category");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setLoading(true);
    try {
      await categoryAPI.delete(category._id);
      toast.success("Category deleted successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-gradient-to-r from-orange-50 via-amber-100/50 to-orange-50 border-b border-orange-100">
          <DialogTitle className="text-2xl font-semibold text-orange-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <i className={`fas fa-${formData.icon || 'utensils'}`} style={{ color: formData.color }}></i>
            </div>
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <p className="text-orange-600/80 mt-1">
            {category ? "Update category details" : "Create a new category for your recipes"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Category Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-slate-200 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-slate-200 focus:ring-orange-500 focus:border-orange-500 min-h-[100px]"
                placeholder="Describe your category"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon" className="text-sm font-medium text-slate-700">
                  Icon Name
                </Label>
                <div className="relative">
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="border-slate-200 focus:ring-orange-500 focus:border-orange-500 pl-10"
                    placeholder="e.g., utensils"
                    required
                  />
                  <i className={`fas fa-${formData.icon || 'utensils'} absolute left-3 top-1/2 -translate-y-1/2`}
                     style={{ color: formData.color }}></i>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color" className="text-sm font-medium text-slate-700">
                  Icon Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 p-1 border-slate-200 rounded-md cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bgColor" className="text-sm font-medium text-slate-700">
                Background Color
              </Label>
              <div className="relative">
                <Input
                  id="bgColor"
                  type="color"
                  value={formData.bgColor}
                  onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                  className="w-full h-10 p-1 border-slate-200 rounded-md cursor-pointer"
                  required
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-slate-200"
                  style={{ backgroundColor: formData.bgColor }}
                ></div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            {category && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 hover:bg-red-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {category ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
