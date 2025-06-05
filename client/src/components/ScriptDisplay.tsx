import React from 'react';
import { ScriptPage } from '@/lib/api'; // Assuming ScriptPage is exported from api.ts

interface ScriptDisplayProps {
  scriptPages: ScriptPage[] | null;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ scriptPages }) => {
  if (!scriptPages || scriptPages.length === 0) {
    return (
      <div className="p-4 mt-4 border border-gray-300 rounded-md bg-gray-50">
        <p className="text-gray-700">Generated script will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 mt-4 border border-gray-300 rounded-md bg-gray-50 space-y-4">
      {scriptPages.map((page, index) => (
        <div key={index} className="p-3 border-b border-gray-200 last:border-b-0">
          <h3 className="text-lg font-semibold text-indigo-600">Page {page.page}</h3>
          <p className="text-gray-800 mt-1 whitespace-pre-wrap">{page.narrative_cn}</p>
          {/* We might not want to display the English prompt directly here,
              but it's part of the data, so keeping it for now or for debugging.
              Could be removed if only the narrative is desired. */}
          <p className="text-sm text-gray-500 mt-1 italic">
            Illustration Prompt: {page.illustration_prompt_en}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ScriptDisplay;
