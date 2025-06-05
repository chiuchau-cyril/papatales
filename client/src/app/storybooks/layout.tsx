"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function StorybooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser && !token) {
      router.replace('/login?redirect=/storybooks');
    }
  }, [currentUser, isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-xl">
          <p className="text-lg font-semibold text-indigo-700">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (currentUser && token) {
    return <>{children}</>;
  }

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-xl">
          <p className="text-lg font-semibold text-gray-700">Redirecting to login...</p>
        </div>
      </div>
  );
}
