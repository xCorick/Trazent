import type { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
  action?: ReactNode;
}

export function SectionTitle({ children, action }: SectionTitleProps) {
  return (
    <div className="tz-section-title">
      <h3>{children}</h3>
      {action}
    </div>
  );
}
