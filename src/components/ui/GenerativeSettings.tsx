import {
  GRID_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  IMAGE_SIZE_OPTIONS,
  IMAGE_STYLE_OPTIONS,
} from '../../utils/constants';

export interface GenerativeSettingsValues {
  gridSize: string;
  aspectRatio: string;
  imageSize: string;
  style: string;
}

interface GenerativeSettingsProps {
  readonly gridSize: string;
  readonly aspectRatio: string;
  readonly imageSize: string;
  readonly style: string;
  readonly onChange: (key: keyof GenerativeSettingsValues, value: string) => void;
}

export default function GenerativeSettings({ gridSize, aspectRatio, imageSize, style, onChange }: GenerativeSettingsProps) {
  const optionButtonClass = (active: boolean) =>
    `px-2 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
      active
        ? 'bg-accent text-white dark:text-black shadow-sm'
        : 'bg-canvas-bg dark:bg-canvas-bg-dark text-text-secondary dark:text-text-secondary-dark border border-border dark:border-border-dark hover:border-accent/50 hover:text-text-primary dark:hover:text-text-primary-dark'
    }`;

  return (
    <div className="space-y-3">
      {/* Grid size selector */}
      <div>
        <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1">
          生成规格
        </p>
        <div className="flex gap-1 flex-wrap">
          {GRID_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange('gridSize', opt.value)}
              className={optionButtonClass((gridSize || '1x1') === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio selector */}
      <div>
        <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1">
          画面比例
        </p>
        <div className="flex gap-1 flex-wrap">
          {ASPECT_RATIO_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange('aspectRatio', opt.value)}
              className={optionButtonClass((aspectRatio || '16:9') === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Size selector */}
      <div>
        <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1">
          图片尺寸
        </p>
        <div className="flex gap-1 flex-wrap">
          {IMAGE_SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange('imageSize', opt.value)}
              className={optionButtonClass((imageSize || '1k') === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Style selector */}
      <div>
        <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark mb-1">
          画面风格
        </p>
        <div className="flex gap-1 flex-wrap">
          {IMAGE_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange('style', opt.value)}
              className={optionButtonClass((style || '') === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
