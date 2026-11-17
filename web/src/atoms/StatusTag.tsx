import { Tag } from 'antd';
import type { ReactNode } from 'react';

export type Tone = 'blue' | 'green' | 'orange' | 'red' | 'gray';

interface StatusTagProps {
  tone: Tone;
  icon?: ReactNode;
  children: ReactNode;
}

/** Etiqueta de estado base: el color siempre va acompañado de texto. */
export function StatusTag({ tone, icon, children }: StatusTagProps) {
  return (
    <Tag bordered={false} icon={icon} className={`tz-tag tz-tag--${tone}`}>
      {children}
    </Tag>
  );
}
