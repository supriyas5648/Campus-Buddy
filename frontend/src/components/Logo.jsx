/**
 * CampusBuddy wordmark: a route glyph (green start → red destination) beside
 * the product name.
 *
 * @param {{ compact?: boolean }} props
 */
export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 shadow-glow">
        <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
          <path
            d="M14 44 L26 24 L38 40 L50 18"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="44" r="6" fill="#4ade80" />
          <circle cx="50" cy="18" r="6" fill="#f87171" />
        </svg>
      </span>

      {!compact && (
        <span className="leading-tight">
          <span className="block text-lg font-extrabold tracking-tight text-white">
            Campus<span className="text-brand-400">Buddy</span>
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Digital Campus Assistant
          </span>
        </span>
      )}
    </div>
  );
}
