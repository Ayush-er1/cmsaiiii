/**
 * Environment configuration for API endpoints
 * All environment variables in Vite must be prefixed with VITE_
 */

export const env = {
    // Base URLs
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    authApiUrl: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8000/api/v1/auth',
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',

    // API Endpoints
    endpoints: {
        users: import.meta.env.VITE_API_USERS || '/users',
        courses: import.meta.env.VITE_API_COURSES || '/courses',
        departments: import.meta.env.VITE_API_DEPARTMENTS || '/departments',
        programs: import.meta.env.VITE_API_PROGRAMS || '/programs',
        attendance: import.meta.env.VITE_API_ATTENDANCE || '/attendance',
        results: import.meta.env.VITE_API_RESULTS || '/results',
        fees: import.meta.env.VITE_API_FEES || '/fees',
        announcements: import.meta.env.VITE_API_ANNOUNCEMENTS || '/announcements',
        groups: import.meta.env.VITE_API_GROUPS || '/groups',
        roles: import.meta.env.VITE_API_ROLES || '/roles',
        activities: import.meta.env.VITE_API_ACTIVITIES || '/activities',
    },

    // Configuration
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
};

/**
 * Helper to build full API URLs
 */
export const buildApiUrl = (endpoint: string): string => {
    return `${env.apiBaseUrl}${endpoint}`;
};

/**
 * Get full URL for a specific endpoint
 */
export const getApiUrl = (endpointKey: keyof typeof env.endpoints): string => {
    return buildApiUrl(env.endpoints[endpointKey]);
};
