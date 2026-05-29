/**
 * Extracts a clear, user-friendly error message from various error shapes.
 * Handles: Axios errors, Supabase errors, Zod validation errors, and generic JS errors.
 */
export function getErrorMessage(err) {
  // Axios response error with server message
  if (err?.response?.data?.error) {
    const serverError = err.response.data.error;
    if (typeof serverError === 'string') return serverError;
    // Zod validation error array from API
    if (Array.isArray(serverError)) {
      return serverError.map(e => `${e.path?.join('.') || 'Field'}: ${e.message}`).join('\n');
    }
    return JSON.stringify(serverError, null, 2);
  }
  // Axios response error with message field
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  // Network / connection errors
  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
    return 'Network error: Could not connect to the server. Please check your internet connection and try again.';
  }
  // Timeout
  if (err?.code === 'ECONNABORTED') {
    return 'Request timed out. The server took too long to respond. Please try again.';
  }
  // HTTP status-based messages
  if (err?.response?.status) {
    const status = err.response.status;
    if (status === 401) return 'Authentication failed. Please log in again.';
    if (status === 403) return 'Access denied. You do not have admin permissions for this action.';
    if (status === 404) return 'The requested resource was not found. It may have been deleted.';
    if (status === 413) return 'The file is too large. Please use a smaller file.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status >= 500) return `Server error (${status}). Something went wrong on our end. Please try again later.`;
  }
  // Supabase storage error
  if (err?.statusCode && err?.error) {
    return `Storage error: ${err.message || err.error}`;
  }
  // Generic JS Error
  if (err?.message) {
    return err.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
