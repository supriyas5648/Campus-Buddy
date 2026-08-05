import apiClient from './apiClient';

/**
 * Map Buddy API surface. Components never call Axios directly.
 */

/**
 * GET /api/buildings
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<string[]>} building names, alphabetically sorted
 */
export async function fetchBuildings(options = {}) {
  const { data } = await apiClient.get('/buildings', { signal: options.signal });
  return Array.isArray(data) ? data : data?.buildings ?? [];
}

/**
 * GET /api/buildings/details
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Array<{name: string, nearestNode: string, category: string, description: string, aliases: string[]}>>}
 */
export async function fetchBuildingDetails(options = {}) {
  const { data } = await apiClient.get('/buildings/details', { signal: options.signal });
  return data?.buildings ?? [];
}

/**
 * POST /api/navigation
 *
 * The backend returns the complete, already-ordered list of coordinates. The
 * frontend performs no routing of its own — it only draws what comes back.
 *
 * @param {string} start
 * @param {string} destination
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{success: boolean, start: string, destination: string, path: Array<{id: string, x: number, y: number}>, distanceMeters: number|null, estimatedMinutes: number|null}>}
 */
export async function fetchNavigationRoute(start, destination, options = {}) {
  const { data } = await apiClient.post(
    '/navigation',
    { start, destination },
    { signal: options.signal }
  );
  return data;
}

/**
 * GET /api/navigation/nodes — the raw waypoint network (debug overlay).
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Array<{id: string, x: number, y: number, label: string}>>}
 */
export async function fetchNodes(options = {}) {
  const { data } = await apiClient.get('/navigation/nodes', { signal: options.signal });
  return data?.nodes ?? [];
}
