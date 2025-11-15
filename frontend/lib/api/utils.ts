/**
 * API utility functions
 * Centralizes common API operations to follow DRY principle
 */

/**
 * Build query string from params object
 * Filters out undefined, null, and empty string values
 * @param params Query parameters object
 * @returns URL query string
 */
export function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';

  const filteredParams: Record<string, string> = {};

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      filteredParams[key] = String(value);
    }
  });

  const queryString = Object.keys(filteredParams).length > 0
    ? '?' + new URLSearchParams(filteredParams).toString()
    : '';

  return queryString;
}
