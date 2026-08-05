import { useMemo } from 'react';

/**
 * Draws the navigation route on top of the campus map.
 *
 * It receives the coordinate list exactly as the backend returned it and does
 * nothing clever with it: the points become an SVG polyline, in order. All the
 * "intelligence" (which nodes make up the route) already happened server-side.
 *
 * How the animation works
 * -----------------------
 * 1. The polyline's total length is measured in map units.
 * 2. `stroke-dasharray` is set to that length, so the line is one single dash.
 * 3. `stroke-dashoffset` animates from that length down to 0 (see index.css),
 *    which reveals the line progressively from start to destination.
 * 4. A second, thinner polyline with a short repeating dash then flows along
 *    the finished route to show the direction of travel.
 *
 * @param {{
 *   path: Array<{id: string, x: number, y: number}>,
 *   startLabel?: string,
 *   destinationLabel?: string,
 *   scale?: number,
 *   showWaypoints?: boolean
 * }} props
 */
export default function RouteOverlay({
  path = [],
  startLabel = 'Start',
  destinationLabel = 'Destination',
  scale = 1,
  showWaypoints = false,
}) {
  const { points, length } = useMemo(() => buildPolyline(path), [path]);

  if (path.length < 2) return null;

  const first = path[0];
  const last = path[path.length - 1];

  // Stroke widths and marker radii are divided by the zoom scale so they keep a
  // constant on-screen size no matter how far the user has zoomed in.
  const s = (value) => value / scale;

  // Remounting on a new route restarts the CSS draw animation.
  const routeKey = `${first.id}-${last.id}-${path.length}`;

  return (
    <g className="pointer-events-none" key={routeKey}>
      <defs>
        <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="18%" stopColor="#3b82f6" />
          <stop offset="82%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>

        <filter id="routeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={s(6)} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Soft outer glow so the blue route stays readable over any map colour */}
      <polyline
        points={points}
        fill="none"
        stroke="#1d4ed8"
        strokeOpacity="0.35"
        strokeWidth={s(20)}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#routeGlow)"
        className="route-line-draw"
        style={{ '--route-length': length }}
      />

      {/* White casing — the classic map "road outline" look */}
      <polyline
        points={points}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.9"
        strokeWidth={s(13)}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="route-line-draw"
        style={{ '--route-length': length }}
      />

      {/* The route itself */}
      <polyline
        points={points}
        fill="none"
        stroke="url(#routeGradient)"
        strokeWidth={s(8)}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="route-line-draw"
        style={{ '--route-length': length }}
      />

      {/* Direction-of-travel dashes flowing from start to destination */}
      <polyline
        points={points}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.75"
        strokeWidth={s(3)}
        strokeLinecap="round"
        className="route-line-flow"
      />

      {/* Intermediate waypoints */}
      {showWaypoints &&
        path.slice(1, -1).map((point) => (
          <circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r={s(5)}
            fill="#0d1220"
            stroke="#93c5fd"
            strokeWidth={s(2.5)}
          />
        ))}

      <Marker point={first} label={startLabel} colour="#22c55e" glyph="A" s={s} />
      <Marker point={last} label={destinationLabel} colour="#ef4444" glyph="B" s={s} />
    </g>
  );
}

/**
 * A pin marker with a pulsing halo and a label chip.
 */
function Marker({ point, label, colour, glyph, s }) {
  const radius = s(16);

  return (
    <g>
      {/* Pulsing halo */}
      <circle
        cx={point.x}
        cy={point.y}
        r={radius}
        fill={colour}
        opacity="0.35"
        className="animate-pulse-ring"
        style={{ transformOrigin: `${point.x}px ${point.y}px` }}
      />
      <circle cx={point.x} cy={point.y} r={radius} fill={colour} stroke="#ffffff" strokeWidth={s(4)} />
      <text
        x={point.x}
        y={point.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize={s(16)}
        fontWeight="800"
        fontFamily="Inter, sans-serif"
      >
        {glyph}
      </text>

      {/* Label chip above the pin */}
      <g transform={`translate(${point.x}, ${point.y - s(30)})`}>
        <rect
          x={-s(labelWidth(label)) / 2}
          y={-s(24)}
          width={s(labelWidth(label))}
          height={s(24)}
          rx={s(8)}
          fill="#0d1220"
          fillOpacity="0.92"
          stroke={colour}
          strokeWidth={s(1.5)}
        />
        <text
          x="0"
          y={-s(12)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontSize={s(13)}
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {label}
        </text>
      </g>
    </g>
  );
}

/** Rough label chip width: SVG has no text metrics before paint. */
function labelWidth(label) {
  return Math.max(70, label.length * 7.6 + 22);
}

/**
 * Converts the API's coordinate list into an SVG `points` string and measures
 * its total length (used to drive the draw animation).
 *
 * @param {Array<{x: number, y: number}>} path
 * @returns {{ points: string, length: number }}
 */
function buildPolyline(path) {
  if (!Array.isArray(path) || path.length === 0) return { points: '', length: 0 };

  let length = 0;
  for (let i = 1; i < path.length; i += 1) {
    length += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
  }

  return {
    points: path.map((point) => `${point.x},${point.y}`).join(' '),
    // A little slack so rounded caps are fully revealed at the end.
    length: Math.ceil(length) + 10,
  };
}
