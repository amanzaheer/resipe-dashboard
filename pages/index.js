import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Check if the user has successfully logged in using the safe login page
    const loginSuccess = sessionStorage.getItem('loginSuccess') === 'true';
    
    // If user is not logged in, redirect to safe login page
    if (!user && !loginSuccess) {
      router.push('/login-safe');
      return;
    }

    // If user is logged in, redirect based on role
    if (user) {
      if (isAdmin()) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router, isAdmin]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Recipe Dashboard</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting you to the dashboard...</p>
      </div>
    </div>
  );
} 