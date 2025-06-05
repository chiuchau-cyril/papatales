"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is complete, and we still don't have a user or a token,
    // then the user is definitely not authenticated.
    if (!isLoading && !currentUser && !token) {
      console.log("DashboardLayout: Not authenticated, redirecting to login.");
      router.replace('/login?redirect=/dashboard'); // Use replace to avoid adding to history
    }
    // If there's a token but no currentUser yet, fetchCurrentUser is likely still running.
    // The isLoading state should cover this.
    // If no token and no user, redirect.
  }, [currentUser, isLoading, token, router]);

  // While AuthContext is loading its state (e.g., checking localStorage, fetching user)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-xl">
          <p className="text-lg font-semibold text-indigo-700">Loading authentication state...</p>
          {/* You could add a spinner here */}
        </div>
      </div>
    );
  }

  // If authentication is resolved and we have a user and token, render the children (dashboard page)
  if (currentUser && token) {
    return <>{children}</>;
  }

  // If not loading, but still no currentUser (even if there might be a token that proved invalid),
  // the redirect effect should handle it. This state should ideally not be reached for long.
  // Showing a generic "Authenticating..." or redirecting message can be a fallback.
  // This also handles the brief moment before the useEffect redirect kicks in.
  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
         <div className="p-6 bg-white rounded-lg shadow-xl">
          <p className="text-lg font-semibold text-gray-700">Authenticating...</p>
          <p className="text-sm text-gray-500">Please wait, redirecting to login if needed.</p>
        </div>
      </div>
  );
}
