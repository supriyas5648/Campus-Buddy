import { useCallback, useRef, useState } from 'react';
import { fetchNavigationRoute } from '../services/campusService';

/**
 * Owns the "ask the backend for a route" interaction: loading flag, the route
 * payload and any error. In-flight requests are aborted when a new one starts,
 * so a slow response can never overwrite a newer one.
 *
 * @returns {{
 *   route: object|null,
 *   loading: boolean,
 *   error: {message: string, code: string}|null,
 *   navigate: (start: string, destination: string) => Promise<object|null>,
 *   reset: () => void
 * }}
 */
export default function useNavigationRoute() {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const navigate = useCallback(async (start, destination) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchNavigationRoute(start, destination, { signal: controller.signal });
      if (controller.signal.aborted) return null;
      setRoute(data);
      return data;
    } catch (requestError) {
      if (controller.signal.aborted) return null;
      setError(requestError);
      setRoute(null);
      return null;
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setRoute(null);
    setError(null);
    setLoading(false);
  }, []);

  return { route, loading, error, navigate, reset };
}
