"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    StoryService,
    StoryResponse,
    CharacterResponse,
    CharacterService,
    CharacterIllustrationRequest, // Added for image generation
    PageResponse,
    ArtStyleResponse,
    UserService
} from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';

// Helper function to display optional data
const displayOptional = (data: string | number | boolean | null | undefined, fallback = 'N/A') => {
  if (data === null || typeof data === 'undefined') return fallback;
  if (typeof data === 'boolean') return data ? 'Yes' : 'No';
  return String(data);
};

export default function StorybookDetailPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  const [storybook, setStorybook] = useState<StoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [characters, setCharacters] = useState<CharacterResponse[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [charactersError, setCharactersError] = useState<string | null>(null);
  const [generatingImageForCharId, setGeneratingImageForCharId] = useState<number | null>(null);

  const fetchStorybookDetailsAndCharacters = useCallback(async () => {
    if (!storyId || !token) {
      if (!token) setError("Authentication required.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCharactersError(null);

    try {
      const numericStoryId = parseInt(storyId, 10);
      if (isNaN(numericStoryId)) {
        setError("Invalid Story ID format.");
        setIsLoading(false);
        return;
      }
      const storyDetails = await StoryService.getStoryStoryIdGet({ storyId: numericStoryId });
      setStorybook(storyDetails);

      setIsLoadingCharacters(true);
      try {
        const charResponse = await CharacterService.getStoryCharactersCharacterStoryStoryIdGet({ storyId: numericStoryId });
        setCharacters(charResponse || []);
      } catch (charErr: any) {
        console.error("Failed to fetch characters:", charErr);
        setCharactersError(charErr.body?.detail || charErr.message || "Failed to load characters.");
      } finally {
        setIsLoadingCharacters(false);
      }

    } catch (err: any) {
      console.error("Failed to fetch storybook details:", err);
      setError(err.body?.detail || err.message || "Failed to load storybook details.");
    } finally {
      setIsLoading(false);
    }
  }, [storyId, token]);

  useEffect(() => {
    fetchStorybookDetailsAndCharacters();
  }, [fetchStorybookDetailsAndCharacters]);

  const handleGenerateCharacterImage = async (charId: number) => {
    if (!token) {
      alert("Authentication required to generate image.");
      return;
    }
    if (!confirm("Are you sure you want to generate an illustration for this character? This may use API credits and will overwrite any existing custom illustration prompt and image for this character.")) {
      return;
    }

    setGeneratingImageForCharId(charId);
    setError(null);
    setCharactersError(null);

    try {
      const requestBody: CharacterIllustrationRequest = {
        character_id: charId,
        // custom_prompt: null, // Let backend use default if not provided
        // style_preferences: null,
      };
      const updatedCharacter = await CharacterService.generateCharacterIllustrationCharacterCharacterIdGenerateIllustrationPost({ characterId: charId, requestBody });

      setCharacters(prevChars =>
        prevChars.map(char => (char.id === charId ? updatedCharacter : char))
      );
      alert(`Character illustration generated/updated successfully! New prompt: "${updatedCharacter.illustration_prompt || 'N/A'}". Image URL: ${updatedCharacter.illustration_url || 'N/A'}`);
    } catch (err: any) {
      console.error("Failed to generate character image:", err);
      const detailError = err.body?.detail || err.message || "Failed to generate character image.";
      alert(detailError);
      setError(detailError);
    } finally {
      setGeneratingImageForCharId(null);
    }
  };

  const handleDeleteStorybook = async () => {
    if (!storybook || !token) {
      alert("Cannot delete storybook: Not loaded or not authenticated.");
      return;
    }
    if (confirm(`Are you sure you want to delete "${storybook.title}"? This action cannot be undone.`)) {
      setActionLoading(true);
      try {
        await StoryService.deleteStoryStoryIdDelete({ storyId: storybook.id });
        alert("Storybook deleted successfully.");
        router.push('/storybooks');
      } catch (err: any) {
        console.error("Failed to delete storybook:", err);
        alert(err.body?.detail || err.message || "Failed to delete storybook.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleGenerateScript = async () => {
    if (!storybook || !token) {
      alert("Cannot generate script: Storybook not loaded or not authenticated.");
      return;
    }
    if (confirm(`Generate AI script for "${storybook.title}"? This may take a moment and overwrite existing script content.`)) {
        setActionLoading(true);
        try {
            const updatedStory = await StoryService.generateStoryContentStoryStoryIdGeneratePost({ storyId: storybook.id });
            setStorybook(updatedStory);
            alert("Script generation process completed! The storybook has been updated.");
        } catch (err: any) {
            console.error("Failed to generate script:", err);
            alert(err.body?.detail || err.message || "Failed to generate script.");
        } finally {
            setActionLoading(false);
        }
    }
  };

  if (isLoading && !storybook) {
    return (
        <div className="container mx-auto p-8 text-center">
            <p className="text-lg text-gray-700">Loading storybook details...</p>
        </div>
    );
  }

  if (error && !storybook) { // Show general error if storybook itself failed to load
    return (
        <div className="container mx-auto p-8 text-center">
            <p className="text-lg text-red-600 bg-red-100 p-4 rounded-md">Error: {error}</p>
            <Link href="/storybooks" legacyBehavior>
                <a className="mt-4 text-indigo-600 hover:text-indigo-800 inline-block">&larr; Back to My Storybooks</a>
            </Link>
        </div>
    );
  }

  if (!storybook) {
    // This case might be hit if !isLoading but storybook is still null (e.g. invalid ID but not caught by error state above)
    return (
        <div className="container mx-auto p-8 text-center">
            <p className="text-lg text-gray-700">Storybook not found or you do not have permission to view it.</p>
             <Link href="/storybooks" legacyBehavior>
                <a className="mt-4 text-indigo-600 hover:text-indigo-800 inline-block">&larr; Back to My Storybooks</a>
            </Link>
        </div>
    );
  }

  const {
    title, id: storybook_id, description, theme, target_age_group, genre, moral_lesson, status,
    is_public, generation_progress, author_id, created_at, updated_at, published_at,
    script_content, pages_data
  } = storybook;

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-white shadow-xl rounded-lg mt-8 mb-8">
      <Link href="/storybooks" legacyBehavior>
        <a className="text-sm text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to My Storybooks
        </a>
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div className="mb-4 sm:mb-0">
                <h1 className="text-4xl font-bold text-gray-800 mb-1">{title}</h1>
                <p className="text-xs text-gray-500">ID: {storybook_id} {author_id ? `| Author ID: ${author_id}` : ''}</p>
            </div>
            <div className="flex space-x-3 flex-shrink-0">
                <Link href={`/storybooks/${storybook_id}/edit`} legacyBehavior>
                    <a className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition duration-150 disabled:opacity-70">Edit</a>
                </Link>
                <button
                    onClick={handleDeleteStorybook}
                    disabled={actionLoading || generatingImageForCharId !== null}
                    className="px-5 py-2 text-sm font-medium bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition duration-150 disabled:opacity-70"
                >
                    {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm text-gray-700">
            <div><strong>Description:</strong> <p className="text-gray-600 mt-1 whitespace-pre-wrap">{displayOptional(description)}</p></div>
            <div><strong>Theme:</strong> <p className="text-gray-600 mt-1">{displayOptional(theme)}</p></div>
            <div><strong>Target Age Group:</strong> <p className="text-gray-600 mt-1">{displayOptional(target_age_group)}</p></div>
            <div><strong>Genre:</strong> <p className="text-gray-600 mt-1">{displayOptional(genre)}</p></div>
            <div><strong>Moral/Lesson:</strong> <p className="text-gray-600 mt-1">{displayOptional(moral_lesson)}</p></div>
            <div><strong>Status:</strong> <p className="font-semibold capitalize mt-1">{displayOptional(status)}</p></div>
            <div><strong>Public:</strong> <p className="text-gray-600 mt-1">{displayOptional(is_public)}</p></div>
            <div><strong>Generation Progress:</strong> <p className="text-gray-600 mt-1">{displayOptional(generation_progress)}%</p></div>
            <div><strong>Created At:</strong> <p className="text-gray-600 mt-1">{new Date(created_at).toLocaleString()}</p></div>
            <div><strong>Updated At:</strong> <p className="text-gray-600 mt-1">{updated_at ? new Date(updated_at).toLocaleString() : 'N/A'}</p></div>
            <div><strong>Published At:</strong> <p className="text-gray-600 mt-1">{published_at ? new Date(published_at).toLocaleString() : 'N/A'}</p></div>
        </div>

        {error && !charactersError && <p className="my-4 text-center text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}

        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-inner">
            <h2 className="text-2xl font-semibold mb-3 text-gray-700">Script & Pages</h2>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p><strong>Script:</strong> {script_content ? String(script_content).substring(0,200)+"..." : 'No script generated yet.'}</p>
              <p className="mt-1"><strong>Pages Data:</strong> {pages_data ? String(pages_data).substring(0,200)+"..." : 'No page data yet.'}</p>
            </div>
            <button
                onClick={handleGenerateScript}
                disabled={actionLoading || generatingImageForCharId !== null}
                className="mt-4 px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition duration-150 disabled:opacity-70"
            >
                {actionLoading ? 'Processing Script...' : 'Generate AI Script (32 Pages)'}
            </button>
        </div>

        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Characters</h2>
            {storybook && (
              <Link href={`/storybooks/${storybook.id}/characters/new`} legacyBehavior>
                <a className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md shadow-sm hover:bg-purple-700 transition duration-150">+ Add Character</a>
              </Link>
            )}
          </div>
          {isLoadingCharacters ? (
            <p className="text-gray-600">Loading characters...</p>
          ) : charactersError ? (
            <p className="text-red-500 bg-red-100 p-3 rounded-md">Error: {charactersError}</p>
          ) : characters.length === 0 ? (
            <p className="text-gray-600">No characters have been added to this storybook yet.</p>
          ) : (
            <ul className="space-y-4">
              {characters.map(char => (
                <li key={char.id} className="p-4 border border-gray-200 rounded-md bg-white shadow">
                  <div className="flex justify-between items-start">
                    <div>
                       <h3 className="font-semibold text-lg text-purple-700">{char.name}</h3>
                       <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{displayOptional(char.description)}</p>
                       <p className="text-xs text-gray-500 mt-1">Role: {displayOptional(char.role)}</p>
                    </div>
                    <div className="flex space-x-2 mt-1 flex-shrink-0">
                       <Link href={`/storybooks/${storybook.id}/characters/${char.id}/edit`} legacyBehavior><a className="text-xs px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-150">Edit</a></Link>
                       <button
                         onClick={() => handleGenerateCharacterImage(char.id)}
                         disabled={generatingImageForCharId === char.id || actionLoading}
                         className="text-xs px-3 py-1.5 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition duration-150 disabled:opacity-50"
                       >
                         {generatingImageForCharId === char.id ? 'Generating...' : 'Gen. Image'}
                       </button>
                    </div>
                  </div>
                  {char.illustration_url && (
                    <div className="mt-3">
                      <img src={char.illustration_url} alt={`Illustration for ${char.name}`} className="max-w-xs h-auto rounded-md shadow-lg"/>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-inner">
            <h2 className="text-2xl font-semibold mb-3 text-gray-700">Art Style</h2>
            <p className="text-gray-600">Art style selection and management will be available here soon.</p>
        </div>

      </div>
    </div>
  );
}
