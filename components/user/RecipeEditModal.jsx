import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { recipeAPI, categoryAPI } from "@/lib/api";
import {
  ChefHat,
  Clock,
  Users,
  Utensils,
  BookOpen,
  Settings,
  Plus,
  X,
  Save,
  Image as ImageIcon,
  Video,
  Loader2,
} from "lucide-react";

export default function RecipeEditModal({ recipe, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: "easy",
    category: "",
    hasVideo: false,
    videoUrl: "",
    ingredients: [""],
    equipment: [""],
    instructions: [{ step: 1, description: "" }],
    status: "draft",
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || "",
        description: recipe.description || "",
        image: recipe.image || "",
        prepTime: recipe.preparationTime || 0,
        cookTime: recipe.cookingTime || 0,
        servings: recipe.servings || 1,
        difficulty: recipe.difficulty?.toLowerCase() || "easy",
        category: recipe.category?._id || recipe.category || "",
        hasVideo: recipe.hasVideo || false,
        videoUrl: recipe.videoUrl || "",
        ingredients: recipe.ingredients?.length
          ? [...recipe.ingredients]
          : [""],
        equipment: recipe.equipment?.length ? [...recipe.equipment] : [""],
        instructions: recipe.instructions?.length
          ? recipe.instructions.map((instruction, index) => ({
              step: index + 1,
              description:
                typeof instruction === "string"
                  ? instruction
                  : instruction.description,
            }))
          : [{ step: 1, description: "" }],
        status: recipe.status || "draft",
      });
    }
  }, [recipe]);

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ""],
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const handleEquipmentChange = (index, value) => {
    const newEquipment = [...formData.equipment];
    newEquipment[index] = value;
    setFormData({
      ...formData,
      equipment: newEquipment,
    });
  };

  const addEquipment = () => {
    setFormData({
      ...formData,
      equipment: [...formData.equipment, ""],
    });
  };

  const removeEquipment = (index) => {
    const newEquipment = [...formData.equipment];
    newEquipment.splice(index, 1);
    setFormData({
      ...formData,
      equipment: newEquipment,
    });
  };

  const handleInstructionChange = (index, field, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = {
      ...newInstructions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      instructions: newInstructions,
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [
        ...formData.instructions,
        { step: formData.instructions.length + 1, description: "" },
      ],
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
      instructions: newInstructions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty ingredients and equipment
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter((item) => item.trim() !== ""),
        equipment: formData.equipment.filter((item) => item.trim() !== ""),
        instructions: formData.instructions
          .filter((item) => item.description.trim() !== "")
          .map((item) => item.description),
      };

      // Ensure numeric fields are numbers, not strings
      cleanedData.preparationTime = Number(cleanedData.prepTime);
      cleanedData.cookingTime = Number(cleanedData.cookTime);
      cleanedData.servings = Number(cleanedData.servings);

      // Ensure boolean fields are booleans
      cleanedData.hasVideo = Boolean(cleanedData.hasVideo);

      // Ensure category is properly formatted
      if (!cleanedData.category) {
        throw new Error("Category is required");
      }

      // Format category as a string ID
      cleanedData.category =
        typeof cleanedData.category === "string"
          ? cleanedData.category
          : cleanedData.category._id;

      if (recipe?._id) {
        // Update existing recipe
        console.log("Updating recipe with ID:", recipe._id);
        console.log("Update data:", cleanedData);
        const response = await recipeAPI.update(recipe._id, cleanedData);
        console.log("Update response:", response);
        toast.success("Recipe updated successfully");
        onSave(response.data);
        onClose();
      } else {
        // Create new recipe
        console.log("Creating new recipe with data:", cleanedData);
        const response = await recipeAPI.create(cleanedData);
        console.log("Create response:", response);
        toast.success("Recipe created successfully");
        onSave(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error(
        error.response?.data?.message || error.message || "Error saving recipe"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white ">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-amber-600" />
            {recipe?._id ? "Edit Recipe" : "Create New Recipe"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-amber-100/50">
              <TabsTrigger
                value="basic"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="ingredients"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                <Utensils className="h-4 w-4 mr-2" />
                Ingredients
              </TabsTrigger>
              <TabsTrigger
                value="instructions"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Instructions
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="basic"
              className="space-y-4 p-4 bg-white rounded-lg shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-amber-900">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-amber-900">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                    required
                  >
                    <SelectTrigger className="border-amber-200 focus:ring-amber-500">
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
                  <Label
                    htmlFor="image"
                    className="text-amber-900 flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4 text-amber-600" />
                    Image URL
                  </Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      handleSelectChange("difficulty", value)
                    }
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
                  <Label
                    htmlFor="prepTime"
                    className="text-amber-900 flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-amber-600" />
                    Prep Time (minutes)
                  </Label>
                  <Input
                    id="prepTime"
                    name="prepTime"
                    type="number"
                    min="0"
                    value={formData.prepTime}
                    onChange={handleNumberChange}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="cookTime"
                    className="text-amber-900 flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-amber-600" />
                    Cook Time (minutes)
                  </Label>
                  <Input
                    id="cookTime"
                    name="cookTime"
                    type="number"
                    min="0"
                    value={formData.cookTime}
                    onChange={handleNumberChange}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
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
                        setFormData({ ...formData, hasVideo: checked })
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
                <Label htmlFor="description" className="text-amber-900">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </TabsContent>

            <TabsContent
              value="ingredients"
              className="space-y-4 p-4 bg-white rounded-lg shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-amber-600" />
                    Ingredients
                  </h3>
                  <Button
                    type="button"
                    onClick={addIngredient}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>

                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) =>
                        handleIngredientChange(index, e.target.value)
                      }
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

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-amber-600" />
                    Equipment
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEquipment}
                  >
                    Add Equipment
                  </Button>
                </div>

                {formData.equipment.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) =>
                        handleEquipmentChange(index, e.target.value)
                      }
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

            <TabsContent
              value="instructions"
              className="space-y-4 p-4 bg-white rounded-lg shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-amber-600" />
                    Instructions
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInstruction}
                  >
                    Add Step
                  </Button>
                </div>

                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                      {instruction.step}
                    </div>
                    <Textarea
                      value={instruction.description}
                      onChange={(e) =>
                        handleInstructionChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Enter instruction step"
                      className="flex-1"
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
            </TabsContent>

            <TabsContent
              value="settings"
              className="space-y-4 p-4 bg-white rounded-lg shadow-sm"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {recipe?._id ? "Update Recipe" : "Create Recipe"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
