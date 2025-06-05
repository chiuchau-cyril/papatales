"use client";

import React, { useState, FormEvent, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// Assuming CharacterUpdate might not be explicitly generated if PUT body is generic object.
// If CharacterUpdate type *is* generated and suitable, it should be used instead of CharacterUpdatePayload.
import { CharacterService, CharacterResponse, CharacterUpdate } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';

// If CharacterUpdate is not specifically generated or is too generic (e.g. just 'object'),
// define a more specific payload type for the form data, excluding story_id.
type CharacterUpdatePayload = Omit<CharacterUpdate, 'story_id'>; // Assuming CharacterUpdate exists and is similar to CharacterCreate

export default function EditCharacterPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const storybookId = params.id as string;
  const characterId = params.charId as string;

  const [numericStorybookId, setNumericStorybookId] = useState<number | null>(null);
  const [numericCharacterId, setNumericCharacterId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<CharacterUpdatePayload>>({
    name: '', // Initialize with empty string or null based on type
    description: null,
    role: null,
    // JSON fields are handled by string states first
  });
  const [appearanceDataString, setAppearanceDataString] = useState('');
  const [personalityTraitsString, setPersonalityTraitsString] = useState('');

  const [originalCharacterName, setOriginalCharacterName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sId = parseInt(storybookId, 10);
    const cId = parseInt(characterId, 10);
    let valid = true;
    if (isNaN(sId)) {
      setError(prev => prev || "Invalid Storybook ID."); // Keep existing error if any
      valid = false;
    }
    if (isNaN(cId)) {
      setError(prev => prev || "Invalid Character ID.");
      valid = false;
    }
    if (valid) {
      setNumericStorybookId(sId);
      setNumericCharacterId(cId);
    } else {
        setIsLoading(false); // Stop loading if IDs are invalid
    }
  }, [storybookId, characterId]);


  const fetchCharacterData = useCallback(async () => {
    if (!numericCharacterId || !token) {
      if (!token && !error) setError("Authentication required."); // Set error only if not already set by ID validation
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors before new fetch
    try {
      const charData = await CharacterService.getCharacterCharacterCharacterIdGet({ characterId: numericCharacterId });

      // Validate if character belongs to the storybook from URL (important!)
      if (charData.story_id !== numericStorybookId) {
        setError("Character does not belong to the specified storybook. Please check the URL.");
        setIsLoading(false);
        // Optionally disable form or redirect
        return;
      }

      setFormData({
        name: charData.name || '', // Name is likely required, ensure it's a string
        description: charData.description || null,
        role: charData.role || null,
        // Note: appearance_data and personality_traits are objects in CharacterResponse.
        // They are not directly part of CharacterUpdatePayload if it's based on typical update schemas
        // that might take individual fields or a partial object.
        // They are handled by string states for the form.
      });
      setOriginalCharacterName(charData.name || 'Character');
      setAppearanceDataString(charData.appearance_data ? JSON.stringify(charData.appearance_data, null, 2) : '');
      setPersonalityTraitsString(charData.personality_traits ? JSON.stringify(charData.personality_traits, null, 2) : '');
    } catch (err: any) {
      console.error("Failed to fetch character:", err);
      setError(err.body?.detail || err.message || "Failed to load character data.");
    } finally {
      setIsLoading(false);
    }
  }, [numericCharacterId, numericStorybookId, token, error]); // Add error to dependency array

  useEffect(() => {
    if (numericCharacterId && numericStorybookId) { // Only fetch if both IDs are valid numbers
        fetchCharacterData();
    }
  }, [numericCharacterId, numericStorybookId, fetchCharacterData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'appearance_data_string') {
      setAppearanceDataString(value);
    } else if (name === 'personality_traits_string') {
      setPersonalityTraitsString(value);
    } else {
      setFormData(prev => ({
        ...prev,
        // Ensure name is not set to null if required, other optional fields can be null
        [name]: (name !== 'name' && value.trim() === '') ? null : value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous submission errors

    if (!token) {
      setError("Authentication required to save changes.");
      return;
    }
    if (!numericCharacterId || !numericStorybookId) { // Check numeric IDs
        setError("Invalid Storybook or Character ID.");
        return;
    }
    if (!formData.name || formData.name.trim() === '') {
      setError("Character name is required and cannot be empty.");
      return;
    }

    let appearance_data_json: object | null = null;
    if (appearanceDataString.trim()) {
      try {
        appearance_data_json = JSON.parse(appearanceDataString);
      } catch (jsonError) {
        setError("Appearance Data is not valid JSON. Please correct or clear it.");
        return;
      }
    }

    let personality_traits_json: object | null = null;
    if (personalityTraitsString.trim()) {
      try {
        personality_traits_json = JSON.parse(personalityTraitsString);
      } catch (jsonError) {
        setError("Personality Traits is not valid JSON. Please correct or clear it.");
        return;
      }
    }

    setIsSaving(true);

    // Construct the payload based on CharacterUpdate type from services, if available and specific.
    // If CharacterUpdate is just 'object', this structure is assumed.
    const characterUpdateData: CharacterUpdate = {
      name: formData.name, // Name is likely required
      description: formData.description,
      role: formData.role,
      appearance_data: appearance_data_json,
      personality_traits: personality_traits_json,
      // story_id is not part of update payload for /character/{character_id} typically
    };

    try {
      await CharacterService.updateCharacterCharacterCharacterIdPut({
        characterId: numericCharacterId,
        requestBody: characterUpdateData
      });
      alert('Character updated successfully!');
      router.push(`/storybooks/${storybookId}`);
    } catch (err: any) {
      console.error("Failed to update character:", err);
      setError(err.body?.detail || err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center text-lg text-gray-700">Loading character data...</div>;
  }

  // If numeric IDs are null/NaN after initial effect and not loading
  if ((numericStorybookId === null || numericCharacterId === null) && !isLoading) {
     return <div className="container mx-auto p-8 text-center text-lg text-red-600 bg-red-100 p-4 rounded-md">Error: Invalid Storybook or Character ID in URL. <Link href={`/storybooks`} className="underline">Return to Storybooks</Link></div>;
  }

  // If error occurred during fetch and we don't have a character name loaded
  if (error && !originalCharacterName && !isLoading) {
    return (
         <div className="container mx-auto p-8 text-center">
            <p className="text-lg text-red-600 bg-red-100 p-4 rounded-md">Error: {error}</p>
            <Link href={`/storybooks/${storybookId}`} legacyBehavior>
                <a className="mt-4 text-indigo-600 hover:text-indigo-800 inline-block">&larr; Back to Storybook Details</a>
            </Link>
        </div>
    );
  }


  return (
    <div className="container mx-auto p-6 max-w-3xl bg-white shadow-xl rounded-lg mt-8 mb-8">
      <Link href={`/storybooks/${storybookId}`} legacyBehavior>
        <a className="text-sm text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Storybook Details
        </a>
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Edit Character: <span className="text-indigo-700">{originalCharacterName || (formData.name && formData.name.length > 20 ? formData.name.substring(0,20)+"..." : formData.name) || 'Details'}</span></h1>

      {error && <p className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Character Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name || ''}
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
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                disabled={isSaving || isLoading || numericCharacterId === null || numericStorybookId === null}
                className="px-6 py-3 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:opacity-60"
            >
                {isSaving ? 'Saving Character...' : 'Save Character'}
            </button>
        </div>
      </form>
    </div>
  );
}
