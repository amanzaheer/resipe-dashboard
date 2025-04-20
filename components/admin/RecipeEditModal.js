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
import { recipeAPI, categoryAPI, uploadAPI } from "@/lib/api";

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setLoading(true);

      // Create preview immediately
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file);

      // Create FormData
      const formData = new FormData();
      formData.append("image", file);

      const response = await uploadAPI.uploadImage(formData);

      if (response?.data?.data?.url) {
        setFormData((prev) => ({
          ...prev,
          image: response.data.data.url,
        }));
        toast.success("Image uploaded successfully");
      } else {
        throw new Error("Invalid upload response");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      // Don't clear preview immediately to allow retry
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle image upload if there's a new image file
      if (imageFile && !formData.image) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await uploadAPI.uploadImage(formData);

        if (!uploadResponse?.data?.url) {
          throw new Error("Failed to upload image");
        }

        setFormData((prev) => ({
          ...prev,
          image: uploadResponse.data.url,
        }));
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
        ingredients: formData.ingredients.filter((ing) => ing.trim()),
        equipment: formData.equipment.filter((equip) => equip.trim()),
        instructions: formData.instructions
          .filter((inst) => inst.description.trim())
          .map((inst) => inst.description.trim()),
        status: formData.status,
      };

      // Validate required fields
      if (!cleanedData.title) throw new Error("Title is required");
      if (!cleanedData.description) throw new Error("Description is required");
      if (!cleanedData.image) throw new Error("Image is required");
      if (!cleanedData.category) throw new Error("Category is required");
      if (cleanedData.ingredients.length === 0)
        throw new Error("At least one ingredient is required");
      if (cleanedData.instructions.length === 0)
        throw new Error("At least one instruction is required");
      if (cleanedData.hasVideo && !cleanedData.videoUrl)
        throw new Error("Video URL is required when video is enabled");

      console.log("Submitting recipe data:", cleanedData);

      let response;
      if (recipe) {
        response = await recipeAPI.update(recipe._id, cleanedData);
      } else {
        response = await recipeAPI.create(cleanedData);
      }

      toast.success(
        recipe ? "Recipe updated successfully" : "Recipe created successfully"
      );
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error(error.message || "Failed to save recipe");
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="p-6 bg-gradient-to-r from-orange-50 via-amber-100/50 to-orange-50 border-b border-orange-100">
          <DialogTitle className="text-2xl font-semibold text-orange-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-orange-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            {recipe?._id ? "Edit Recipe" : "Create New Recipe"}
          </DialogTitle>
          <p className="text-orange-600/80 mt-1">
            {recipe?._id
              ? "Update your recipe details"
              : "Create a delicious new recipe"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-orange-50/50 p-1 rounded-lg">
              {["basic", "ingredients", "instructions", "settings"].map(
                (tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-orange-600 data-[state=active]:text-white px-4 py-2 rounded-md capitalize"
                  >
                    {tab}
                  </TabsTrigger>
                )
              )}
            </TabsList>

            <div className="mt-6 bg-orange-50/30 rounded-lg p-6">
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-orange-900 font-medium"
                    >
                      Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="border-orange-200 focus:ring-orange-500 focus:border-orange-500 bg-white"
                      placeholder="Enter recipe title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleSelectChange("category", value)
                      }
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
                    <Label
                      htmlFor="image"
                      className="text-orange-900 font-medium"
                    >
                      Recipe Image
                    </Label>
                    <div className="space-y-3">
                      {imagePreview && (
                        <div className="relative w-32 h-32 group">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg border border-orange-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview("");
                                setImageFile(null);
                                setFormData((prev) => ({ ...prev, image: "" }));
                              }}
                              className="text-white hover:text-red-400"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="border-orange-200 focus:ring-orange-500 focus:border-orange-500 bg-white"
                          required={!formData.image}
                        />
                        {loading && (
                          <div className="animate-spin text-orange-600">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {!formData.image && !imageFile && (
                        <p className="text-sm text-orange-600">
                          Please upload a recipe image (JPEG, PNG, or WebP, max
                          5MB)
                        </p>
                      )}
                    </div>
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

              <TabsContent value="ingredients" className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-orange-900">
                      Ingredients
                    </h3>
                    <Button
                      type="button"
                      onClick={addIngredient}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Add Ingredient
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={ingredient}
                          onChange={(e) =>
                            handleIngredientChange(index, e.target.value)
                          }
                          className="border-orange-200 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Enter ingredient"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeIngredient(index)}
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Equipment</h3>
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

              <TabsContent value="instructions" className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-orange-900">
                      Instructions
                    </h3>
                    <Button
                      type="button"
                      onClick={addInstruction}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Add Step
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                            {instruction.step}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeInstruction(index)}
                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                          >
                            ×
                          </Button>
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
                          className="border-orange-200 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Describe this step"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
                  <div className="space-y-4">
                    <Label className="text-orange-900 font-medium">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger className="border-orange-200 focus:ring-orange-500 focus:border-orange-500">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="flex gap-2 pt-4 border-t border-orange-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-orange-100/50 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    {/* ... spinner SVG ... */}
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Recipe"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
