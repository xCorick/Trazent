import type { ReactNode } from 'react';
import type { Tone } from './StatusTag';

interface IconBadgeProps {
  icon: ReactNode;
  tone?: Tone;
  size?: number;
}

/** Ícono dentro de un círculo de color suave. */
export function IconBadge({ icon, tone = 'blue', size = 44 }: IconBadgeProps) {
  return (
    <span
      className={`tz-icon-badge tz-icon-badge--${tone}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {icon}
    </span>
  );
}
