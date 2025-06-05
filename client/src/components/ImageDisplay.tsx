import React from 'react';

interface ImageDisplayProps {
  imageUrls: string[] | null;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrls }) => {
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="p-4 mt-4 border border-gray-300 rounded-md bg-gray-50">
        <p className="text-gray-700">Generated images will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 mt-4 border border-gray-300 rounded-md bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="aspect-w-1 aspect-h-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Generated image ${index + 1}`}
              className="object-cover w-full h-full rounded-md shadow-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageDisplay;
