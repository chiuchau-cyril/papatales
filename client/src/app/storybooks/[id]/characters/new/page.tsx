"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CharacterService, CharacterCreate } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';

export default function NewCharacterPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const storybookId = params.id as string;

  const [numericStorybookId, setNumericStorybookId] = useState<number | null>(null);

  // formData will not include story_id directly, it's added at submission
  const [formData, setFormData] = useState<Omit<CharacterCreate, 'story_id'>>({
    name: '',
    description: null,
    role: null,
    appearance_data: null,
    personality_traits: null,
  });
  // Separate states for string inputs of JSON fields
  const [appearanceDataString, setAppearanceDataString] = useState('');
  const [personalityTraitsString, setPersonalityTraitsString] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = parseInt(storybookId, 10);
    if (isNaN(id)) {
        setError("Invalid Storybook ID in URL.");
        setNumericStorybookId(null);
    } else {
        setNumericStorybookId(id);
    }
  }, [storybookId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'appearance_data_string') {
      setAppearanceDataString(value);
    } else if (name === 'personality_traits_string') {
      setPersonalityTraitsString(value);
    } else {
      // For other fields, update formData directly.
      // Handle null for optional fields if value is empty string.
      setFormData(prev => ({
        ...prev,
        [name]: (name !== 'name' && value.trim() === '') ? null : value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!token) {
      setError("Authentication required. Please login.");
      return;
    }
    if (numericStorybookId === null) { // Check if numericStorybookId is valid
        setError("Invalid Storybook ID. Cannot create character.");
        return;
    }
    if (!formData.name || formData.name.trim() === '') { // Name is required
      setError("Character name is required.");
      return;
    }

    let appearance_data_json: object | null = null;
    if (appearanceDataString.trim()) {
      try {
        appearance_data_json = JSON.parse(appearanceDataString);
      } catch (jsonError) {
        setError("Appearance Data is not valid JSON. Please correct it or leave it empty.");
        return;
      }
    }

    let personality_traits_json: object | null = null;
    if (personalityTraitsString.trim()) {
      try {
        personality_traits_json = JSON.parse(personalityTraitsString);
      } catch (jsonError) {
        setError("Personality Traits is not valid JSON. Please correct it or leave it empty.");
        return;
      }
    }

    setIsLoading(true);

    const characterDataToSubmit: CharacterCreate = {
      name: formData.name, // Name is required and should not be null
      description: formData.description,
      role: formData.role,
      story_id: numericStorybookId, // Add numericStorybookId
      appearance_data: appearance_data_json,
      personality_traits: personality_traits_json,
    };

    try {
      await CharacterService.createCharacterCharacterPost({ requestBody: characterDataToSubmit });
      alert('Character created successfully!');
      router.push(`/storybooks/${storybookId}`);
    } catch (err: any) {
      console.error("Failed to create character:", err);
      setError(err.body?.detail || err.message || "An unexpected error occurred while creating the character.");
    } finally {
      setIsLoading(false);
    }
  };

  if (numericStorybookId === null && !isLoading && !error) { // If ID is invalid from URL & no other error yet
    return <div className="container mx-auto p-6 text-center text-red-500 bg-red-100 rounded-md shadow-md">Error: Invalid Storybook ID in URL. Cannot add character.</div>;
  }


  return (
    <div className="container mx-auto p-6 max-w-3xl bg-white shadow-xl rounded-lg mt-8 mb-8">
      <Link href={`/storybooks/${storybookId}`} legacyBehavior>
        <a className="text-sm text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Storybook Details
        </a>
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Add New Character</h1>

      {error && <p className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Character Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Foxy the Brave"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="A short description of the character..."
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input
            type="text"
            name="role"
            id="role"
            value={formData.role || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Protagonist, Mentor, Comic Relief"
          />
        </div>

        <div>
          <label htmlFor="appearance_data_string" className="block text-sm font-medium text-gray-700 mb-1">Appearance Details <span className="text-xs text-gray-500">(JSON format)</span></label>
          <textarea
            name="appearance_data_string"
            id="appearance_data_string"
            rows={4}
            value={appearanceDataString}
            onChange={handleChange}
            placeholder='Example: { "height": "short", "fur_color": "red", "special_features": "bushy tail with white tip" }'
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Enter a valid JSON object or leave empty if not applicable.</p>
        </div>

        <div>
          <label htmlFor="personality_traits_string" className="block text-sm font-medium text-gray-700 mb-1">Personality Traits <span className="text-xs text-gray-500">(JSON format)</span></label>
          <textarea
            name="personality_traits_string"
            id="personality_traits_string"
            rows={4}
            value={personalityTraitsString}
            onChange={handleChange}
            placeholder='Example: { "main_trait": "brave", "likes": ["exploring", "berries"], "dislikes": ["loud noises"] }'
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Enter a valid JSON object or leave empty if not applicable.</p>
        </div>

        <div className="flex justify-end items-center pt-6 space-x-4 border-t border-gray-200 mt-8">
            <Link href={`/storybooks/${storybookId}`} legacyBehavior>
                 <a className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                </a>
            </Link>
            <button
                type="submit"
                disabled={isLoading || numericStorybookId === null} // Disable if ID is invalid
                className="px-6 py-3 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:opacity-60"
            >
                {isLoading ? 'Creating Character...' : 'Create Character'}
            </button>
        </div>
      </form>
    </div>
  );
}
