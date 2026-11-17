import { Empty } from 'antd';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Empty
      className="tz-empty"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span>
          <strong>{title}</strong>
          {description && <span className="tz-empty__desc">{description}</span>}
        </span>
      }
    >
      {action}
    </Empty>
  );
}
