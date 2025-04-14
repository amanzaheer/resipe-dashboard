import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

export default function Custom500() {
  const router = useRouter();

  useEffect(() => {
    // Check if the error is from the extension
    const isExtensionError = window.location.href.includes('error=extension');
    
    // If it's not an extension error, redirect to home
    if (!isExtensionError) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">500 - Server Error</h1>
        <p className="text-lg text-gray-600 mb-8">
          We're sorry, but something went wrong. This might be caused by a browser extension.
        </p>
        <div className="space-y-4">
          <Button onClick={() => router.push('/')} className="w-full">
            Go to Homepage
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Try Again
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            If the problem persists, try disabling browser extensions or using a different browser.
          </p>
        </div>
      </div>
    </div>
  );
} 