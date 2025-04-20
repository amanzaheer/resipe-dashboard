import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found. Some API requests may fail.');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration and authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network error occurred. Please check if the server is running.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getCurrentUser: () => api.get('/api/auth/me'),
  updateProfile: (userData) => api.put('/api/auth/profile', userData),
  changePassword: (passwordData) => api.put('/api/auth/change-password', passwordData),
};

// Recipe API
export const recipeAPI = {
  getAll: (params) => api.get('/api/recipes', { params }),
  getBySlug: (slug) => api.get(`/api/recipes/${slug}`),
  getRecipeById: (id) => api.get(`/api/recipes/id/${id}`),
  create: (recipeData) => api.post('/api/recipes', recipeData),
  update: (id, recipeData) => {
    console.log(`Updating recipe ${id} with data:`, recipeData);
    return api.put(`/api/recipes/${id}`, recipeData)
      .then(response => {
        console.log('Update successful:', response);
        return response;
      })
      .catch(error => {
        console.error('Update failed:', error);
        throw error;
      });
  },
  delete: async (id) => {
    try {
      // Try using the standard DELETE endpoint
      const response = await api.delete(`/api/recipes/${id}`);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      
      // If delete fails with 500 error, try soft delete
      if (error.response?.status === 500) {
        try {
          // Try soft delete by updating status
          const softDeleteResponse = await api.put(`/api/recipes/${id}`, {
            isDeleted: true,
            status: 'deleted',
            deletedAt: new Date().toISOString()
          });
          
          return {
            status: 200,
            data: {
              success: true,
              message: 'Recipe marked as deleted',
              softDelete: true
            }
          };
        } catch (softDeleteError) {
          console.error('Soft delete failed:', softDeleteError);
          throw softDeleteError;
        }
      }
      
      // For other errors, just rethrow
      throw error;
    }
  },
  addReview: (id, reviewData) => api.post(`/api/recipes/${id}/reviews`, reviewData),
  getByCategory: (categoryId) => api.get(`/api/categories/${categoryId}/recipes`),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => api.get('/api/favorites'),
  add: (recipeId) => {
    console.log('Adding recipe to favorites with ID:', recipeId);
    return api.post(`/api/favorites/${recipeId}`, {})  // Changed to URL parameter format
      .then(response => {
        console.log('Add to favorites response:', response);
        return response;
      })
      .catch(error => {
        console.error('Add to favorites error:', error);
        // If the first attempt fails, try alternative endpoint
        if (error.response?.status === 404) {
          console.log('Trying alternative endpoint for adding favorite');
          return api.post('/api/favorites', { recipe: recipeId }); // Try with recipe in body
        }
        throw error;
      });
  },
  remove: (recipeId) => {
    console.log('Removing recipe from favorites with ID:', recipeId);
    return api.delete(`/api/favorites/${recipeId}`)
      .then(response => {
        console.log('Remove from favorites response:', response);
        return response;
      })
      .catch(error => {
        console.error('Remove from favorites error:', error);
        throw error;
      });
  },
  check: (recipeId) => api.get(`/api/favorites/check/${recipeId}`),
  addFavorite: (recipeId) => favoritesAPI.add(recipeId),
  removeFavorite: (recipeId) => favoritesAPI.remove(recipeId),
  getUserFavorites: () => favoritesAPI.getAll(),
};

// Reviews API
export const reviewsAPI = {
  getAll: () => api.get('/api/reviews'),
  getByRecipe: (recipeId) => api.get(`/api/reviews/recipe/${recipeId}`),
  getByUser: () => api.get('/api/reviews/user'),
  create: (reviewData) => api.post('/api/reviews', reviewData),
  update: (id, reviewData) => api.put(`/api/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/api/reviews/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    // Create FormData object
    const formData = new FormData();
    
    // Append the file with the correct field name 'image'
    formData.append('image', file);
    
    // Log the request for debugging
    console.log('Uploading image:', file);
    
    return api.post('/api/uploads/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (formData) => api.post('/api/uploads/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/api/users'),
  updateUserRole: (userId, role) => api.put(`/api/users/${userId}`, { role }),
  getStats: () => api.get('/api/admin/stats'),
  deleteUser: (userId) => api.delete(`/api/auth/users/${userId}`),
};

export const userAPI = {
  getAll: () => api.get('/api/admin/users'),
  create: (data) => api.post('/api/auth/register', data),
  updateRole: (id, role) => api.put(`/api/admin/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/api/admin/users/${id}`),
};

// Users API (for admin dashboard)
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};

export default api; 