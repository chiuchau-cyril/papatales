"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function GoogleCallbackComponent() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Not directly used for navigation here, AuthContext handles it
  const { handleGoogleCallback, isLoading, error } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      // Call handleGoogleCallback from AuthContext
      // It will attempt to exchange code for token and then navigate or handle errors
      handleGoogleCallback(code, state);
    } else if (!isLoading) { // Only redirect if not loading and params are missing
      console.error("Google callback missing code or state.");
      // router.push('/login?error=google_callback_invalid_params'); // AuthContext redirects on error now
    }
  }, [searchParams, handleGoogleCallback, isLoading, router]); // Added isLoading and router

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">Processing Google Login...</h1>
        <p className="text-gray-600">Please wait while we verify your login.</p>
        {/* Optional: Add a spinner here */}
      </div>
    );
  }

  // If not loading and an error occurred in handleGoogleCallback, it will be in 'error'
  // AuthContext's handleGoogleCallback should redirect to /login with error or home on success.
  // This component might just show a generic message if not redirected.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {error ? (
        <>
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Google Login Failed</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push('/login')} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Return to Login
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">Processing Google Login...</h1>
          <p className="text-gray-600">If you are not redirected automatically, please click below.</p>
           <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Go to Homepage
          </button>
        </>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Google callback...</div>}>
            <GoogleCallbackComponent />
        </Suspense>
    );
}
