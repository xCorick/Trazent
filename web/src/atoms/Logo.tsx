import { colors } from '@/theme/tokens';

interface LogoProps {
  /** "dark" sobre fondos claros, "light" sobre fondos azules. */
  variant?: 'dark' | 'light';
  size?: number;
  showText?: boolean;
}

export function Logo({ variant = 'dark', size = 32, showText = true }: LogoProps) {
  const isLight = variant === 'light';
  const tile = isLight ? colors.white : colors.blue700;
  const mark = isLight ? colors.blue700 : colors.white;

  return (
    <span className="tz-logo" style={{ gap: Math.round(size * 0.3) }}>
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill={tile} />
        <circle
          cx="20"
          cy="20"
          r="13"
          fill="none"
          stroke={mark}
          strokeOpacity="0.45"
          strokeWidth="1.6"
          strokeDasharray="3 2.6"
        />
        <path
          d="M20 10.5c-3.6 0-6.4 2.8-6.4 6.3 0 4.6 6.4 11.2 6.4 11.2s6.4-6.6 6.4-11.2c0-3.5-2.8-6.3-6.4-6.3z"
          fill={mark}
        />
        <circle cx="20" cy="16.8" r="2.4" fill={tile} />
      </svg>
      {showText && (
        <span
          className="tz-logo__text"
          style={{ fontSize: Math.round(size * 0.62), color: isLight ? colors.white : colors.blue900 }}
        >
          Trazent
        </span>
      )}
    </span>
  );
}
