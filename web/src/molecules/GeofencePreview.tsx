import { colors } from '@/theme/tokens';
import { formatDistance } from '@/utils/format';

interface GeofencePreviewProps {
  radiusMeters: number;
  /** Radio que llena el dibujo; los radios mayores se dibujan al tope. */
  maxRadiusMeters?: number;
  size?: number;
  muted?: boolean;
}

/** Dibujo esquemático de una geocerca circular: el sitio al centro y su radio. */
export function GeofencePreview({
  radiusMeters,
  maxRadiusMeters = 500,
  size = 120,
  muted = false,
}: GeofencePreviewProps) {
  const center = size / 2;
  const maxR = center - 8;
  const ratio = Math.min(1, Math.max(0.18, radiusMeters / maxRadiusMeters));
  const r = maxR * ratio;
  const accent = muted ? colors.muted : colors.blue700;

  return (
    <svg
      className="tz-geofence"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Geocerca de ${formatDistance(radiusMeters)} de radio`}
    >
      <rect width={size} height={size} rx={14} fill={muted ? '#EEF1F5' : colors.blue50} />
      <g stroke={accent} strokeOpacity={0.12}>
        <line x1={0} y1={center} x2={size} y2={center} />
        <line x1={center} y1={0} x2={center} y2={size} />
      </g>
      <circle
        cx={center}
        cy={center}
        r={r}
        fill={accent}
        fillOpacity={0.12}
        stroke={accent}
        strokeWidth={2}
        strokeDasharray="6 5"
      />
      <line x1={center} y1={center} x2={center + r} y2={center} stroke={accent} strokeWidth={1.5} />
      <circle cx={center} cy={center} r={5} fill={accent} />
      <text x={center + r / 2} y={center - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={accent}>
        {formatDistance(radiusMeters)}
      </text>
    </svg>
  );
}
