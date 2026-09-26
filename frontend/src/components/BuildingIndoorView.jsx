import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BUILDING_FLOOR_MAP,
  INDOOR_NODES,
  calculateIndoorNavigation,
} from '../config/floorMapConfig';
import { parseRoomInput, validateRoomInput } from '../utils/roomParser';
import floor1Raw from '../assets/floor-maps/i-floor-1.svg?raw';
import floor2Raw from '../assets/floor-maps/i-floor-2.svg?raw';
import floor3Raw from '../assets/floor-maps/i-floor-3.svg?raw';

const RAW_FLOOR_SVGS = {
  1: floor1Raw,
  2: floor2Raw,
  3: floor3Raw,
};

/**
 * BuildingIndoorView
 *
 * Dedicated multi-floor indoor navigation interface for campus buildings.
 * Uses N010 as the primary starting / stair navigation node on Floor 1,
 * supports vertical floor transitions via stairs (N010 -> N020 -> N030),
 * highlights 3D classrooms, and renders walkable corridor routes.
 *
 * @param {{
 *   building: { id: string, name?: string, label?: string },
 *   onBack: () => void
 * }} props
 */
export default function BuildingIndoorView({ building, onBack }) {
  const buildingId = building?.id || 'I-building';
  const config = BUILDING_FLOOR_MAP[buildingId] || BUILDING_FLOOR_MAP['I-building'];

  const initialDestination = config?.defaultDestination ?? 'I-201';
  const [destinationInput, setDestinationInput] = useState(initialDestination);
  const [activeDestination, setActiveDestination] = useState(initialDestination);
  const [parsedDestination, setParsedDestination] = useState(() => parseRoomInput(initialDestination));
  const [activeFloor, setActiveFloor] = useState(() => parseRoomInput(initialDestination)?.floor ?? 2);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const svgContainerRef = useRef(null);

  const floorOptions = useMemo(() => {
    return Object.entries(config?.floors ?? {}).sort(([a], [b]) => Number(a) - Number(b));
  }, [config]);

  // Compute multi-floor route starting at N010
  const navigationPlan = useMemo(() => {
    return calculateIndoorNavigation(activeDestination, 'N010');
  }, [activeDestination]);

  // Load floor SVG whenever activeFloor changes
  useEffect(() => {
    if (!config || !config.floors[activeFloor]) {
      return;
    }

    let isMounted = true;
    const floorInfo = config.floors[activeFloor];

    async function loadFloor() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(floorInfo.asset);
        if (response.ok) {
          const text = await response.text();
          if (isMounted) {
            setSvgMarkup(text);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Network fetch fallback to raw string
      }

      if (isMounted) {
        const rawFallback = RAW_FLOOR_SVGS[activeFloor] || floorInfo.rawSvg;
        if (rawFallback) {
          setSvgMarkup(rawFallback);
        } else {
          setSvgMarkup('');
          setError(`Floor ${activeFloor} map is currently unavailable.`);
        }
        setLoading(false);
      }
    }

    loadFloor();

    return () => {
      isMounted = false;
    };
  }, [activeFloor, config]);

  // Handle room destination submission
  function handleNavigate(customValue) {
    const rawVal = customValue !== undefined ? customValue : destinationInput;
    const validation = validateRoomInput(rawVal);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (validation.building !== config.buildingCode) {
      setError(`Room ${validation.room} belongs to Building ${validation.building}. Currently viewing ${config.label}.`);
      return;
    }

    if (!config.floors[validation.floor]) {
      setError(`Floor ${validation.floor} does not exist in ${config.label}.`);
      return;
    }

    setError('');
    setActiveDestination(validation.room);
    setDestinationInput(validation.room);
    setParsedDestination(validation);
    setActiveFloor(validation.floor); // Automatically switch to destination floor
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleNavigate();
  }

  // Draw 3D room highlights and route overlays whenever SVG markup or navigation plan changes
  useEffect(() => {
    if (!svgContainerRef.current || !svgMarkup) {
      return;
    }

    const svgRoot = svgContainerRef.current.querySelector('svg');
    if (!svgRoot) {
      return;
    }

    // Configure SVG scaling & responsiveness
    svgRoot.setAttribute('width', '100%');
    svgRoot.setAttribute('height', '100%');
    svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgRoot.style.maxHeight = '620px';
    svgRoot.style.display = 'block';

    // Remove any existing route overlay layer
    const oldRouteLayer = svgRoot.querySelector('#indoor-route-layer');
    if (oldRouteLayer) {
      oldRouteLayer.remove();
    }

    // Reset all 3D rooms to default styling
    const allRooms = svgRoot.querySelectorAll('[data-room]');
    allRooms.forEach((roomG) => {
      const roof = roomG.querySelector('.room-roof') || roomG.querySelector('rect');
      if (roof) {
        roof.setAttribute('fill', '#78C3B6');
        roof.setAttribute('stroke', '#2d544e');
        roof.setAttribute('stroke-width', '2');
      }

      const sideFaces = roomG.querySelectorAll('polygon');
      sideFaces.forEach((face) => {
        if (face.classList.contains('room-face-bottom')) {
          face.setAttribute('fill', '#43776e');
        } else if (face.classList.contains('room-face-right')) {
          face.setAttribute('fill', '#538c82');
        } else if (face.classList.contains('room-face-top')) {
          face.setAttribute('fill', '#629e93');
        } else if (face.classList.contains('room-face-left')) {
          face.setAttribute('fill', '#629e93');
        }
        face.setAttribute('stroke', '#2d544e');
      });

      const label = roomG.querySelector('.room-label') || roomG.querySelector('text');
      if (label) {
        label.setAttribute('fill', '#0f172a');
        label.setAttribute('font-weight', 'bold');
      }
    });

    // Make rooms interactive (click to navigate)
    allRooms.forEach((roomG) => {
      roomG.style.cursor = 'pointer';
      roomG.onclick = (e) => {
        e.stopPropagation();
        const rawCode = roomG.getAttribute('data-room') || roomG.id.replace('room-', '');
        const formatted = rawCode.length >= 2 ? `${rawCode[0]}-${rawCode.slice(1)}` : rawCode;
        handleNavigate(formatted);
      };
    });

    if (!navigationPlan) {
      return;
    }

    const svgNs = 'http://www.w3.org/2000/svg';
    const routeLayer = document.createElementNS(svgNs, 'g');
    routeLayer.setAttribute('id', 'indoor-route-layer');

    // 1. Highlight target room if on active floor
    if (navigationPlan.targetFloor === activeFloor) {
      const roomKey = navigationPlan.roomCode;
      const targetRoomG =
        svgRoot.querySelector(`[data-room="${roomKey}"]`) ||
        svgRoot.querySelector(`#room-${roomKey}`);

      if (targetRoomG) {
        // Highlight 3D roof in warm gold
        const roof = targetRoomG.querySelector('.room-roof') || targetRoomG.querySelector('rect');
        if (roof) {
          roof.setAttribute('fill', '#fbbf24');
          roof.setAttribute('stroke', '#d97706');
          roof.setAttribute('stroke-width', '3.5');
        }

        // Highlight 3D faces in warm amber
        const sideFaces = targetRoomG.querySelectorAll('polygon');
        sideFaces.forEach((face) => {
          face.setAttribute('fill', '#d97706');
          face.setAttribute('stroke', '#b45309');
        });

        const label = targetRoomG.querySelector('.room-label') || targetRoomG.querySelector('text');
        if (label) {
          label.setAttribute('fill', '#78350f');
          label.setAttribute('font-weight', 'bold');
        }
      }
    }

    // 2. Draw route segments on active floor
    const activeFloorNodes = navigationPlan.floorSegments[activeFloor] || [];
    const points = [];

    activeFloorNodes.forEach((node) => {
      points.push({ x: node.x, y: node.y, id: node.id });
    });

    // If active floor is the destination floor, connect to room center
    if (navigationPlan.targetFloor === activeFloor && navigationPlan.roomCenter && points.length > 0) {
      points.push({
        x: navigationPlan.roomCenter.x,
        y: navigationPlan.roomCenter.y,
        id: 'destination',
      });
    }

    if (points.length >= 2) {
      const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

      // Glowing outer shadow
      const glowLine = document.createElementNS(svgNs, 'polyline');
      glowLine.setAttribute('points', polylinePoints);
      glowLine.setAttribute('fill', 'none');
      glowLine.setAttribute('stroke', '#60a5fa');
      glowLine.setAttribute('stroke-width', '14');
      glowLine.setAttribute('stroke-linecap', 'round');
      glowLine.setAttribute('stroke-linejoin', 'round');
      glowLine.setAttribute('opacity', '0.35');
      routeLayer.appendChild(glowLine);

      // White casing outline
      const casingLine = document.createElementNS(svgNs, 'polyline');
      casingLine.setAttribute('points', polylinePoints);
      casingLine.setAttribute('fill', 'none');
      casingLine.setAttribute('stroke', '#ffffff');
      casingLine.setAttribute('stroke-width', '7');
      casingLine.setAttribute('stroke-linecap', 'round');
      casingLine.setAttribute('stroke-linejoin', 'round');
      casingLine.setAttribute('opacity', '0.9');
      routeLayer.appendChild(casingLine);

      // Primary royal blue line
      const mainLine = document.createElementNS(svgNs, 'polyline');
      mainLine.setAttribute('points', polylinePoints);
      mainLine.setAttribute('fill', 'none');
      mainLine.setAttribute('stroke', '#2563eb');
      mainLine.setAttribute('stroke-width', '4');
      mainLine.setAttribute('stroke-linecap', 'round');
      mainLine.setAttribute('stroke-linejoin', 'round');
      routeLayer.appendChild(mainLine);

      // Animated directional dashed indicator
      const dashLine = document.createElementNS(svgNs, 'polyline');
      dashLine.setAttribute('points', polylinePoints);
      dashLine.setAttribute('fill', 'none');
      dashLine.setAttribute('stroke', '#93c5fd');
      dashLine.setAttribute('stroke-width', '2');
      dashLine.setAttribute('stroke-dasharray', '8 6');
      dashLine.setAttribute('stroke-linecap', 'round');
      dashLine.setAttribute('stroke-linejoin', 'round');
      routeLayer.appendChild(dashLine);

      // Start pin marker
      const startPoint = points[0];
      const startG = document.createElementNS(svgNs, 'g');
      startG.setAttribute('transform', `translate(${startPoint.x}, ${startPoint.y})`);

      const startPulse = document.createElementNS(svgNs, 'circle');
      startPulse.setAttribute('r', '14');
      startPulse.setAttribute('fill', '#22c55e');
      startPulse.setAttribute('opacity', '0.25');
      startG.appendChild(startPulse);

      const startCircle = document.createElementNS(svgNs, 'circle');
      startCircle.setAttribute('r', '7');
      startCircle.setAttribute('fill', '#16a34a');
      startCircle.setAttribute('stroke', '#ffffff');
      startCircle.setAttribute('stroke-width', '2');
      startG.appendChild(startCircle);

      const startText = document.createElementNS(svgNs, 'text');
      startText.setAttribute('y', '-12');
      startText.setAttribute('text-anchor', 'middle');
      startText.setAttribute('font-family', 'Arial, sans-serif');
      startText.setAttribute('font-size', '10');
      startText.setAttribute('font-weight', 'bold');
      startText.setAttribute('fill', '#15803d');
      startText.textContent = activeFloor === 1 ? 'N010 (Start / Stairs)' : `N0${activeFloor}0 (From Stairs)`;
      startG.appendChild(startText);

      routeLayer.appendChild(startG);

      // Destination pin marker (if on target floor)
      if (navigationPlan.targetFloor === activeFloor) {
        const endPoint = points[points.length - 1];
        const endG = document.createElementNS(svgNs, 'g');
        endG.setAttribute('transform', `translate(${endPoint.x}, ${endPoint.y})`);

        const endPulse = document.createElementNS(svgNs, 'circle');
        endPulse.setAttribute('r', '15');
        endPulse.setAttribute('fill', '#ef4444');
        endPulse.setAttribute('opacity', '0.25');
        endG.appendChild(endPulse);

        const endCircle = document.createElementNS(svgNs, 'circle');
        endCircle.setAttribute('r', '7');
        endCircle.setAttribute('fill', '#dc2626');
        endCircle.setAttribute('stroke', '#ffffff');
        endCircle.setAttribute('stroke-width', '2');
        endG.appendChild(endCircle);

        const endText = document.createElementNS(svgNs, 'text');
        endText.setAttribute('y', '20');
        endText.setAttribute('text-anchor', 'middle');
        endText.setAttribute('font-family', 'Arial, sans-serif');
        endText.setAttribute('font-size', '11');
        endText.setAttribute('font-weight', 'bold');
        endText.setAttribute('fill', '#991b1b');
        endText.textContent = navigationPlan.targetRoom;
        endG.appendChild(endText);

        routeLayer.appendChild(endG);
      }
    } else if (activeFloor === 1 && navigationPlan.targetFloor > 1) {
      // If viewing Floor 1 and destination is on upper floor, highlight N010 stairs transition
      const n010 = INDOOR_NODES['N010'];
      if (n010) {
        const stairPinG = document.createElementNS(svgNs, 'g');
        stairPinG.setAttribute('transform', `translate(${n010.x}, ${n010.y})`);

        const stairPulse = document.createElementNS(svgNs, 'circle');
        stairPulse.setAttribute('r', '16');
        stairPulse.setAttribute('fill', '#3b82f6');
        stairPulse.setAttribute('opacity', '0.3');
        stairPinG.appendChild(stairPulse);

        const stairCircle = document.createElementNS(svgNs, 'circle');
        stairCircle.setAttribute('r', '8');
        stairCircle.setAttribute('fill', '#2563eb');
        stairCircle.setAttribute('stroke', '#ffffff');
        stairCircle.setAttribute('stroke-width', '2');
        stairPinG.appendChild(stairCircle);

        const stairText = document.createElementNS(svgNs, 'text');
        stairText.setAttribute('y', '22');
        stairText.setAttribute('text-anchor', 'middle');
        stairText.setAttribute('font-family', 'Arial, sans-serif');
        stairText.setAttribute('font-size', '11');
        stairText.setAttribute('font-weight', 'bold');
        stairText.setAttribute('fill', '#1d4ed8');
        stairText.textContent = `N010 (Take stairs to Floor ${navigationPlan.targetFloor})`;
        stairPinG.appendChild(stairText);

        routeLayer.appendChild(stairPinG);
      }
    }

    svgRoot.appendChild(routeLayer);
  }, [svgMarkup, navigationPlan, activeFloor, buildingId]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Header & Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip !bg-brand-500/20 !border-brand-400/40 text-brand-300">
              Indoor Navigation
            </span>
            <span className="text-xs text-slate-400">3D Building View</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {config.label}
          </h1>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="btn-ghost flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
        >
          <span aria-hidden="true">←</span> Back to Campus
        </button>
      </div>

      {/* Main Grid: Control Panel + Floor Map Display */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left Column: Destination Input & Controls */}
        <div className="space-y-4">
          <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Where do you want to go?
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  placeholder="Enter room or destination (e.g. I-201)"
                  className="w-full rounded-xl border border-white/15 bg-ink-950/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center py-2.5 text-sm font-semibold shadow-md shadow-brand-500/20"
              >
                Navigate
              </button>
            </form>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-medium text-rose-200">
                {error}
              </div>
            )}

            {/* Quick Demo Suggestions */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Demo suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {['I-101', 'I-201', 'I-301'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setDestinationInput(suggestion);
                      handleNavigate(suggestion);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition border ${
                      activeDestination === suggestion
                        ? 'border-brand-400 bg-brand-400/20 text-brand-200'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Floor Level Selector */}
          <div className="glass p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Floor
              </span>
              <span className="text-xs text-brand-300 font-medium">
                {config.floors[activeFloor]?.label ?? `Floor ${activeFloor}`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {floorOptions.map(([floorNum, floorObj]) => {
                const isActive = Number(floorNum) === activeFloor;
                return (
                  <button
                    key={floorNum}
                    type="button"
                    onClick={() => {
                      setActiveFloor(Number(floorNum));
                      setError('');
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl py-3 px-2 text-center transition border ${
                      isActive
                        ? 'border-brand-400 bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/25'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 font-medium'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider opacity-80">Level</span>
                    <span className="text-base font-extrabold">{floorNum}</span>
                    <span className="text-[11px] opacity-90">{floorObj.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Floor Navigation Route Status */}
          {navigationPlan && (
            <div className="glass p-4 rounded-2xl border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Start Location:</span>
                <span className="font-bold text-emerald-400">N010 (Floor 1 Stairs)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Target Room:</span>
                <span className="font-bold text-brand-300 text-sm">{navigationPlan.targetRoom}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Destination Floor:</span>
                <span className="font-semibold text-white">Floor {navigationPlan.targetFloor}</span>
              </div>

              {/* Vertical Stair Transitions */}
              {navigationPlan.stairsTransitions.length > 0 && (
                <div className="rounded-xl border border-brand-400/20 bg-brand-500/10 p-2.5 space-y-1">
                  <p className="font-semibold text-brand-200 text-[11px] uppercase tracking-wider">
                    Vertical Transitions (Stairs):
                  </p>
                  {navigationPlan.stairsTransitions.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                      <span>🪜</span>
                      <span>Take stairs from Floor {st.fromFloor} ({st.fromNode})</span>
                      <span>→</span>
                      <span className="font-bold text-brand-300">Floor {st.toFloor} ({st.toNode})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Step-by-Step Path Sequence */}
              <div className="pt-2 border-t border-white/10 space-y-1">
                <span className="text-slate-400 text-[11px] block">Corridor Path Sequence:</span>
                <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] text-slate-200">
                  {navigationPlan.fullPath.map((nodeId, idx) => (
                    <span key={idx} className="inline-flex items-center">
                      <span className={`px-1.5 py-0.5 rounded ${
                        nodeId.startsWith(`N0${activeFloor}`)
                          ? 'bg-brand-500/30 text-brand-200 border border-brand-400/40'
                          : 'bg-white/5 text-slate-400'
                      }`}>
                        {nodeId}
                      </span>
                      {idx < navigationPlan.fullPath.length - 1 && <span className="mx-0.5 text-slate-500">→</span>}
                    </span>
                  ))}
                  <span className="mx-0.5 text-slate-500">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold">
                    {navigationPlan.targetRoom}
                  </span>
                </div>
              </div>

              {/* Switch Floor Prompt if viewing different floor */}
              {activeFloor !== navigationPlan.targetFloor && (
                <button
                  type="button"
                  onClick={() => setActiveFloor(navigationPlan.targetFloor)}
                  className="w-full mt-2 rounded-xl bg-brand-500/20 border border-brand-400/40 p-2 text-center text-xs font-semibold text-brand-200 hover:bg-brand-500/30 transition"
                >
                  Switch view to Floor {navigationPlan.targetFloor} ({navigationPlan.targetRoom}) →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Floor Map */}
        <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col">
          {/* Map Title & Legend */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Indoor Floor Plan · 3D Isometric View
              </p>
              <h2 className="text-lg font-bold text-white">
                {config.label} — {config.floors[activeFloor]?.label}
              </h2>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                Stairs Connection (N010/N020/N030)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
                Walkable Corridor Route
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-md bg-amber-400 border border-amber-600" />
                3D Destination Room
              </span>
            </div>
          </div>

          {/* SVG Container */}
          <div className="relative flex-1 min-h-[440px] flex items-center justify-center rounded-xl bg-slate-950/40 p-2 overflow-hidden border border-white/5">
            {loading && (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-brand-400" />
                <span className="text-sm">Loading floor map…</span>
              </div>
            )}

            {!loading && svgMarkup && (
              <div
                ref={svgContainerRef}
                className="w-full h-full flex items-center justify-center transition-all duration-300"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            )}

            {!loading && !svgMarkup && (
              <div className="text-center text-sm text-slate-400 py-12">
                Floor map unavailable for this floor.
              </div>
            )}
          </div>

          {/* Helper caption */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Tip: You can also click directly on any 3D classroom in the floor map to select it.</span>
            {navigationPlan && (
              <span className="font-semibold text-brand-300">
                Destination: {navigationPlan.targetRoom} (Floor {navigationPlan.targetFloor})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
