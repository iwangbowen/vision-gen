/**
 * 根据方位角 (azimuth) 和仰角 (elevation) 生成摄影角度提示词
 */

export interface CameraAngle {
  azimuth: number;   // -180 ~ 180, 0 = 正前方
  elevation: number; // -90 ~ 90, 0 = 平视, 90 = 俯视
}

export interface AnglePreset {
  label: string;
  azimuth: number;
  elevation: number;
}

export const ANGLE_PRESETS: AnglePreset[] = [
  { label: '正面平视', azimuth: 0, elevation: 0 },
  { label: '背面', azimuth: 180, elevation: 0 },
  { label: '左侧', azimuth: -90, elevation: 0 },
  { label: '右侧', azimuth: 90, elevation: 0 },
  { label: '俯视', azimuth: 0, elevation: 90 },
  { label: '仰视', azimuth: 0, elevation: -90 },
  { label: '鸟瞰 45°', azimuth: 0, elevation: 45 },
  { label: '低角度', azimuth: 0, elevation: -30 },
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

export function generateAnglePrompt(angle: CameraAngle): string {
  const parts: string[] = [];
  parts.push(getHorizontalDescription(angle.azimuth));
  parts.push(getVerticalDescription(angle.elevation));
  parts.push(`camera azimuth ${angle.azimuth}°, elevation ${angle.elevation}°`);
  return parts.join(', ');
}

export function getAngleLabel(angle: CameraAngle): string {
  const h = getHorizontalDescription(angle.azimuth);
  const v = getVerticalDescription(angle.elevation);
  return `${h}, ${v}`;
}
