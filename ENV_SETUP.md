# Environment Variables Setup

## Getting Started

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the values in `.env`** to match your backend API configuration.

## Available Environment Variables

### Base URLs
- `VITE_API_BASE_URL` - Base URL for API endpoints (default: `http://localhost:3000/api`)
- `VITE_AUTH_API_URL` - Authentication API URL (default: `http://localhost:3000/api/auth`)
- `VITE_BACKEND_URL` - Backend server URL (default: `http://localhost:3000`)

### API Endpoints
- `VITE_API_USERS` - Users endpoint path
- `VITE_API_COURSES` - Courses endpoint path
- `VITE_API_DEPARTMENTS` - Departments endpoint path
- `VITE_API_PROGRAMS` - Programs endpoint path
- `VITE_API_ATTENDANCE` - Attendance endpoint path
- `VITE_API_RESULTS` - Results endpoint path
- `VITE_API_FEES` - Fees endpoint path
- `VITE_API_ANNOUNCEMENTS` - Announcements endpoint path
- `VITE_API_GROUPS` - Groups endpoint path
- `VITE_API_ROLES` - Roles endpoint path
- `VITE_API_ACTIVITIES` - Activities endpoint path

### Configuration
- `VITE_API_TIMEOUT` - API request timeout in milliseconds (default: `10000`)

## Usage in Code

### Import the environment helper:
```typescript
import { env, buildApiUrl, getApiUrl } from '@/lib/env';
```

### Use predefined endpoints:
```typescript
// Get full URL for users endpoint
const usersUrl = getApiUrl('users');
// Result: http://localhost:3000/api/users

// Build custom endpoint URL
const customUrl = buildApiUrl('/custom/endpoint');
// Result: http://localhost:3000/api/custom/endpoint
```

### Access configuration directly:
```typescript
// Get base URL
console.log(env.apiBaseUrl);

// Get specific endpoint
console.log(env.endpoints.courses);

// Get timeout
console.log(env.apiTimeout);
```

## Example API Call

```typescript
import { getApiUrl } from '@/lib/env';
import axios from 'axios';

const fetchUsers = async () => {
  try {
    const response = await axios.get(getApiUrl('users'));
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};
```

## Important Notes

1. **Vite Requirement**: All environment variables in Vite **must** be prefixed with `VITE_` to be exposed to the client-side code.

2. **Security**: Never commit `.env` file to version control. It's already added to `.gitignore`.

3. **Restart Required**: After changing `.env` values, you need to **restart the dev server** for changes to take effect.

4. **Production**: For production builds, set environment variables in your hosting platform (Vercel, Netlify, etc.).

## Different Environments

You can create multiple environment files:
- `.env` - Loaded in all cases
- `.env.local` - Local overrides (not committed)
- `.env.production` - Production-specific variables
- `.env.development` - Development-specific variables
