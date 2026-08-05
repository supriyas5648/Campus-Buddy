import { useCallback, useEffect, useState } from 'react';
import { fetchBuildingDetails, fetchBuildings } from '../services/campusService';

/**
 * Loads the building list once on mount and exposes a manual `reload`.
 * Falls back to the plain `/api/buildings` name list if the richer details
 * endpoint is unavailable, so the search boxes still work.
 *
 * @returns {{
 *   buildings: Array<{name: string, category: string, description: string, aliases: string[]}>,
 *   names: string[],
 *   loading: boolean,
 *   error: {message: string, code: string}|null,
 *   reload: () => void
 * }}
 */
export default function useBuildings() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const details = await fetchBuildingDetails({ signal: controller.signal });
        if (active) setBuildings(details);
      } catch (detailsError) {
        if (controller.signal.aborted) return;
        try {
          const names = await fetchBuildings({ signal: controller.signal });
          if (active) {
            setBuildings(
              names.map((name) => ({ name, category: 'academic', description: '', aliases: [] }))
            );
          }
        } catch (listError) {
          if (active && !controller.signal.aborted) setError(listError);
        }
      } finally {
        if (active && !controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadToken]);

  return {
    buildings,
    names: buildings.map((building) => building.name),
    loading,
    error,
    reload,
  };
}
