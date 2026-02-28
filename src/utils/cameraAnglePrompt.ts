/**
 * Generate camera angle prompt from azimuth and elevation
 */

export interface CameraAngle {
  azimuth: number;   // -180 ~ 180, 0 = front
  elevation: number; // -90 ~ 90, 0 = eye level, 90 = top down
  zoom?: number;     // 1 ~ 10, default 5 (1=wide shot, 10=close-up)
}

export interface AnglePreset {
  label: string;
  azimuth: number;
  elevation: number;
}

export const ANGLE_PRESETS: AnglePreset[] = [
  { label: 'Front View', azimuth: 0, elevation: 0 },
  { label: 'Rear View', azimuth: 180, elevation: 0 },
  { label: 'Left Side', azimuth: -90, elevation: 0 },
  { label: 'Right Side', azimuth: 90, elevation: 0 },
  { label: 'Top Down', azimuth: 0, elevation: 90 },
  { label: 'Bottom Up', azimuth: 0, elevation: -90 },
  { label: "Bird's Eye 45°", azimuth: 0, elevation: 45 },
  { label: 'Low Angle', azimuth: 0, elevation: -30 },
];

function getHorizontalDescription(azimuth: number): string {
  const a = ((azimuth % 360) + 360) % 360; // normalize to 0-360
  const normalized = a > 180 ? a - 360 : a; // back to -180~180

  if (normalized >= -22 && normalized <= 22) return 'front view';
  if (normalized > 22 && normalized < 68) return 'front-right three-quarter view';
  if (normalized >= 68 && normalized <= 112) return 'right side view';
  if (normalized > 112 && normalized < 158) return 'rear-right three-quarter view';
  if (normalized >= 158 || normalized <= -158) return 'rear view';
  if (normalized > -158 && normalized < -112) return 'rear-left three-quarter view';
  if (normalized >= -112 && normalized <= -68) return 'left side view';
  return 'front-left three-quarter view'; // -68 < a < -22
}

function getVerticalDescription(elevation: number): string {
  if (elevation > 70) return 'top-down overhead shot';
  if (elevation > 45) return 'high angle shot';
  if (elevation > 20) return 'slightly elevated angle';
  if (elevation >= -20) return 'eye-level shot';
  if (elevation >= -45) return 'slightly low angle';
  if (elevation >= -70) return 'low angle shot';
  return "worm's eye view";
}

function getZoomDescription(zoom: number): string {
  if (zoom <= 2) return 'extreme wide shot';
  if (zoom <= 3) return 'wide shot';
  if (zoom <= 5) return 'medium shot';
  if (zoom <= 7) return 'medium close-up';
  if (zoom <= 9) return 'close-up shot';
  return 'extreme close-up';
}

export function generateAnglePrompt(angle: CameraAngle): string {
  const zoom = angle.zoom ?? 5;
  const parts = [
    getHorizontalDescription(angle.azimuth),
    getVerticalDescription(angle.elevation),
    ...(zoom === 5 ? [] : [getZoomDescription(zoom)]),
    `camera azimuth ${angle.azimuth}°, elevation ${angle.elevation}°, zoom ${zoom}`,
  ];
  return parts.join(', ');
}

export function getAngleLabel(angle: CameraAngle): string {
  const h = getHorizontalDescription(angle.azimuth);
  const v = getVerticalDescription(angle.elevation);
  return `${h}, ${v}`;
}
