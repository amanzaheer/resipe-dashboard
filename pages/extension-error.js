import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

export default function ExtensionError() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Browser Extension Error</h1>
        <p className="text-lg text-gray-600 mb-8">
          We detected an issue with a browser extension that's causing problems with our application.
        </p>
        <div className="space-y-4">
          <Button onClick={() => router.push('/login')} className="w-full">
            Try Login Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Refresh Page
          </Button>
          <div className="bg-yellow-50 p-4 rounded-md text-left text-sm text-yellow-800 mt-4">
            <h3 className="font-medium mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Try disabling the MetaMask or similar Web3 extension</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try using a different browser</li>
              <li>If you need the extension, try using it in a separate window</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 