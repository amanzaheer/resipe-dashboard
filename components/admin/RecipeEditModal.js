import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { recipeAPI, categoryAPI, uploadAPI } from '@/lib/api';

export default function RecipeEditModal({ recipe, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    category: '',
    hasVideo: false,
    videoUrl: '',
    ingredients: [''],
    equipment: [''],
    instructions: [{ step: 1, description: '' }],
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        image: recipe.image || '',
        prepTime: recipe.preparationTime || 0,
        cookTime: recipe.cookingTime || 0,
        servings: recipe.servings || 1,
        difficulty: recipe.difficulty?.toLowerCase() || 'easy',
        category: recipe.category?._id || recipe.category || '',
        hasVideo: recipe.hasVideo || false,
        videoUrl: recipe.videoUrl || '',
        ingredients: recipe.ingredients?.length ? [...recipe.ingredients] : [''],
        equipment: recipe.equipment?.length ? [...recipe.equipment] : [''],
        instructions: recipe.instructions?.length 
          ? recipe.instructions.map((instruction, index) => ({
              step: index + 1,
              description: typeof instruction === 'string' ? instruction : instruction.description
            }))
          : [{ step: 1, description: '' }],
        status: recipe.status || 'draft'
      });
      if (recipe.image) {
        setImagePreview(recipe.image);
      }
    }
  }, [recipe]);

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories');
      }
    };
    
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, '']
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  const handleEquipmentChange = (index, value) => {
    const newEquipment = [...formData.equipment];
    newEquipment[index] = value;
    setFormData({
      ...formData,
      equipment: newEquipment
    });
  };

  const addEquipment = () => {
    setFormData({
      ...formData,
      equipment: [...formData.equipment, '']
    });
  };

  const removeEquipment = (index) => {
    const newEquipment = [...formData.equipment];
    newEquipment.splice(index, 1);
    setFormData({
      ...formData,
      equipment: newEquipment
    });
  };

  const handleInstructionChange = (index, field, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = {
      ...newInstructions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [
        ...formData.instructions, 
        { step: formData.instructions.length + 1, description: '' }
      ]
    });
  };

  const removeInstruction = (index) => {
    const newInstructions = [...formData.instructions];
    newInstructions.splice(index, 1);
    // Reorder steps
    newInstructions.forEach((instruction, i) => {
      instruction.step = i + 1;
    });
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Log file details for debugging
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const response = await uploadAPI.uploadImage(file);
      console.log('Upload response:', response);
      
      if (response?.data?.success) {
        setFormData(prev => ({
          ...prev,
          image: response.data.file.path
        }));
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Failed to upload image: Invalid response format');
      }
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast.error(error.response?.data?.error || error.message || 'Failed to upload image');
      setImageFile(null);
      setImagePreview('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if we have an image file that hasn't been uploaded yet
      if (imageFile && !formData.image) {
        // Create FormData object
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Log the request for debugging
        console.log('Uploading image in submit:', imageFile);
        
        const response = await uploadAPI.uploadImage(imageFile);
        
        if (response && response.data && response.data.success) {
          // Update formData with the uploaded image path
          setFormData(prev => ({
            ...prev,
            image: response.data.file.path
          }));
          
          // Use the uploaded image path for submission
          formData.image = response.data.file.path;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Clean and format the data
      const cleanedData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image,
        preparationTime: Number(formData.prepTime),
        cookingTime: Number(formData.cookTime),
        servings: Number(formData.servings),
        difficulty: formData.difficulty.toLowerCase(),
        category: formData.category,
        hasVideo: formData.hasVideo,
        videoUrl: formData.videoUrl,
        ingredients: formData.ingredients.filter(ing => ing.trim()),
        equipment: formData.equipment.filter(equip => equip.trim()),
        instructions: formData.instructions
          .filter(inst => inst.description.trim())
          .map(inst => inst.description.trim()),
        status: formData.status
      };

      // Validate required fields
      if (!cleanedData.title) throw new Error('Title is required');
      if (!cleanedData.description) throw new Error('Description is required');
      if (!cleanedData.image) throw new Error('Image is required');
      if (!cleanedData.category) throw new Error('Category is required');
      if (cleanedData.ingredients.length === 0) throw new Error('At least one ingredient is required');
      if (cleanedData.instructions.length === 0) throw new Error('At least one instruction is required');
      if (cleanedData.hasVideo && !cleanedData.videoUrl) throw new Error('Video URL is required when video is enabled');

      console.log('Submitting recipe data:', cleanedData);

      let response;
      if (recipe) {
        response = await recipeAPI.update(recipe._id, cleanedData);
      } else {
        response = await recipeAPI.create(cleanedData);
      }

      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error(error.response?.data?.message || error.message || 'Error saving recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe?._id ? 'Edit Recipe' : 'Create New Recipe'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                    required
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
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleSelectChange('difficulty', value)}
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
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    name="prepTime"
                    type="number"
                    min="0"
                    value={formData.prepTime}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                  <Input
                    id="cookTime"
                    name="cookTime"
                    type="number"
                    min="0"
                    value={formData.cookTime}
                    onChange={handleNumberChange}
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
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hasVideo">Has Video</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasVideo"
                      name="hasVideo"
                      checked={formData.hasVideo}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, hasVideo: checked})
                      }
                    />
                    <Label htmlFor="hasVideo">Include video</Label>
                  </div>
                </div>
              </div>
              
              {formData.hasVideo && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
            </TabsContent>
            
            <TabsContent value="ingredients" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Ingredients</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                    Add Ingredient
                  </Button>
                </div>
                
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      placeholder="Enter ingredient"
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
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Equipment</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addEquipment}>
                    Add Equipment
                  </Button>
                </div>
                
                {formData.equipment.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleEquipmentChange(index, e.target.value)}
                      placeholder="Enter equipment"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeEquipment(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Instructions</h3>
                <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                  Add Step
                </Button>
              </div>
              
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                      {instruction.step}
                    </span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeInstruction(index)}
                    >
                      ×
                    </Button>
                  </div>
                  <Textarea
                    value={instruction.description}
                    onChange={(e) => handleInstructionChange(index, 'description', e.target.value)}
                    placeholder="Enter instruction step"
                    rows={2}
                  />
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Recipe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 