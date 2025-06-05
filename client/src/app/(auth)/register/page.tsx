"use client";
import React, { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserCreate } from '@/lib/services';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    password: '',
    email: '',
    full_name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.username || !formData.password) {
        alert("Please fill in all required fields (Email, Username, Password).");
        return;
    }
    try {
      await register(formData);
      router.push('/login');
    } catch (err) {
      console.error("Registration page error catch:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-900">Create Your Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="your_username"
            />
          </div>
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name <span className="text-xs text-gray-500">(Optional)</span></label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Your Full Name"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-center text-red-600 text-sm bg-red-100 p-2 rounded-md">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
         <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
