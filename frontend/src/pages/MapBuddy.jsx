import { useCallback, useEffect, useState } from 'react';
import CampusMap from '../components/CampusMap';
import NavigationPanel from '../components/NavigationPanel';
import RouteSummary from '../components/RouteSummary';
import ErrorCard from '../components/ErrorCard';
import { LoadingCard } from '../components/Spinner';
import ManagementPanel from '../components/ManagementPanel';
import useBuildings from '../hooks/useBuildings';
import useNavigationRoute from '../hooks/useNavigationRoute';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

/**
 * Map Buddy — the campus navigation module.
 *
 * Responsibilities are deliberately thin: collect two building names, ask the
 * backend for the stored route, and hand the returned coordinates to the map.
 * No routing logic of any kind lives on the client.
 */
export default function MapBuddy() {
  const { buildings, loading: buildingsLoading, error: buildingsError, reload } = useBuildings();
  const { route, loading, error, navigate, reset } = useNavigationRoute();
  const { user } = useAuth();

  const [start, setStart] = useState('');
  const [nodes, setNodes] = useState([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [destination, setDestination] = useState('');
  const [showWaypoints, setShowWaypoints] = useState(false);

  const onNavigate = useCallback(() => {
    navigate(start.trim(), destination.trim());
  }, [navigate, start, destination]);

  const onReset = useCallback(() => {
    setStart('');
    setDestination('');
    reset();
  }, [reset]);

  const onSwap = useCallback(() => {
    setStart(destination);
    setDestination(start);
  }, [start, destination]);

  const path = route?.path ?? [];

  useEffect(() => {
    async function loadNodes() {
      try {
        const { data } = await apiClient.get('/navigation/nodes');
        setNodes(data?.nodes ?? []);
      } catch {
        setNodes([]);
      }
    }

    loadNodes();
  }, [refreshToken]);

  const onRefresh = useCallback(() => setRefreshToken((value) => value + 1), []);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Map <span className="text-brand-400">Buddy</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Find your way between any two places on campus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">
            <span aria-hidden="true">📍</span>
            {buildingsLoading ? 'Loading…' : `${buildings.length} locations`}
          </span>
          <button
            type="button"
            onClick={() => setShowWaypoints((value) => !value)}
            className={`chip transition ${
              showWaypoints ? '!border-brand-400/40 !bg-brand-400/10 !text-brand-300' : 'hover:bg-white/10'
            }`}
            aria-pressed={showWaypoints}
          >
            <span aria-hidden="true">🔘</span>
            Waypoints
          </button>
        </div>
      </div>

      {/* Layout: control column + map. The map is always on screen. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <aside className="space-y-4">
          <NavigationPanel
            buildings={buildings}
            start={start}
            destination={destination}
            onStartChange={setStart}
            onDestinationChange={setDestination}
            onSwap={onSwap}
            onNavigate={onNavigate}
            onReset={onReset}
            loading={loading}
            buildingsLoading={buildingsLoading}
          />

          {buildingsError && (
            <ErrorCard
              error={buildingsError}
              onRetry={reload}
            />
          )}

          {loading && <LoadingCard />}

          {!loading && error && (
            <ErrorCard error={error} onRetry={onNavigate} onDismiss={reset} />
          )}

          {!loading && !error && route?.success && <RouteSummary route={route} />}

          {!loading && !error && !route && !buildingsError && <EmptyState />}

          {user?.role === 'admin' && <ManagementPanel buildings={buildings} nodes={nodes} onRefresh={onRefresh} />}
        </aside>

        {/* Map column — sticky on large screens so it stays in view */}
        <section className="h-[62vh] min-h-[420px] lg:sticky lg:top-24 lg:h-[calc(100vh-9.5rem)]">
          <CampusMap
            path={path}
            startLabel={route?.start}
            destinationLabel={route?.destination}
            loading={loading}
            showWaypoints={showWaypoints}
          />
        </section>
      </div>
    </div>
  );
}

/** Shown before the first search. */
function EmptyState() {
  return (
    <div className="glass animate-fade-in p-5">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
        How it works
      </h3>
      <ol className="space-y-3">
        {[
          { step: '1', text: 'Choose where you are starting from.' },
          { step: '2', text: 'Choose where you want to go.' },
          { step: '3', text: 'Hit Navigate — the route is drawn on the map.' },
        ].map((item) => (
          <li key={item.step} className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-xs font-bold text-brand-300 ring-1 ring-brand-400/25">
              {item.step}
            </span>
            <span className="text-sm leading-relaxed text-slate-400">{item.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
