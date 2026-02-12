/**
 * Environment configuration for API endpoints
 * Values come from .env file (VITE_ prefixed variables)
 */

export const env = {
    // Base URLs - these come from .env and change per environment
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    backendUrl: import.meta.env.VITE_BACKEND_URL,
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT),
};

/**
 * Helper to build full API URLs
 */
export const buildApiUrl = (endpoint: string): string => {
    return `${env.apiBaseUrl}${endpoint}`;
};
