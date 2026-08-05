import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_SCALE = 0.6;
const MAX_SCALE = 8;
const IDENTITY = { scale: 1, x: 0, y: 0 };

/**
 * Pan & zoom controller for an inline SVG map.
 *
 * The SVG itself keeps a fixed `viewBox`; this hook produces the transform for
 * a single <g> wrapper inside it, which is what actually moves and scales.
 * Because the map image and the route overlay live in the same <g>, they can
 * never drift out of alignment.
 *
 * Supports: wheel/trackpad zoom anchored at the cursor, mouse drag pan,
 * one-finger touch pan, two-finger pinch zoom, and programmatic fit-to-bounds.
 *
 * @param {{ width: number, height: number }} viewBox natural size of the map
 * @returns {{
 *   svgRef: React.RefObject<SVGSVGElement>,
 *   transform: {scale: number, x: number, y: number},
 *   isPanning: boolean,
 *   handlers: object,
 *   zoomIn: () => void,
 *   zoomOut: () => void,
 *   reset: () => void,
 *   fitTo: (bounds: {minX: number, minY: number, maxX: number, maxY: number}, padding?: number) => void
 * }}
 */
export default function usePanZoom({ width, height }) {
  const svgRef = useRef(null);
  const [transform, setTransform] = useState(IDENTITY);
  const [isPanning, setIsPanning] = useState(false);

  // Mutable gesture bookkeeping — kept in refs so gestures never trigger renders.
  const dragRef = useRef(null);
  const pinchRef = useRef(null);

  /** Converts a client (screen) point into the SVG's viewBox coordinate space. */
  const toSvgPoint = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const mapped = point.matrixTransform(ctm.inverse());
    return { x: mapped.x, y: mapped.y };
  }, []);

  /** Zooms by `factor`, keeping the given viewBox point visually anchored. */
  const zoomAt = useCallback((factor, anchor) => {
    setTransform((current) => {
      const nextScale = clamp(current.scale * factor, MIN_SCALE, MAX_SCALE);
      if (nextScale === current.scale) return current;

      // Solve for the translation that keeps `anchor` over the same map point.
      const ratio = nextScale / current.scale;
      return {
        scale: nextScale,
        x: anchor.x - (anchor.x - current.x) * ratio,
        y: anchor.y - (anchor.y - current.y) * ratio,
      };
    });
  }, []);

  const zoomIn = useCallback(
    () => zoomAt(1.3, { x: width / 2, y: height / 2 }),
    [zoomAt, width, height]
  );
  const zoomOut = useCallback(
    () => zoomAt(1 / 1.3, { x: width / 2, y: height / 2 }),
    [zoomAt, width, height]
  );
  const reset = useCallback(() => setTransform(IDENTITY), []);

  /** Frames a bounding box (in map coordinates) in the centre of the viewport. */
  const fitTo = useCallback(
    (bounds, padding = 160) => {
      if (!bounds) return;
      const boxWidth = Math.max(bounds.maxX - bounds.minX, 1) + padding * 2;
      const boxHeight = Math.max(bounds.maxY - bounds.minY, 1) + padding * 2;
      const scale = clamp(Math.min(width / boxWidth, height / boxHeight), MIN_SCALE, MAX_SCALE);
      const centreX = (bounds.minX + bounds.maxX) / 2;
      const centreY = (bounds.minY + bounds.maxY) / 2;
      setTransform({
        scale,
        x: width / 2 - centreX * scale,
        y: height / 2 - centreY * scale,
      });
    },
    [width, height]
  );

  // --- wheel zoom ----------------------------------------------------------
  // Registered natively (not via React's onWheel) because React attaches wheel
  // listeners passively, which forbids preventDefault() and lets the page scroll.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;

    const onWheel = (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      zoomAt(factor, toSvgPoint(event.clientX, event.clientY));
    };

    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomAt, toSvgPoint]);

  // --- mouse drag pan ------------------------------------------------------
  const onPointerDown = useCallback(
    (event) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const point = toSvgPoint(event.clientX, event.clientY);
      dragRef.current = { pointerId: event.pointerId, startX: point.x, startY: point.y };
      setIsPanning(true);
    },
    [toSvgPoint]
  );

  const onPointerMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const point = toSvgPoint(event.clientX, event.clientY);
      const dx = point.x - drag.startX;
      const dy = point.y - drag.startY;
      dragRef.current = { ...drag, startX: point.x, startY: point.y };
      setTransform((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
    },
    [toSvgPoint]
  );

  const endDrag = useCallback((event) => {
    if (dragRef.current?.pointerId === event?.pointerId) {
      event.currentTarget?.releasePointerCapture?.(event.pointerId);
    }
    dragRef.current = null;
    setIsPanning(false);
  }, []);

  // --- touch: one finger pans, two fingers pinch ---------------------------
  const onTouchStart = useCallback(
    (event) => {
      if (event.touches.length === 2) {
        dragRef.current = null;
        pinchRef.current = {
          distance: touchDistance(event.touches),
          anchor: toSvgPoint(
            (event.touches[0].clientX + event.touches[1].clientX) / 2,
            (event.touches[0].clientY + event.touches[1].clientY) / 2
          ),
        };
      }
    },
    [toSvgPoint]
  );

  const onTouchMove = useCallback(
    (event) => {
      const pinch = pinchRef.current;
      if (event.touches.length !== 2 || !pinch) return;
      event.preventDefault();
      const distance = touchDistance(event.touches);
      if (pinch.distance > 0) zoomAt(distance / pinch.distance, pinch.anchor);
      pinchRef.current = { ...pinch, distance };
    },
    [zoomAt]
  );

  const onTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);

  return {
    svgRef,
    transform,
    isPanning,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerLeave: endDrag,
      onPointerCancel: endDrag,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    zoomIn,
    zoomOut,
    reset,
    fitTo,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function touchDistance(touches) {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
}
