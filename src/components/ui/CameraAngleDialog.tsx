import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Globe, RotateCcw } from 'lucide-react';
import { generateAnglePrompt, ANGLE_PRESETS, type CameraAngle } from '../../utils/cameraAnglePrompt';

interface CameraAngleDialogProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onConfirm: (prompt: string) => void;
}

/** Orbit & scene sizing constants */
const ORBIT_RX = 200;    // horizontal orbit ellipse radius
const ORBIT_RY = 80;     // vertical orbit ellipse radius (foreshortened)
const ARC_R = 180;        // vertical arc radius
const IMG_W = 160;        // image display width
const IMG_H = 100;        // image display height
const SCENE_W = 520;
const SCENE_H = 420;
const CX = SCENE_W / 2;
const CY = SCENE_H / 2 - 10;
const HANDLE_R = 7;

export default function CameraAngleDialog({ isOpen, imageUrl, onClose, onConfirm }: CameraAngleDialogProps) {
  const [angle, setAngle] = useState<CameraAngle>({ azimuth: 45, elevation: -30, zoom: 5 });
  const [dragging, setDragging] = useState<'orbit' | 'arc' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const prompt = generateAnglePrompt(angle);
  const zoom = angle.zoom ?? 5;

  const clampElevation = (v: number) => Math.max(-90, Math.min(90, v));
  const wrapAzimuth = (v: number) => {
    let a = v % 360;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    return Math.round(a);
  };

  // ---- Compute positions ----
  // Orbit handle: on the horizontal ellipse at azimuth angle
  const azRad = (angle.azimuth * Math.PI) / 180;
  const orbitHandleX = CX + ORBIT_RX * Math.sin(azRad);
  const orbitHandleY = CY + 100 + ORBIT_RY * Math.cos(azRad);

  // Vertical arc handle: on a circle at elevation angle, anchored from left side
  const elRad = (angle.elevation * Math.PI) / 180;
  const arcHandleX = CX + ARC_R * Math.sin(-azRad) * Math.cos(elRad);
  const arcHandleY = CY - ARC_R * Math.sin(elRad);

  // Line from center-bottom of image to orbit handle
  const imgCenterX = CX;
  const imgBottomY = CY + IMG_H / 2 + 8;

  // ---- Build orbit ellipse path (full 360° on horizontal plane) ----
  const orbitPath = useMemo(() => {
    const points: string[] = [];
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const x = CX + ORBIT_RX * Math.sin(a);
      const y = CY + 100 + ORBIT_RY * Math.cos(a);
      points.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
    }
    return points.join(' ') + ' Z';
  }, []);

  // ---- Build vertical arc path (semicircle from bottom through top) ----
  const arcPath = useMemo(() => {
    const points: string[] = [];
    // Arc goes from -90° (bottom) through 0° (front) to 90° (top)
    for (let i = 0; i <= 36; i++) {
      const el = -90 + (i / 36) * 180;
      const er = (el * Math.PI) / 180;
      const x = CX + ARC_R * Math.sin(-azRad) * Math.cos(er);
      const y = CY - ARC_R * Math.sin(er);
      points.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
    }
    return points.join(' ');
  }, [azRad]);

  // ---- Drag handlers ----
  const getSVGPoint = useCallback((e: React.PointerEvent | PointerEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (SCENE_W / rect.width),
      y: (e.clientY - rect.top) * (SCENE_H / rect.height),
    };
  }, []);

  const handleOrbitPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setDragging('orbit');
    (e.target as SVGElement).setPointerCapture(e.pointerId);
  }, []);

  const handleArcPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setDragging('arc');
    (e.target as SVGElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const pt = getSVGPoint(e);

    if (dragging === 'orbit') {
      // Project pointer to angle on ellipse
      const dx = pt.x - CX;
      const dy = pt.y - (CY + 100);
      const a = Math.atan2(dx, dy) * (180 / Math.PI);
      setAngle(prev => ({ ...prev, azimuth: wrapAzimuth(Math.round(a)) }));
    } else if (dragging === 'arc') {
      // Project pointer to elevation angle
      const dx = pt.x - CX;
      const dy = -(pt.y - CY); // invert Y
      const el = Math.atan2(dy, Math.abs(dx) || 1) * (180 / Math.PI);
      setAngle(prev => ({ ...prev, elevation: clampElevation(Math.round(el)) }));
    }
  }, [dragging, getSVGPoint]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      const step = e.shiftKey ? 15 : 5;
      if (e.key === 'ArrowLeft') setAngle(p => ({ ...p, azimuth: wrapAzimuth(p.azimuth - step) }));
      if (e.key === 'ArrowRight') setAngle(p => ({ ...p, azimuth: wrapAzimuth(p.azimuth + step) }));
      if (e.key === 'ArrowUp') setAngle(p => ({ ...p, elevation: clampElevation(p.elevation + step) }));
      if (e.key === 'ArrowDown') setAngle(p => ({ ...p, elevation: clampElevation(p.elevation - step) }));
    };
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 3D transform for the image card — zoom scales image size
  const zoomScale = 0.6 + (zoom / 10) * 0.8; // range 0.7 ~ 1.4
  const imageTransform = `perspective(800px) rotateY(${-angle.azimuth * 0.3}deg) rotateX(${angle.elevation * 0.2}deg) scale(${zoomScale})`;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div
        className="flex flex-col bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        onPointerDown={e => e.stopPropagation()}
        style={{ width: SCENE_W + 40 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#222]">
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 transition-colors">
            <X size={14} className="text-white/60" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-white/90 text-xs font-mono">
            H:{angle.azimuth} V:{angle.elevation} zoom:{zoom}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAngle({ azimuth: 45, elevation: -30, zoom: 5 })}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title="Reset"
            >
              <RotateCcw size={13} className="text-white/60" />
            </button>
            <button
              onClick={() => setAngle(p => ({ ...p }))}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title="Presets"
            >
              <Globe size={13} className="text-white/60" />
            </button>
            <button
              onClick={() => onConfirm(prompt)}
              className="p-1.5 rounded-md bg-accent hover:bg-accent/90 transition-colors"
              title="Apply & Generate"
            >
              <Check size={13} className="text-white" />
            </button>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="relative select-none" style={{ height: SCENE_H + 80 }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
            className="absolute inset-0 w-full"
            style={{ height: SCENE_H }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Orbit ellipse */}
            <path d={orbitPath} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

            {/* Vertical arc */}
            <path d={arcPath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

            {/* Connection line: image bottom to orbit handle */}
            <line
              x1={imgCenterX} y1={imgBottomY}
              x2={orbitHandleX} y2={orbitHandleY}
              stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 3"
            />

            {/* Connection line: image center to arc handle */}
            <line
              x1={CX} y1={CY}
              x2={arcHandleX} y2={arcHandleY}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3"
            />

            {/* Image center anchor (small dot beneath image) */}
            <circle cx={imgCenterX} cy={imgBottomY} r={3} fill="rgba(255,255,255,0.4)" />

            {/* Orbit handle (draggable) */}
            <circle
              cx={orbitHandleX} cy={orbitHandleY} r={HANDLE_R}
              fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={handleOrbitPointerDown}
            />

            {/* Arc handle (draggable) */}
            <circle
              cx={arcHandleX} cy={arcHandleY} r={HANDLE_R}
              fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={handleArcPointerDown}
            />
          </svg>

          {/* Image card floating in 3D space */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: CX - IMG_W / 2,
              top: CY - IMG_H / 2 - 20,
              width: IMG_W,
              height: IMG_H,
              transform: imageTransform,
              transition: dragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <img
              src={imageUrl}
              alt="subject"
              className="w-full h-full object-cover rounded-lg shadow-2xl"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            />
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/40">
            Drag anchor to adjust camera position and angle
          </div>

          {/* Zoom slider (vertical, right side) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <span className="text-[9px] text-white/40 font-mono">Far</span>
            <input
              type="range"
              min={1} max={10} step={1}
              value={zoom}
              onChange={e => setAngle(prev => ({ ...prev, zoom: Number(e.target.value) }))}
              className="h-28 appearance-none accent-accent cursor-pointer"
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
            />
            <span className="text-[9px] text-white/40 font-mono">Near</span>
          </div>
        </div>

        {/* Presets row */}
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-white/5">
          {ANGLE_PRESETS.map(preset => {
            const isActive = angle.azimuth === preset.azimuth && angle.elevation === preset.elevation;
            return (
              <button
                key={preset.label}
                onClick={() => setAngle({ azimuth: preset.azimuth, elevation: preset.elevation })}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  isActive
                    ? 'bg-accent/20 text-accent'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Generated prompt */}
        <div className="px-4 py-2 border-t border-white/5">
          <div className="px-3 py-1.5 rounded-lg bg-white/5 text-[11px] text-white/70 font-mono select-all leading-relaxed">
            {prompt}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
