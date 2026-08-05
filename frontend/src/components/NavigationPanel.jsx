import SearchableSelect from './SearchableSelect';

/**
 * The Map Buddy control card: start box, destination box, swap, Navigate and
 * Reset. It is a controlled component — the page owns all the state.
 *
 * @param {{
 *   buildings: Array<object>,
 *   start: string,
 *   destination: string,
 *   onStartChange: (value: string) => void,
 *   onDestinationChange: (value: string) => void,
 *   onSwap: () => void,
 *   onNavigate: () => void,
 *   onReset: () => void,
 *   loading?: boolean,
 *   buildingsLoading?: boolean
 * }} props
 */
export default function NavigationPanel({
  buildings,
  start,
  destination,
  onStartChange,
  onDestinationChange,
  onSwap,
  onNavigate,
  onReset,
  loading = false,
  buildingsLoading = false,
}) {
  const canNavigate = Boolean(start.trim() && destination.trim()) && !loading;

  function onSubmit(event) {
    event.preventDefault();
    if (canNavigate) onNavigate();
  }

  return (
    <form onSubmit={onSubmit} className="glass p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-lg ring-1 ring-brand-400/25">
          🗺
        </span>
        <div>
          <h2 className="text-base font-bold text-white">Where to?</h2>
          <p className="text-xs text-slate-400">Pick a start and a destination on campus</p>
        </div>
      </div>

      <div className="relative space-y-4">
        <SearchableSelect
          label="Start location"
          value={start}
          onChange={onStartChange}
          options={buildings}
          icon="🟢"
          placeholder={buildingsLoading ? 'Loading locations…' : 'e.g. Main Gate'}
          disabled={buildingsLoading}
        />

        {/* Swap button sits between the two fields */}
        <div className="pointer-events-none absolute inset-x-0 top-[4.35rem] z-30 flex justify-end pr-1">
          <button
            type="button"
            onClick={onSwap}
            title="Swap start and destination"
            aria-label="Swap start and destination"
            className="pointer-events-auto grid h-8 w-8 translate-y-1 place-items-center rounded-full border border-white/15 bg-ink-900 text-slate-300 shadow-lg transition hover:rotate-180 hover:border-brand-400/50 hover:text-white"
            style={{ transitionDuration: '400ms' }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 4v14m0 0l-3-3m3 3l3-3M17 20V6m0 0l-3 3m3-3l3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <SearchableSelect
          label="Destination"
          value={destination}
          onChange={onDestinationChange}
          options={buildings}
          icon="🔴"
          placeholder={buildingsLoading ? 'Loading locations…' : 'e.g. Ayurveda Building'}
          disabled={buildingsLoading}
        />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
        <button type="submit" disabled={!canNavigate} className="btn-primary">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Finding route…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 11l18-8-8 18-2-8-8-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Navigate
            </>
          )}
        </button>

        <button type="button" onClick={onReset} className="btn-ghost" title="Clear the form and the map">
          Reset
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-500">
        Routes are predefined by the campus administration.
      </p>
    </form>
  );
}
