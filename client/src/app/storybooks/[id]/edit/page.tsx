"use client";

import React, { useEffect, useState, FormEvent, useCallback } from 'react'; // Added useCallback
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StoryService, StoryResponse, StoryUpdate } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';

export default function EditStorybookPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  // Initialize numericStoryId here and check for NaN early.
  const [numericStoryId, setNumericStoryId] = useState<number | null>(null);

  const [formData, setFormData] = useState<StoryUpdate>({
    title: '',
    description: null,
    theme: null,
    target_age_group: null,
    genre: null,
    moral_lesson: null,
    is_public: false,
  });
  const [originalTitle, setOriginalTitle] = useState(''); // To display in header while title in form changes
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = parseInt(storyId, 10);
    if (isNaN(id)) {
      setError("Invalid Story ID format.");
      setIsLoading(false);
      setNumericStoryId(null); // Explicitly set to null if invalid
      return;
    }
    setNumericStoryId(id);
  }, [storyId]);


  const fetchStorybook = useCallback(async () => {
    if (!numericStoryId || !token) {
      if (!token) setError("Authentication required to load data.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const story = await StoryService.getStoryStoryIdGet({ storyId: numericStoryId });
      setFormData({
        title: story.title || '',
        description: story.description || null,
        theme: story.theme || null,
        target_age_group: story.target_age_group || null,
        genre: story.genre || null,
        moral_lesson: story.moral_lesson || null,
        is_public: story.is_public || false,
      });
      setOriginalTitle(story.title || 'Story'); // For display in heading
    } catch (err: any) {
      console.error("Failed to fetch storybook for editing:", err);
      setError(err.body?.detail || err.message || "Failed to load storybook data.");
    } finally {
      setIsLoading(false);
    }
  }, [numericStoryId, token]);

  useEffect(() => {
    if (numericStoryId) { // Only fetch if numericStoryId is valid
        fetchStorybook();
    }
  }, [numericStoryId, fetchStorybook]); // Depend on numericStoryId

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        // For optional fields, if they are cleared, set to null. Title is required.
        setFormData(prev => ({
          ...prev,
          [name]: (name !== 'title' && value.trim() === '') ? null : value,
        }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!numericStoryId) {
        setError("Story ID is invalid.");
        return;
    }
    if (!token) {
      setError("Authentication required to save changes.");
      return;
    }
    if (!formData.title || formData.title.trim() === '') {
      setError("Title cannot be empty.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await StoryService.updateStoryStoryIdPut({ storyId: numericStoryId, requestBody: formData });
      alert('Storybook updated successfully!');
      router.push(`/storybooks/${numericStoryId}`);
    } catch (err: any) {
      console.error("Failed to update storybook:", err);
      setError(err.body?.detail || err.message || "Failed to update storybook.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center text-lg text-gray-700">Loading storybook for editing...</div>;
  }

  // If numericStoryId is null (due to NaN earlier), show specific error
  if (numericStoryId === null && !isLoading) {
     return <div className="container mx-auto p-8 text-center text-lg text-red-600 bg-red-100 p-4 rounded-md">Error: Invalid Story ID provided.</div>;
  }

  // If there was an error fetching and we don't have a title (meaning data likely didn't load)
  if (error && !originalTitle && !isLoading) {
    return (
        <div className="container mx-auto p-8 text-center">
            <p className="text-lg text-red-600 bg-red-100 p-4 rounded-md">Error: {error}</p>
            <Link href="/storybooks" legacyBehavior>
                <a className="mt-4 text-indigo-600 hover:text-indigo-800 inline-block">&larr; Back to My Storybooks</a>
            </Link>
        </div>
    );
  }


  return (
    <div className="container mx-auto p-6 max-w-3xl bg-white shadow-xl rounded-lg mt-8 mb-8">
      <Link href={`/storybooks/${storyId}`} legacyBehavior>
        <a className="text-sm text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Storybook Details
        </a>
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Edit Storybook: <span className="text-indigo-700">{originalTitle || (formData.title && formData.title.length > 20 ? formData.title.substring(0,20)+"..." : formData.title) || 'Details'}</span></h1>
      {error && <p className="my-4 text-center text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          />
        </div>

        <div className="flex items-center pt-2">
          <input
            id="is_public"
            name="is_public"
            type="checkbox"
            checked={formData.is_public || false}
            onChange={handleChange}
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="is_public" className="ml-3 block text-sm font-medium text-gray-800">
            Make this storybook public?
          </label>
        </div>

        <div className="flex justify-end items-center pt-6 space-x-4 border-t border-gray-200 mt-8">
            <Link href={`/storybooks/${storyId}`} legacyBehavior>
                <a className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                </a>
            </Link>
            <button
                type="submit"
                disabled={isSaving || isLoading} // Disable if initial loading or saving
                className="px-6 py-3 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:opacity-60"
            >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
        </div>
      </form>
    </div>
  );
}
