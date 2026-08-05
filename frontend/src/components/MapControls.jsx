/**
 * Floating zoom / pan controls rendered over the map canvas.
 *
 * @param {{
 *   onZoomIn: () => void,
 *   onZoomOut: () => void,
 *   onReset: () => void,
 *   onFitRoute?: () => void,
 *   scale: number,
 *   canFitRoute?: boolean
 * }} props
 */
export default function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFitRoute,
  scale,
  canFitRoute = false,
}) {
  return (
    <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
      <div className="glass-strong flex flex-col overflow-hidden !rounded-xl p-1">
        <ControlButton onClick={onZoomIn} label="Zoom in">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </ControlButton>
        <span className="mx-auto my-0.5 h-px w-6 bg-white/10" />
        <ControlButton onClick={onZoomOut} label="Zoom out">
          <path d="M5 12h14" strokeLinecap="round" />
        </ControlButton>
      </div>

      <div className="glass-strong flex flex-col overflow-hidden !rounded-xl p-1">
        {canFitRoute && (
          <>
            <ControlButton onClick={onFitRoute} label="Fit route to view">
              <path
                d="M4 9V5a1 1 0 011-1h4M15 4h4a1 1 0 011 1v4M20 15v4a1 1 0 01-1 1h-4M9 20H5a1 1 0 01-1-1v-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </ControlButton>
            <span className="mx-auto my-0.5 h-px w-6 bg-white/10" />
          </>
        )}
        <ControlButton onClick={onReset} label="Reset view">
          <path
            d="M4 4v6h6M20 20v-6h-6M20 9a8 8 0 00-14.9-2M4 15a8 8 0 0014.9 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </ControlButton>
      </div>

      <span className="glass-strong !rounded-lg px-2.5 py-1 text-[11px] font-bold tabular-nums text-slate-300">
        {Math.round(scale * 100)}%
      </span>
    </div>
  );
}

function ControlButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-95"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        {children}
      </svg>
    </button>
  );
}
