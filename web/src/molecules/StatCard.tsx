import { Card, Skeleton } from 'antd';
import type { ReactNode } from 'react';
import { IconBadge } from '@/atoms';
import type { Tone } from '@/atoms';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value?: number | string;
  hint?: string;
  tone?: Tone;
  loading?: boolean;
}

export function StatCard({ icon, label, value, hint, tone = 'blue', loading }: StatCardProps) {
  return (
    <Card className="tz-stat">
      <div className="tz-stat__row">
        <IconBadge icon={icon} tone={tone} />
        <span className="tz-stat__label">{label}</span>
      </div>
      {loading ? (
        <Skeleton.Input active size="large" style={{ width: 90, marginTop: 14 }} />
      ) : (
        <div className="tz-stat__value">{value ?? '—'}</div>
      )}
      {hint && <div className="tz-stat__hint">{hint}</div>}
    </Card>
  );
}
