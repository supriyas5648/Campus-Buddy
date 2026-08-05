/**
 * Loading spinner.
 *
 * @param {{ size?: 'sm'|'md'|'lg', label?: string, className?: string }} props
 */
export default function Spinner({ size = 'md', label, className = '' }) {
  const dimensions = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-4' }[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <span
        className={`${dimensions} animate-spin rounded-full border-white/15 border-t-brand-400`}
        aria-hidden="true"
      />
      {label && <span className="text-sm font-medium text-slate-400">{label}</span>}
      <span className="sr-only">{label || 'Loading'}</span>
    </div>
  );
}

/**
 * Full-card loading state used while a route is being fetched.
 * @param {{ label?: string }} props
 */
export function LoadingCard({ label = 'Finding your route…' }) {
  return (
    <div className="glass animate-scale-in p-6">
      <Spinner label={label} />
      <div className="mt-4 space-y-2">
        {[0, 1, 2].map((row) => (
          <div key={row} className="relative h-2.5 overflow-hidden rounded-full bg-white/5">
            <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}
