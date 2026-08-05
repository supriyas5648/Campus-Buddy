/**
 * Summary card for a successfully retrieved route: the two endpoints, the
 * stop-by-stop node list and the distance / walking-time metadata.
 *
 * @param {{
 *   route: {
 *     start: string,
 *     destination: string,
 *     path: Array<{id: string, x: number, y: number}>,
 *     distanceMeters?: number|null,
 *     estimatedMinutes?: number|null
 *   }
 * }} props
 */
export default function RouteSummary({ route }) {
  if (!route?.path?.length) return null;

  const { start, destination, path, distanceMeters, estimatedMinutes } = route;

  return (
    <div className="glass animate-fade-in p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Your route</h3>
        <span className="chip !border-emerald-400/30 !bg-emerald-400/10 !text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Ready
        </span>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <Stat label="Stops" value={path.length} />
        <Stat label="Distance" value={distanceMeters != null ? `${distanceMeters} m` : '—'} />
        <Stat label="Walk" value={estimatedMinutes != null ? `${estimatedMinutes} min` : '—'} />
      </div>

      {/* Endpoints + waypoint trail */}
      <ol className="relative space-y-0">
        <Step colour="bg-emerald-500" title={start} caption="Start" isFirst />

        {path.length > 2 && (
          <li className="relative flex gap-3 py-1.5 pl-[3px]">
            <span className="mt-1 ml-[7px] w-px shrink-0 self-stretch bg-gradient-to-b from-emerald-400/40 to-rose-400/40" />
            <span className="text-xs text-slate-500">
              via {path.slice(1, -1).map((point) => point.id).join(' → ')}
            </span>
          </li>
        )}

        <Step colour="bg-rose-500" title={destination} caption="Destination" isLast />
      </ol>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
      <p className="text-lg font-bold tabular-nums text-white">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

function Step({ colour, title, caption, isFirst, isLast }) {
  return (
    <li className="flex items-start gap-3">
      <span className="relative flex flex-col items-center">
        {!isFirst && <span className="h-2 w-px bg-white/15" />}
        <span className={`h-4 w-4 shrink-0 rounded-full ${colour} ring-4 ring-ink-950`} />
        {!isLast && <span className="h-2 w-px bg-white/15" />}
      </span>
      <span className="min-w-0 flex-1 pb-1">
        <span className="block truncate text-sm font-semibold text-white">{title}</span>
        <span className="block text-[11px] uppercase tracking-wider text-slate-500">{caption}</span>
      </span>
    </li>
  );
}
