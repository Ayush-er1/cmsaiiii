/**
 * Environment configuration for API endpoints
 * Values come from .env file (VITE_ prefixed variables)
 */

export const env = {
    // Base URLs - these come from .env and change per environment
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    backendUrl: import.meta.env.VITE_BACKEND_URL,
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT),

    // OAuth2/OIDC Configuration
    authServerUrl: import.meta.env.VITE_AUTH_SERVER_URL,
    clientId: import.meta.env.VITE_CLIENT_ID,
};


