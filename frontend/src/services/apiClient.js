import axios from 'axios';

/**
 * Shared Axios instance. Every request in the app goes through here so base
 * URL, timeout and error normalisation live in exactly one place.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusbuddy_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Error shape the UI consumes.
 * @typedef {{ message: string, code: string, status: number|null, details?: object }} NormalisedError
 */

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normaliseError(error))
);

/**
 * Turns any Axios failure into the same predictable object, so components never
 * have to poke at `error.response?.data?.error?.message`.
 *
 * @param {import('axios').AxiosError} error
 * @returns {NormalisedError}
 */
function normaliseError(error) {
  if (error.code === 'ECONNABORTED') {
    return {
      message: 'The request timed out. Check your connection and try again.',
      code: 'TIMEOUT',
      status: null,
    };
  }

  if (!error.response) {
    return {
      message: 'Cannot reach the CampusBuddy server. Is the backend running?',
      code: 'NETWORK_ERROR',
      status: null,
    };
  }

  const { status, data } = error.response;
  const payload = data?.error;

  return {
    message: payload?.message || data?.message || `Request failed with status ${status}.`,
    code: payload?.code || 'REQUEST_FAILED',
    status,
    details: payload?.details,
  };
}

export default apiClient;
