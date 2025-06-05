"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserResponse } from '@/lib/services'; // For explicit typing if needed, though currentUser from context is already typed
import Link from 'next/link'; // Import Link

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();

  // currentUser might be null initially or if not logged in
  // UserResponse from openapi.json only had 'id' and 'username'.
  // We should gracefully handle potentially missing fields if UserResponse schema hasn't been updated.
  const typedUser = currentUser as UserResponse & { email?: string; full_name?: string; is_verified?: boolean };


  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">Dashboard</h1>
        <button
          onClick={logout}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Logout
        </button>
      </div>

      {typedUser ? (
        <div className="space-y-3 text-gray-700">
          <p className="text-lg">
            Welcome, <span className="font-semibold text-indigo-600">{typedUser.username || typedUser.email || 'User'}</span>!
          </p>
          <p><strong>User ID:</strong> {typedUser.id}</p>
          {typedUser.email && <p><strong>Email:</strong> {typedUser.email}</p>}
          {typedUser.full_name && <p><strong>Full Name:</strong> {typedUser.full_name}</p>}
          {typeof typedUser.is_verified !== 'undefined' && (
            <p><strong>Verified:</strong>
              <span className={typedUser.is_verified ? "text-green-600" : "text-red-600"}>
                {typedUser.is_verified ? ' Yes' : ' No'}
              </span>
            </p>
          )}
          {/* Display other user details from currentUser if available */}
          {/* <pre className="mt-4 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
            {JSON.stringify(currentUser, null, 2)}
          </pre> */}
        </div>
      ) : (
        <p className="text-gray-600">
          No user data available. You might not be logged in or data is still loading.
        </p>
      )}

      {/* NEW SECTION FOR STORYBOOKS LINK START */}
      {currentUser && ( // Only show if user is logged in
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Manage Your Storybooks</h2>
          <p className="text-gray-600 mb-4">View your collection of generated tales or start a new adventure.</p>
          <Link href="/storybooks" legacyBehavior>
            <a className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out">
              Go to My Storybooks
            </a>
          </Link>
        </div>
      )}
      {/* NEW SECTION FOR STORYBOOKS LINK END */}

    </div>
  );
}
