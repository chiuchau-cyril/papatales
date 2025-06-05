// Import necessary parts from the generated client
// The exact import paths might differ based on the generator's output structure.
// Common practice is that 'index.ts' in the output directory re-exports all services and models.
import { OpenAPI } from './services/core/OpenAPI';
// You might also import specific services if needed, e.g.:
// import { AuthService, StoryService } from './services';

// Set the base URL for all API calls.
// Next.js will proxy /api calls to your backend (e.g., http://localhost:3001)
// This should match the 'destination' in your next.config.mjs rewrites.
OpenAPI.BASE = '/api';

// Configure how to retrieve the authentication token.
// This function will be called by the generated client before making a request
// if the OpenAPI operation specifies security requirements (e.g., OAuth2PasswordBearer).
OpenAPI.TOKEN = async () => {
  if (typeof window !== 'undefined') {
    // Retrieve the token from localStorage (or sessionStorage, cookies, etc.)
    return localStorage.getItem('authToken');
  }
  return null; // Return null or undefined if no token is available (e.g., during SSR)
};

// Optional: Set WITH_CREDENTIALS to true if your API uses cookies for session management
// and you need to send credentials (like cookies or authorization headers) cross-origin.
// OpenAPI.WITH_CREDENTIALS = true;

// Optional: Override global request options or add interceptors
// This is more advanced and often not needed if TOKEN and BASE are sufficient.
// OpenAPI.HEADERS = { 'X-Custom-Header': 'SomeValue' };
/*
OpenAPI.REQUEST = async (options: ApiRequestOptions): Promise<any> => {
  // This is a low-level hook. Use with caution.
  // 'options' contains everything about the request.
  // You can modify options here, or handle the request entirely yourself.
  // Remember to return a Promise that resolves with the response data.
  console.log('Custom request interceptor:', options);
  // Example: Call a default fetch or your preferred HTTP client
  // This is a simplified example. The actual implementation would need to replicate
  // the logic of the generated client's request handling or call into it.
  const { method, url, path, query, body, errors } = options;
  const fullUrl = `${OpenAPI.BASE}${path}${query ? `?${new URLSearchParams(query as any)}` : ''}`;
  const token = await OpenAPI.TOKEN();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw { status: response.status, body: errorData, errors };
  }
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return undefined; // Or null, for empty responses
  }
  return response.json();
};
*/

// The generated client (PapaTalesApiClient by name, but usually it's individual services)
// will now use these global OpenAPI configurations.
// You typically import the individual services in your components/pages.
// e.g., import { AuthService, StoryService } from '@/lib/apiClient';

// Re-export all generated services and models for easier access.
// The 'index.ts' in './services/' should ideally export all necessary parts.
export * from './services';
