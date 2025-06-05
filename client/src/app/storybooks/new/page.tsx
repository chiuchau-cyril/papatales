"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
// Assuming StoryService and StoryCreate model are available from generated client
import { StoryService, StoryCreate, StoryResponse } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';

export default function NewStorybookPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Initialize formData based on StoryCreate type.
  // Ensure these fields match your actual StoryCreate model from OpenAPI.
  // Title is required, others are optional and can be null.
  const [formData, setFormData] = useState<StoryCreate>({
    title: '',
    description: null,
    theme: null,
    target_age_group: null,
    genre: null,
    moral_lesson: null,
    // Any other fields required by StoryCreate should be initialized here
    // e.g., if 'user_id' is part of StoryCreate and not set by backend:
    // user_id: currentUser?.id || 0, // This would need currentUser from useAuth()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // For optional fields that are strings but can be null:
      // If value is empty string, set to null, otherwise use the value.
      // This matches common OpenAPI pattern for optional (nullable) strings.
      [name]: (name === 'description' || name === 'theme' || name === 'target_age_group' || name === 'genre' || name === 'moral_lesson')
                ? (value.trim() === '' ? null : value)
                : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Authentication required. Please login.");
      return;
    }
    if (!formData.title || formData.title.trim() === '') { // formData.title should not be null due to type
      setError("Title is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ensure formData conforms to StoryCreate payload expected by the API
      const storyToCreate: StoryCreate = {
          title: formData.title,
          // Only include optional fields if they have a value (not null or empty string after trim)
          // The `handleChange` already sets them to null if empty.
          description: formData.description,
          theme: formData.theme,
          target_age_group: formData.target_age_group,
          genre: formData.genre,
          moral_lesson: formData.moral_lesson,
      };

      const newStory: StoryResponse = await StoryService.createStoryStoryPost({ requestBody: storyToCreate });

      alert('Storybook created successfully!');
      // Redirect to the new story's detail page or the list page
      // router.push(`/storybooks/${newStory.id}`); // If newStory.id is available and you have detail pages
      router.push('/storybooks');
    } catch (err: any) {
      console.error("Failed to create storybook:", err);
      setError(err.body?.detail || err.message || "An unexpected error occurred. Failed to create storybook.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl bg-white shadow-xl rounded-lg mt-8 mb-8">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        Back to Storybooks
      </button>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Create a New Storybook</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., The Little Fox Who Lost His Way"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            id="description"
            rows={4}
            value={formData.description || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="A brief summary of your story..."
          />
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
          <input
            type="text"
            name="theme"
            id="theme"
            value={formData.theme || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Friendship, Courage, Adventure"
          />
        </div>

        <div>
          <label htmlFor="target_age_group" className="block text-sm font-medium text-gray-700 mb-1">Target Age Group</label>
          <input
            type="text"
            name="target_age_group"
            id="target_age_group"
            value={formData.target_age_group || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., 3-5 years, 6-8 years"
          />
        </div>

        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
          <input
            type="text"
            name="genre"
            id="genre"
            value={formData.genre || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Fantasy, Educational, Bedtime Story"
          />
        </div>

        <div>
          <label htmlFor="moral_lesson" className="block text-sm font-medium text-gray-700 mb-1">Moral/Lesson</label>
          <input
            type="text"
            name="moral_lesson"
            id="moral_lesson"
            value={formData.moral_lesson || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., The importance of kindness, Never give up"
          />
        </div>

        {error && <p className="my-3 text-center text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}

        <div className="flex justify-end items-center pt-4 space-x-4 border-t border-gray-200 mt-8">
            <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:opacity-60"
            >
                {isLoading ? 'Creating...' : 'Create Storybook'}
            </button>
        </div>
      </form>
    </div>
  );
}
