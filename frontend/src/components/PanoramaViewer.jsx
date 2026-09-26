import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * PanoramaViewer
 *
 * A lightweight, dependency-free 360° equirectangular panorama viewer.
 * Supports mouse drag, touch swipe, continuous rotation, and pinch-to-zoom.
 *
 * Props:
 *   src   — URL of the equirectangular panorama image
 *   title — accessible label / caption shown in the header
 *   onClose — called when the user dismisses the viewer
 */
export default function PanoramaViewer({ src, title = '360° View', onClose }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const stateRef = useRef({
    yaw: 0,       // horizontal angle in radians
    pitch: 0,     // vertical angle in radians (clamped)
    fov: 75,      // field of view in degrees
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastTouchDist: null,
    animId: null,
    loaded: false,
  });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // ── Render one frame ────────────────────────────────────────────────────────
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const s = stateRef.current;
    if (!canvas || !img || !s.loaded) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const IW = img.naturalWidth;
    const IH = img.naturalHeight;

    const fovRad = (s.fov * Math.PI) / 180;
    const halfFovX = fovRad / 2;
    const halfFovY = (fovRad * H) / W / 2;

    // Draw each vertical column: sample the equirectangular image
    for (let px = 0; px < W; px++) {
      // Horizontal angle for this column
      const thetaX = s.yaw + halfFovX * (px / W - 0.5) * 2;
      // Map thetaX → image x
      let u = (thetaX / (2 * Math.PI) + 0.5) % 1;
      if (u < 0) u += 1;
      const sx = Math.floor(u * IW);

      for (let py = 0; py < H; py++) {
        const thetaY = s.pitch + halfFovY * (py / H - 0.5) * 2;
        let v = thetaY / Math.PI + 0.5;
        v = Math.max(0, Math.min(1, v));
        const sy = Math.floor(v * IH);

        // Use the faster drawImage strip approach — see below
        // (pixel-by-pixel is too slow; we'll use a horizontal-strip approach)
        void sy; void sx; // suppress lint
      }
    }

    // ── Fast strip-based render ──────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);

    for (let py = 0; py < H; py++) {
      const thetaY = s.pitch + halfFovY * ((py / H) * 2 - 1);
      let v = thetaY / Math.PI + 0.5;
      v = Math.max(0.001, Math.min(0.999, v));
      const sy = Math.floor(v * IH);

      // Compute yaw extremes for this row (same for all rows in linear proj)
      const yawLeft  = s.yaw - halfFovX;
      const yawRight = s.yaw + halfFovX;

      // Normalise to [0,1]
      let uLeft  = (yawLeft  / (2 * Math.PI) + 0.5) % 1;
      let uRight = (yawRight / (2 * Math.PI) + 0.5) % 1;
      if (uLeft  < 0) uLeft  += 1;
      if (uRight < 0) uRight += 1;

      const sxLeft  = uLeft  * IW;
      const sxRight = uRight * IW;

      if (sxLeft < sxRight) {
        // No wraparound — single drawImage call per row
        ctx.drawImage(img, sxLeft, sy, sxRight - sxLeft, 1, 0, py, W, 1);
      } else {
        // Wraparound: two strips
        const leftWidth  = IW - sxLeft;
        const rightWidth = sxRight;
        const totalSrc   = leftWidth + rightWidth;
        const wLeft      = Math.round(W * leftWidth  / totalSrc);
        const wRight     = W - wLeft;
        if (wLeft  > 0) ctx.drawImage(img, sxLeft, sy, leftWidth,  1, 0,      py, wLeft,  1);
        if (wRight > 0) ctx.drawImage(img, 0,      sy, rightWidth, 1, wLeft,  py, wRight, 1);
      }
    }
  }, []);

  // ── Animation loop ──────────────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    const loop = () => {
      drawFrame();
      stateRef.current.animId = requestAnimationFrame(loop);
    };
    stateRef.current.animId = requestAnimationFrame(loop);
  }, [drawFrame]);

  const stopLoop = useCallback(() => {
    if (stateRef.current.animId) {
      cancelAnimationFrame(stateRef.current.animId);
      stateRef.current.animId = null;
    }
  }, []);

  // ── Resize canvas to fill container ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawFrame();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawFrame, imgLoaded]);

  // ── Start/stop render loop when image is ready ──────────────────────────────
  useEffect(() => {
    if (imgLoaded) {
      stateRef.current.loaded = true;
      startLoop();
    }
    return stopLoop;
  }, [imgLoaded, startLoop, stopLoop]);

  // ── Keyboard: Escape to close ───────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Mouse handlers ──────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    stateRef.current.dragging = true;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  };
  const onMouseMove = (e) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.yaw   -= dx * 0.003;
    s.pitch -= dy * 0.003;
    s.pitch  = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, s.pitch));
    s.lastX  = e.clientX;
    s.lastY  = e.clientY;
  };
  const onMouseUp = () => { stateRef.current.dragging = false; };

  // ── Wheel zoom ──────────────────────────────────────────────────────────────
  const onWheel = (e) => {
    e.preventDefault();
    const s = stateRef.current;
    s.fov = Math.max(30, Math.min(120, s.fov + e.deltaY * 0.05));
  };

  // ── Touch handlers ──────────────────────────────────────────────────────────
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      stateRef.current.dragging = true;
      stateRef.current.lastX = e.touches[0].clientX;
      stateRef.current.lastY = e.touches[0].clientY;
      stateRef.current.lastTouchDist = null;
    } else if (e.touches.length === 2) {
      stateRef.current.dragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      stateRef.current.lastTouchDist = Math.hypot(dx, dy);
    }
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    const s = stateRef.current;
    if (e.touches.length === 1 && s.dragging) {
      const dx = e.touches[0].clientX - s.lastX;
      const dy = e.touches[0].clientY - s.lastY;
      s.yaw   -= dx * 0.004;
      s.pitch -= dy * 0.004;
      s.pitch  = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, s.pitch));
      s.lastX  = e.touches[0].clientX;
      s.lastY  = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (s.lastTouchDist !== null) {
        const delta = s.lastTouchDist - dist;
        s.fov = Math.max(30, Math.min(120, s.fov + delta * 0.1));
      }
      s.lastTouchDist = dist;
    }
  };
  const onTouchEnd = () => { stateRef.current.dragging = false; };

  return (
    /* Full-screen modal backdrop */
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Header bar */}
      <div className="flex shrink-0 items-center justify-between gap-4 bg-ink-950/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500/20 text-base">🔭</span>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{title}</p>
            <p className="text-[10px] text-slate-400 leading-tight">Drag to look around · scroll / pinch to zoom</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Close panorama viewer"
        >
          ✕
        </button>
      </div>

      {/* Canvas viewport */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* Hidden image element used as texture source */}
        <img
          ref={imgRef}
          src={src}
          alt=""
          aria-hidden="true"
          crossOrigin="anonymous"
          className="hidden"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />

        {/* Loading spinner */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 grid place-items-center text-slate-400">
            <div className="flex flex-col items-center gap-3">
              <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/15 border-t-brand-400" />
              <span className="text-sm">Loading panorama…</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {imgError && (
          <div className="absolute inset-0 grid place-items-center text-slate-400">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-4xl">⚠️</span>
              <p className="text-sm">Could not load the panorama image.</p>
            </div>
          </div>
        )}

        {/* The actual 360° canvas */}
        <canvas
          ref={canvasRef}
          className={`h-full w-full touch-none select-none ${
            stateRef.current.dragging ? 'cursor-grabbing' : 'cursor-grab'
          } ${imgLoaded ? 'block' : 'hidden'}`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-hidden="true"
        />
      </div>

      {/* Footer hint */}
      <div className="shrink-0 bg-ink-950/60 px-4 py-2 text-center text-[11px] text-slate-500">
        H Building · Campus Buddy 360°
      </div>
    </div>
  );
}
