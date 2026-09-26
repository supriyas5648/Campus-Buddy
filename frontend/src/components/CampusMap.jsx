import { useCallback, useEffect, useMemo, useState } from 'react';
import RouteOverlay from './RouteOverlay';
import Building3D from './Building3D';
import MapControls from './MapControls';
import usePanZoom from '../hooks/usePanZoom';
import { CAMPUS_MAP } from '../config/map';
import { buildings3D } from '../data/buildings';

const MAP_WIDTH = Number(import.meta.env.VITE_MAP_WIDTH) || 2483;
const MAP_HEIGHT = Number(import.meta.env.VITE_MAP_HEIGHT) || 1621;

/**
 * The campus map canvas.
 *
 * A single inline <svg> holds two layers inside one shared <g>:
 *   1. <image> — the campus reference map (`public/campus-map2.svg`)
 *   2. <RouteOverlay> — the animated blue route, always drawn *after* the image
 *      and therefore on top of it.
 *
 * Because both layers sit in the same transformed group, the route stays glued
 * to the map through every zoom and pan.
 *
 * The map is always visible: the route overlay renders only when a path exists,
 * and never replaces the map.
 *
 * @param {{
 *   path?: Array<{id: string, x: number, y: number}>,
 *   startLabel?: string,
 *   destinationLabel?: string,
 *   loading?: boolean,
 *   showWaypoints?: boolean
 * }} props
 */
