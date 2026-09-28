import client, { forgetCsrfToken } from './client';

// The signed-in user, or null when there is no valid session.
export const fetchCurrentUser = async () => {
  try {
    const response = await client.get('/auth/me');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) return null;
    throw error;
  }
};

// Creates the account and signs in. The server then issues a new CSRF token.
export const register = async ({ displayName, email, password }) => {
  const response = await client.post('/auth/register', { displayName, email, password });
  forgetCsrfToken();
  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await client.post('/auth/login', { email, password });
  forgetCsrfToken();
  return response.data;
};

export const logout = async () => {
  try {
    await client.post('/auth/logout');
  } finally {
    forgetCsrfToken();
  }
};
