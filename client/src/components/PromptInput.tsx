"use client"; // Required for useState and event handlers

import React, { useState } from 'react';
import { generateScript, ScriptPage } from '@/lib/api';

interface PromptInputProps {
  onScriptGenerated: (script: ScriptPage[]) => void;
  onImagesGenerated: (imageUrls: string[]) => void;
  onLoadingChange: (loading: boolean) => void;
  isLoading: boolean; // Added isLoading to be passed as a prop
  onError: (error: string | null) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  onScriptGenerated,
  onImagesGenerated,
  onLoadingChange,
  isLoading, // Consuming isLoading
  onError,
}) => {
  const [prompt, setPrompt] = useState<string>('');

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      onError('Please enter a story prompt.');
      return;
    }

    onLoadingChange(true);
    onError(null);
    onScriptGenerated([]); // Clear previous script
    onImagesGenerated([]); // Clear previous images

    try {
      // 1. Generate script
      const scriptPages = await generateScript(prompt);
      onScriptGenerated(scriptPages);

      // 2. 目前無法產生圖片，直接清空 imageUrls
      onImagesGenerated([]);
      if (!scriptPages || scriptPages.length === 0) {
        onError('Generated script was empty or invalid.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      if (error instanceof Error) {
        onError(error.message);
      } else {
        onError('An unknown error occurred.');
      }
      // Ensure script and images are cleared on error
      onScriptGenerated([]);
      onImagesGenerated([]);
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="p-4">
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Enter your story prompt here (e.g., a little cat exploring a magical forest)"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isLoading}
      />
      <p className="mt-2 text-sm text-gray-600">
        Tip: For best results and character consistency, describe your characters in detail (e.g., &apos;a curious robot with blue eyes and a red antenna&apos;) within your main story prompt.
      </p>
      <button
        onClick={handleSubmit}
        className="mt-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        disabled={isLoading}
      >
        Generate Story
      </button>
    </div>
  );
};

export default PromptInput;