export default function CampusMap({
  path = [],
  startLabel,
  destinationLabel,
  loading = false,
  showWaypoints = false,
  onBuildingSelect,
  onPanoramaOpen,
}) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const { svgRef, transform, isPanning, handlers, zoomIn, zoomOut, reset, fitTo } = usePanZoom({
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  });

  const hasRoute = Array.isArray(path) && path.length >= 2;

  /** Bounding box of the current route, in map coordinates. */
  const routeBounds = useMemo(() => {
    if (!hasRoute) return null;
    return path.reduce(
      (bounds, point) => ({
        minX: Math.min(bounds.minX, point.x),
        minY: Math.min(bounds.minY, point.y),
        maxX: Math.max(bounds.maxX, point.x),
        maxY: Math.max(bounds.maxY, point.y),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
  }, [path, hasRoute]);

  const fitRoute = useCallback(() => {
    if (routeBounds) fitTo(routeBounds, 220);
  }, [routeBounds, fitTo]);

  // Frame the route automatically whenever a new one arrives.
  const routeSignature = hasRoute ? `${path[0].id}->${path[path.length - 1].id}` : null;
  useEffect(() => {
    if (routeSignature) fitRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit only on a new route
  }, [routeSignature]);

  return (
    <div className="glass relative h-full w-full overflow-hidden">
      {/* Faint grid behind the map for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className={`relative h-full w-full touch-none select-none ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        role="img"
        aria-label={
          hasRoute
            ? `Campus map showing the walking route from ${startLabel} to ${destinationLabel}`
            : 'Campus map'
        }
        {...handlers}
      >
        <g
          transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}
          style={{ transition: isPanning ? 'none' : 'transform 260ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {/* ---- Layer 1: the campus reference map ---- */}
          <image
            href={CAMPUS_MAP}
            x="0"
            y="0"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            preserveAspectRatio="xMidYMid meet"
            pointerEvents="none"
            onLoad={() => setMapLoaded(true)}
            onError={() => setMapLoaded(true)}
          />

          {buildings3D.map((building) => (
            <Building3D
              key={building.id}
              {...building}
              selected={selectedBuilding === building.id}
              onSelect={(id) => {
                setSelectedBuilding(id);
                onBuildingSelect?.(building);
              }}
            />
          ))}

          {/* ---- Layer 2: the animated route, drawn above the map ---- */}
          <RouteOverlay
            path={path}
            startLabel={startLabel}
            destinationLabel={destinationLabel}
            scale={transform.scale}
            showWaypoints={showWaypoints}
          />

          {/* ---- 360° panorama marker near H Building ---- */}
          {onPanoramaOpen && (
            <g
              transform={`translate(752 298) scale(${Math.max(0.5, Math.min(2.5, 1 / transform.scale))})`}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label="View H Building 360° panorama"
              tabIndex={0}
              onPointerDown={(e) => {
                // Stop the pan-zoom hook from capturing this pointer press
                e.stopPropagation();
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                onPanoramaOpen();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onPanoramaOpen();
              }}
            >
              {/* Outer glow ring */}
              <circle r="30" fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.5)" strokeWidth="1.5" />
              {/* Background circle */}
              <circle r="22" fill="#1c1608" stroke="#f59e0b" strokeWidth="2.5" />
              {/* Icon — rendered as SVG text; pointerEvents none so hit-test goes to <g> */}
              <text
                x="0" y="7"
                textAnchor="middle"
                fontSize="18"
                fontFamily="system-ui, sans-serif"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                🔭
              </text>
              {/* "360°" badge */}
              <text
                x="0" y="42"
                textAnchor="middle"
                fontSize="12"
                fontWeight="800"
                fontFamily="system-ui, sans-serif"
                fill="#fbbf24"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                360°
              </text>
              {/* Sub-label */}
              <text
                x="0" y="56"
                textAnchor="middle"
                fontSize="9"
                fontFamily="system-ui, sans-serif"
                fill="#fde68a"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                H Building
              </text>
            </g>
          )}

          {/* ---- Indoor map marker on I Building ---- */}
          {/* I Building footprint: M1022.5 510H758V645H1022.5V510Z  ≈ centre x:890, y:577 */}
          {/* Marker placed just above the building at (890, 468) */}
          <g
            transform={`translate(890 468) scale(${Math.max(0.5, Math.min(2.5, 1 / transform.scale))})`}
            style={{ cursor: 'pointer' }}
            role="button"
            aria-label="Open I Building indoor map"
            tabIndex={0}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => {
              e.stopPropagation();
              onBuildingSelect?.({ id: 'I-building', name: 'I Building' });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ')
                onBuildingSelect?.({ id: 'I-building', name: 'I Building' });
            }}
          >
            {/* Outer glow ring */}
            <circle r="30" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" />
            {/* Background circle */}
            <circle r="22" fill="#06101e" stroke="#3b82f6" strokeWidth="2.5" />
            {/* Icon */}
            <text
              x="0" y="7"
              textAnchor="middle"
              fontSize="18"
              fontFamily="system-ui, sans-serif"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              🏢
            </text>
            {/* Label */}
            <text
              x="0" y="42"
              textAnchor="middle"
              fontSize="10"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
              fill="#93c5fd"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              Indoor
            </text>
            {/* Sub-label */}
            <text
              x="0" y="56"
              textAnchor="middle"
              fontSize="9"
              fontFamily="system-ui, sans-serif"
              fill="#bfdbfe"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              I Building
            </text>
          </g>
        </g>
      </svg>

      <MapControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={reset}
        onFitRoute={fitRoute}
        canFitRoute={hasRoute}
        scale={transform.scale}
      />

      {/* Legend */}
      <div className="glass-strong absolute bottom-4 left-4 z-20 hidden !rounded-xl px-3.5 py-2.5 sm:block">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Legend</p>
        <ul className="space-y-1 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white/70" /> Start
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white/70" /> Destination
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-5 rounded-full bg-gradient-to-r from-emerald-400 via-brand-500 to-rose-400" />{' '}
            Walking route
          </li>
        </ul>
      </div>

      {/* Hint */}
      <p className="pointer-events-none absolute bottom-4 right-4 z-20 hidden rounded-lg bg-ink-950/70 px-2.5 py-1 text-[11px] text-slate-500 backdrop-blur md:block">
        Scroll to zoom · drag to pan
      </p>

      {/* Overlays */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-ink-950/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/15 border-t-brand-400" />
            <span className="text-sm text-slate-400">Loading campus map…</span>
          </div>
        </div>
      )}

      {loading && mapLoaded && (
        <div className="absolute inset-x-0 top-0 z-30">
          <div className="h-1 w-full overflow-hidden bg-white/5">
            <span className="block h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}
