// Import necessary parts from the generated client
import { OpenAPI } from './services/core/OpenAPI';

OpenAPI.BASE = '/api';

OpenAPI.TOKEN = async () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export * from './services';
