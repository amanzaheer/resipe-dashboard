import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { recipeAPI, uploadAPI, categoryAPI } from '../../../lib/api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RecipeForm() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { action, id } = router.query;
  const isEdit = action === 'edit';
  const isNew = action === 'new';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    preparationTime: '',
    cookingTime: '',
    servings: '',
    difficulty: 'medium',
    ingredients: [''],
    instructions: [''],
    category: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameExists, setNameExists] = useState(false);

  useEffect(() => {
    console.log('useEffect triggered with:', { user, isEdit, id });
    if (!user) {
      router.push('/login');
    } else if (!isAdmin()) {
      router.push('/');
    } else {
      fetchCategories();
      if (isEdit && id) {
        console.log('Calling fetchRecipe from useEffect');
        fetchRecipe();
      }
    }
  }, [user, router, id, isEdit]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryAPI.getAll();
      if (response && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchRecipe = async () => {
    try {
      console.log('Fetching recipe with ID:', id);
      setLoading(true);
      const response = await recipeAPI.getRecipeById(id);
      
      console.log('Recipe data received:', response.data);
      
      if (response && response.data) {
        const recipe = response.data;
        setFormData({
          title: recipe.title || '',
          description: recipe.description || '',
          image: recipe.image || '',
          preparationTime: recipe.preparationTime || '',
          cookingTime: recipe.cookingTime || '',
          servings: recipe.servings || '',
          difficulty: recipe.difficulty || 'medium',
          ingredients: recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : [''],
          instructions: recipe.instructions && recipe.instructions.length > 0 ? recipe.instructions : [''],
          category: recipe.category || '',
        });
        setImagePreview(recipe.image || '');
        console.log('Form data set:', recipe);
      } else {
        throw new Error('Invalid recipe data');
      }
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError('Failed to fetch recipe');
      toast.error('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check for duplicate recipe name when title changes
    if (name === 'title' && !isEdit && value) {
      checkRecipeName(value);
    }
  };

  const checkRecipeName = async (title) => {
    try {
      setIsCheckingName(true);
      const response = await recipeAPI.getAll({ title });
      const exists = response && response.data && response.data.length > 0;
      
      if (exists) {
        setNameExists(true);
        setError('A recipe with this name already exists. Please choose a different name.');
      } else {
        setNameExists(false);
        setError('');
      }
    } catch (err) {
      console.error('Error checking recipe name:', err);
    } finally {
      setIsCheckingName(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      const response = await uploadAPI.uploadImage(file);
      
      if (response && response.data && response.data.success) {
        setFormData(prev => ({
          ...prev,
          image: response.data.file.path
        }));
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      setImageFile(null);
      setImagePreview('');
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const validateRecipeName = async (title) => {
    if (!title || isEdit) return true;
    
    try {
      const response = await recipeAPI.getAll({ title });
      return !(response && response.data && response.data.length > 0);
    } catch (err) {
      console.error('Error validating recipe name:', err);
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't submit if name exists
    if (nameExists) {
      toast.error('A recipe with this name already exists. Please choose a different name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate recipe name
      const isNameValid = await validateRecipeName(formData.title);
      if (!isNameValid) {
        setError('A recipe with this name already exists. Please choose a different name.');
        toast.error('A recipe with this name already exists. Please choose a different name.');
        setLoading(false);
        return;
      }

      // Check if image is required and not provided
      if (!formData.image && !imageFile) {
        setError('Recipe image is required');
        setLoading(false);
        return;
      }

      // Upload image if a new file was selected
      let imagePath = formData.image;
      if (imageFile) {
        const response = await uploadAPI.uploadImage(imageFile);
        
        if (response && response.data && response.data.success) {
          imagePath = response.data.file.path;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Prepare recipe data with proper ingredients structure
      const recipeData = {
        ...formData,
        image: imagePath,
        // Ensure ingredients are strings, not objects
        ingredients: formData.ingredients.map(ing => {
          // If ing is already a string, use it directly
          if (typeof ing === 'string') return ing;
          // If ing is an object, convert it to a string
          if (typeof ing === 'object') {
            // If it has a text property, use that
            if (ing.text) return ing.text;
            // Otherwise, try to convert the object to a string
            return Object.values(ing).filter(val => val !== null).join(' ');
          }
          // Default fallback
          return '';
        }).filter(ing => ing.trim() !== '')
      };

      if (action === 'edit') {
        await recipeAPI.update(id, recipeData);
        toast.success('Recipe updated successfully');
      } else {
        await recipeAPI.create(recipeData);
        toast.success('Recipe created successfully');
      }

      router.push('/admin/recipes');
    } catch (error) {
      console.error('Submit error:', error);
      
      // Check for duplicate recipe name error
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data?.message || error.response.data?.error || '';
        
        if (errorMessage.toLowerCase().includes('duplicate') || 
            errorMessage.toLowerCase().includes('already exists') ||
            errorMessage.toLowerCase().includes('unique')) {
          setError('A recipe with this name already exists. Please choose a different name.');
          toast.error('A recipe with this name already exists. Please choose a different name.');
        } else {
          setError(errorMessage || 'Failed to save recipe');
          toast.error(errorMessage || 'Failed to save recipe');
        }
      } else {
        setError(error.message || 'Failed to save recipe');
        toast.error(error.message || 'Failed to save recipe');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/recipes">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Back to Recipes
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Recipe' : 'Add New Recipe'}</CardTitle>
            <CardDescription>
              {isEdit ? 'Update the recipe details below' : 'Fill in the recipe details below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEdit && loading ? (
              <div className="flex justify-center items-center py-8">
                <p>Loading recipe data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Recipe Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!formData.image}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>
                  )}
                  {!formData.image && !imageFile && (
                    <p className="text-sm text-red-500">Image is required</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preparationTime">Preparation Time (min)</Label>
                    <Input
                      id="preparationTime"
                      name="preparationTime"
                      type="number"
                      min="0"
                      value={formData.preparationTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cookingTime">Cooking Time (min)</Label>
                    <Input
                      id="cookingTime"
                      name="cookingTime"
                      type="number"
                      min="0"
                      value={formData.cookingTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      name="servings"
                      type="number"
                      min="1"
                      value={formData.servings}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Ingredients</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                      Add Ingredient
                    </Button>
                  </div>
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        placeholder={`Ingredient ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Instructions</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                      Add Step
                    </Button>
                  </div>
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={instruction}
                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                        placeholder={`Step ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeInstruction(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.push('/admin/recipes')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : isEdit ? 'Update Recipe' : 'Create Recipe'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 