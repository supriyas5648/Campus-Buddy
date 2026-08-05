/**
 * Error card shown when a navigation request fails.
 *
 * The backend's `ROUTE_NOT_FOUND` code gets the dedicated "Route Not Found"
 * treatment; every other failure falls back to a generic message with the
 * server's text.
 *
 * @param {{
 *   error: { message: string, code?: string, status?: number|null },
 *   onRetry?: () => void,
 *   onDismiss?: () => void
 * }} props
 */
export default function ErrorCard({ error, onRetry, onDismiss }) {
  if (!error) return null;

  const preset = PRESETS[error.code] || PRESETS.DEFAULT;

  return (
    <div
      className={`glass animate-scale-in border-l-4 p-5 ${preset.accent}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${preset.iconBg}`}>
          {preset.icon}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-white">{preset.title}</h3>
          <p className="mt-1 break-words text-sm leading-relaxed text-slate-300">{error.message}</p>
          {preset.hint && <p className="mt-2 text-xs text-slate-500">{preset.hint}</p>}

          {(onRetry || onDismiss) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {onRetry && (
                <button type="button" onClick={onRetry} className="btn-primary !py-2 !text-xs">
                  Try again
                </button>
              )}
              {onDismiss && (
                <button type="button" onClick={onDismiss} className="btn-ghost !py-2 !text-xs">
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PRESETS = {
  ROUTE_NOT_FOUND: {
    title: 'Route Not Found',
    icon: '🚧',
    iconBg: 'bg-amber-500/15 text-amber-300',
    accent: 'border-l-amber-400/70',
    hint: 'No predefined walking route connects these two places yet. Try a nearby landmark, or ask an admin to add the route.',
  },
  BUILDING_NOT_FOUND: {
    title: 'Location Not Recognised',
    icon: '📍',
    iconBg: 'bg-rose-500/15 text-rose-300',
    accent: 'border-l-rose-400/70',
    hint: 'Pick a place from the dropdown list to make sure the name matches exactly.',
  },
  SAME_LOCATION: {
    title: 'You Are Already There',
    icon: '🎯',
    iconBg: 'bg-brand-500/15 text-brand-300',
    accent: 'border-l-brand-400/70',
    hint: 'Choose two different locations to see a route.',
  },
  NETWORK_ERROR: {
    title: 'Server Unreachable',
    icon: '🔌',
    iconBg: 'bg-rose-500/15 text-rose-300',
    accent: 'border-l-rose-400/70',
    hint: 'Start the API with `npm run dev` inside the backend folder and try again.',
  },
  TIMEOUT: {
    title: 'Request Timed Out',
    icon: '⏱',
    iconBg: 'bg-amber-500/15 text-amber-300',
    accent: 'border-l-amber-400/70',
    hint: 'The server took too long to respond.',
  },
  DATABASE_UNAVAILABLE: {
    title: 'Campus Data Unavailable',
    icon: '🗄',
    iconBg: 'bg-rose-500/15 text-rose-300',
    accent: 'border-l-rose-400/70',
    hint: 'MongoDB is not reachable. Check that mongod is running and that the data has been seeded.',
  },
  DEFAULT: {
    title: 'Something Went Wrong',
    icon: '⚠️',
    iconBg: 'bg-rose-500/15 text-rose-300',
    accent: 'border-l-rose-400/70',
    hint: null,
  },
};
