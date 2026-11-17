import { ReviewStatusTag, UserAvatar } from '@/atoms';
import type { Evidence } from '@/types';
import { formatDateTime } from '@/utils/format';

interface EvidenceCardProps {
  evidence: Evidence;
  onClick?: () => void;
  /** Oculta el nombre del contratista (vista móvil). */
  hideAuthor?: boolean;
}

export function EvidenceCard({ evidence, onClick, hideAuthor = false }: EvidenceCardProps) {
  return (
    <button type="button" className="tz-evidence-card" onClick={onClick} disabled={!onClick}>
      <div className="tz-evidence-card__media">
        <img src={evidence.fileUrl} alt={`Evidencia de ${evidence.taskTitle}`} loading="lazy" />
        <span className="tz-evidence-card__status">
          <ReviewStatusTag status={evidence.reviewStatus} />
        </span>
      </div>
      <div className="tz-evidence-card__body">
        <div className="tz-evidence-card__title">{evidence.taskTitle}</div>
        {!hideAuthor && (
          <div className="tz-evidence-card__author">
            <UserAvatar name={evidence.userName} size={24} />
            <span>{evidence.userName}</span>
          </div>
        )}
        <div className="tz-evidence-card__time">Subida {formatDateTime(evidence.uploadedAt)}</div>
        {evidence.reviewerComment && <div className="tz-evidence-card__note">“{evidence.reviewerComment}”</div>}
      </div>
    </button>
  );
}
