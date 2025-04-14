import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { data } = await authAPI.getCurrentUser();
          setUser(data);
          
          // If we're on the homepage, redirect based on role
          if (router.pathname === '/') {
            if (data && data.role === 'admin') {
              router.push('/admin/dashboard');
            } else {
              router.push('/dashboard');
            }
          }
        } else if (router.pathname === '/') {
          // If no token and on homepage, redirect to login
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        // Only remove token if it's an authentication error
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
          
          // If we're on a protected route, redirect to login
          if (router.pathname.startsWith('/admin') || router.pathname === '/dashboard') {
            router.push('/login');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, [router]);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      router.push('/dashboard');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      console.log('AuthContext: Attempting login with credentials:', { email: credentials.email });
      
      const { data } = await authAPI.login(credentials);
      console.log('AuthContext: Login API response:', data);
      
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      // Redirect based on user role
      if (data.user && data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      
      return { success: true, user: data.user };
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await authAPI.updateProfile(userData);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await authAPI.changePassword(passwordData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 