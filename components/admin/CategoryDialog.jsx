import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { categoryAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';

export default function CategoryDialog({ category, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'utensils',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
  });

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || 'utensils',
        color: category.color || '#4F46E5',
        bgColor: category.bgColor || '#EEF2FF',
      });
    } else {
      // Reset form data for new category
      setFormData({
        name: '',
        description: '',
        icon: 'utensils',
        color: '#4F46E5',
        bgColor: '#EEF2FF',
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Auth Token:', localStorage.getItem('token'));
    setLoading(true);

    try {
      if (category) {
        console.log('Updating category:', category._id);
        const response = await categoryAPI.update(category._id, formData);
        console.log('Update response:', response);
        toast.success('Category updated successfully');
      } else {
        console.log('Creating new category');
        const response = await categoryAPI.create(formData);
        console.log('Category creation response:', response);
        toast.success('Category created successfully');
      }
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error('Error saving category:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // Handle specific error cases
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Authentication required. Please log in again.');
        // Redirect to login page
        window.location.href = '/login';
      } else if (err.response?.status === 400 && err.response?.data?.message === 'Category already exists') {
        toast.error('A category with this name already exists. Please choose a different name.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save category');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setLoading(true);
    try {
      await categoryAPI.delete(category._id);
      toast.success('Category deleted successfully');
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bgColor">Background Color</Label>
              <Input
                id="bgColor"
                type="color"
                value={formData.bgColor}
                onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            {category && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 