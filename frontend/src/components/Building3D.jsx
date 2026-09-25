import { useState } from 'react';

const EXTRUSION = { x: -22, y: -22 };

export default function Building3D({ id, name, footprint, selected = false, onSelect }) {
  const [geometry] = useState(() => buildGeometry(footprint));
  const [hovered, setHovered] = useState(false);

  if (!geometry) return null;

  const emphasis = selected ? 1 : hovered ? 0.82 : 0.55;

  return (
    <g
      className="building-3d"
      data-building-id={id}
      role="button"
      tabIndex="0"
      aria-label={name}
      aria-pressed={selected}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(id);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.(id);
        }
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', opacity: emphasis, transition: 'opacity 280ms ease' }}
    >
      <g>
        {geometry.faces.map((face, index) => (
          <polygon
            key={`${id}-face-${index}`}
            points={face.points}
            fill={index % 2 === 0 ? '#be7a45' : '#9a5734'}
            stroke="#6f3c2b"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ))}
        <path d={geometry.roof} fill="#e9b872" stroke="#7c4a32" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={geometry.footprint} fill="#d99a5f" fillOpacity="0.25" stroke="#f4d39b" strokeWidth="3" />
      </g>
      {selected && (
        <g pointerEvents="none">
          <rect x={geometry.label.x - 8} y={geometry.label.y - 27} width="166" height="31" rx="8" fill="#151b2b" fillOpacity="0.94" stroke="#f4d39b" strokeWidth="1.5" />
          <text x={geometry.label.x + 75} y={geometry.label.y - 7} textAnchor="middle" fill="#fff7e6" fontSize="15" fontWeight="700">
            {name}
          </text>
        </g>
      )}
    </g>
  );
}

function buildGeometry(pathData) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  const measurementSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  measurementSvg.setAttribute('width', '0');
  measurementSvg.setAttribute('height', '0');
  measurementSvg.style.position = 'absolute';
  measurementSvg.style.visibility = 'hidden';
  measurementSvg.appendChild(path);
  document.body.appendChild(measurementSvg);

  const length = path.getTotalLength();
  const sampleCount = Math.min(96, Math.max(4, Math.ceil(length / 18)));
  const points = Array.from({ length: sampleCount }, (_, index) => {
    const point = path.getPointAtLength((length * index) / sampleCount);
    return { x: point.x, y: point.y };
  });
  measurementSvg.remove();

  const roofPoints = points.map((point) => `${point.x + EXTRUSION.x},${point.y + EXTRUSION.y}`);
  const faces = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return {
      points: `${point.x},${point.y} ${next.x},${next.y} ${next.x + EXTRUSION.x},${next.y + EXTRUSION.y} ${point.x + EXTRUSION.x},${point.y + EXTRUSION.y}`,
    };
  });

  const centre = points.reduce(
    (result, point) => ({ x: result.x + point.x / points.length, y: result.y + point.y / points.length }),
    { x: 0, y: 0 }
  );

  return {
    footprint: pathData,
    roof: `M${roofPoints.join(' L')} Z`,
    faces,
    label: { x: centre.x + EXTRUSION.x, y: centre.y + EXTRUSION.y },
  };
}