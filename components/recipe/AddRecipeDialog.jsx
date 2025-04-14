import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { recipeAPI, uploadAPI, categoryAPI } from '../../lib/api';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AddRecipeDialog({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    preparationTime: '',
    cookingTime: '',
    servings: '',
    difficulty: '',
    ingredients: [''],
    instructions: ['']
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadResponse = await uploadAPI.uploadImage(formData);
        imageUrl = uploadResponse.data.url;
      }

      const recipeData = {
        ...formData,
        image: imageUrl,
        preparationTime: parseInt(formData.preparationTime),
        cookingTime: parseInt(formData.cookingTime),
        servings: parseInt(formData.servings),
        ingredients: formData.ingredients.filter(item => item.trim() !== ''),
        instructions: formData.instructions.filter(item => item.trim() !== '')
      };

      await recipeAPI.create(recipeData);
      toast.success('Recipe created successfully');
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        preparationTime: '',
        cookingTime: '',
        servings: '',
        difficulty: '',
        ingredients: [''],
        instructions: ['']
      });
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      console.error('Error creating recipe:', err);
      setError(err.response?.data?.message || 'Failed to create recipe');
      toast.error(err.response?.data?.message || 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Add Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Recipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 relative h-40 w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="preparationTime">Prep Time (min)</Label>
                <Input
                  id="preparationTime"
                  name="preparationTime"
                  type="number"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cookingTime">Cook Time (min)</Label>
                <Input
                  id="cookingTime"
                  name="cookingTime"
                  type="number"
                  value={formData.cookingTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  name="servings"
                  type="number"
                  value={formData.servings}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Ingredients</Label>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleArrayInputChange(index, e.target.value, 'ingredients')}
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeArrayItem(index, 'ingredients')}
                    disabled={formData.ingredients.length === 1}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('ingredients')}
                className="mt-2"
              >
                Add Ingredient
              </Button>
            </div>

            <div>
              <Label>Instructions</Label>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Textarea
                    value={instruction}
                    onChange={(e) => handleArrayInputChange(index, e.target.value, 'instructions')}
                    placeholder={`Step ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeArrayItem(index, 'instructions')}
                    disabled={formData.instructions.length === 1}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('instructions')}
                className="mt-2"
              >
                Add Step
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Recipe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 