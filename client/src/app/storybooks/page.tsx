"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoryResponse, UserService } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';

export default function StorybooksPage() {
  const { token }  = useAuth();
  const [storybooks, setStorybooks] = useState<StoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorybooks = async () => {
      if (!token) {
        setIsLoading(false);
        setError("Authentication token is missing. Please login again.");
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const response = await UserService.getUserStoriesUserStoriesGet();
        setStorybooks(response || []);
      } catch (err: any) {
        console.error("Failed to fetch storybooks:", err);
        setError(err.body?.detail || err.message || "Failed to load your storybooks.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
        fetchStorybooks();
    } else {
        setIsLoading(false);
    }
  }, [token]);

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center text-gray-700">Loading your storybooks...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-600 bg-red-100 p-4 rounded-md">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 sm:mb-0">My Storybooks</h1>
        <Link href="/storybooks/new" legacyBehavior>
          <a className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out">
            + Create New Storybook
          </a>
        </Link>
      </div>

      {storybooks.length === 0 ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h2 className="mt-2 text-xl font-medium text-gray-900">No storybooks yet!</h2>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first magical tale.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {storybooks.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-3 text-indigo-700">{book.title || 'Untitled Storybook'}</h2>
                <p className="text-gray-600 mb-2 text-sm line-clamp-3"><strong>Theme:</strong> {book.theme || 'Not specified'}</p>
                <p className="text-gray-500 mb-2 text-sm"><strong>Status:</strong> <span className="font-medium capitalize">{book.status || 'N/A'}</span></p>
                <p className="text-gray-500 mb-4 text-xs"><strong>Last Updated:</strong> {book.updated_at ? new Date(book.updated_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <Link href={`/storybooks/${book.id || 'error-no-id'}`} legacyBehavior>
                <a className="mt-auto inline-block text-center w-full px-4 py-2 bg-indigo-500 text-white font-medium rounded-md hover:bg-indigo-600 transition duration-150 ease-in-out">
                  View Details &rarr;
                </a>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
