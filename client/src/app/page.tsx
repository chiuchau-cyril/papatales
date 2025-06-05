"use client"; // Required for useState and event handlers

import React, { useState } from 'react';
import PromptInput from "@/components/PromptInput";
import ScriptDisplay from "@/components/ScriptDisplay";
import ImageDisplay from "@/components/ImageDisplay";
import { ScriptPage } from '@/lib/api'; // Assuming ScriptPage is exported from api.ts

export default function Home() {
  const [scriptPages, setScriptPages] = useState<ScriptPage[] | null>(null);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gray-100">
      <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg max-w-4xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">
            PapaTales: AI Storybook Generator
          </h1>
        </header>

        {error && (
          <div className="mb-6 p-3 text-center bg-red-100 text-red-700 border border-red-300 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <section id="prompt-section" className="mb-6">
          <PromptInput
            onScriptGenerated={setScriptPages}
            onImagesGenerated={setImageUrls}
            onLoadingChange={setIsLoading}
            isLoading={isLoading} // Pass isLoading state
            onError={setError}
          />
        </section>

        {isLoading && (
          <div className="text-center my-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="text-indigo-600 mt-3">Generating your story, please wait...</p>
          </div>
        )}

        {!isLoading && scriptPages && scriptPages.length > 0 && (
          <section id="script-display-section" className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Generated Script</h2>
            <ScriptDisplay scriptPages={scriptPages} />
          </section>
        )}

        {!isLoading && imageUrls && imageUrls.length > 0 && (
          <section id="image-display-section">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Generated Images</h2>
            <ImageDisplay imageUrls={imageUrls} />
          </section>
        )}
      </div>
    </main>
  );
}
