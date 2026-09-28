import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080/api',
  // Send the HttpOnly session cookie. The app never sees or stores it.
  withCredentials: true,
});

// CSRF: the backend keeps a token in the session and expects it back in a header on
// every POST. It is held in memory only and fetched again after sign-in or sign-out.
let csrf = null; // { headerName, token }

async function getCsrf() {
  if (!csrf) {
    const { data } = await client.get('/auth/csrf');
    csrf = data;
  }
  return csrf;
}

export function forgetCsrfToken() {
  csrf = null;
}

const SAFE_METHODS = ['get', 'head', 'options'];

client.interceptors.request.use(async (config) => {
  if (!SAFE_METHODS.includes((config.method || 'get').toLowerCase())) {
    const { headerName, token } = await getCsrf();
    config.headers[headerName] = token;
  }
  return config;
});

// A 403 on a POST usually means the token went stale (e.g. the session expired).
// Fetch a fresh token and retry once.
client.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  const method = (config?.method || 'get').toLowerCase();
  if (error.response?.status === 403 && config && !config._csrfRetried && !SAFE_METHODS.includes(method)) {
    config._csrfRetried = true;
    forgetCsrfToken();
    return client(config);
  }
  return Promise.reject(error);
});

// Turns an API error into one line for the user. Field errors come first.
export function errorMessage(error, fallback) {
  const data = error?.response?.data;
  if (data?.errors) {
    const [field, message] = Object.entries(data.errors)[0];
    return `${field}: ${message}`;
  }
  if (data?.message) return data.message;
  if (!error?.response) return 'Cannot reach the server. Is the backend running?';
  return fallback;
}

export default client;
