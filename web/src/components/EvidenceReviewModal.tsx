import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Form, Image, Input, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { ReviewStatusTag } from '@/atoms';
import { ReviewStatus } from '@/types';
import type { Evidence } from '@/types';
import { formatDateTime } from '@/utils/format';

interface EvidenceReviewModalProps {
  evidence: Evidence | null;
  loading: boolean;
  onClose: () => void;
  onReview: (approve: boolean, comment?: string) => Promise<void>;
}

/** Revisión de una evidencia: aprobar, o rechazar explicando el motivo. */
export function EvidenceReviewModal({ evidence, loading, onClose, onReview }: EvidenceReviewModalProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    setComment('');
    setError(null);
    setDecision(null);
  }, [evidence?.id]);

  if (!evidence) return null;
  const isPending = evidence.reviewStatus === ReviewStatus.Pending;

  const submit = async (approve: boolean) => {
    if (!approve && !comment.trim()) {
      setError('Escribe el motivo del rechazo; el contratista lo recibirá como notificación.');
      return;
    }
    setDecision(approve ? 'approve' : 'reject');
    await onReview(approve, comment.trim() || undefined);
  };

  const footer = isPending
    ? [
        <Button
          key="reject"
          danger
          icon={<CloseOutlined />}
          loading={loading && decision === 'reject'}
          disabled={loading}
          onClick={() => void submit(false)}
        >
          Rechazar
        </Button>,
        <Button
          key="approve"
          type="primary"
          icon={<CheckOutlined />}
          loading={loading && decision === 'approve'}
          disabled={loading}
          onClick={() => void submit(true)}
        >
          Aprobar
        </Button>,
      ]
    : [
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
      ];

  return (
    <Modal open title="Revisar evidencia" onCancel={onClose} footer={footer} width={640} className="tz-review-modal">
      <div className="tz-review-modal__media">
        <Image src={evidence.fileUrl} alt={`Evidencia de ${evidence.taskTitle}`} />
      </div>
      <Descriptions column={1} size="small" className="tz-review-modal__details">
        <Descriptions.Item label="Tarea">{evidence.taskTitle}</Descriptions.Item>
        <Descriptions.Item label="Contratista">{evidence.userName}</Descriptions.Item>
        <Descriptions.Item label="Capturada">{formatDateTime(evidence.capturedAtDevice)}</Descriptions.Item>
        <Descriptions.Item label="Estado">
          <ReviewStatusTag status={evidence.reviewStatus} />
        </Descriptions.Item>
        {evidence.comment && <Descriptions.Item label="Nota del contratista">{evidence.comment}</Descriptions.Item>}
      </Descriptions>

      {isPending ? (
        <Form layout="vertical">
          <Form.Item
            label="Comentario (obligatorio al rechazar)"
            validateStatus={error ? 'error' : undefined}
            help={error ?? undefined}
          >
            <Input.TextArea
              rows={3}
              maxLength={500}
              value={comment}
              placeholder="Ej. La foto no muestra el área completa."
              onChange={(event) => {
                setComment(event.target.value);
                if (error) setError(null);
              }}
            />
          </Form.Item>
        </Form>
      ) : (
        <Alert
          type={evidence.reviewStatus === ReviewStatus.Approved ? 'success' : 'warning'}
          showIcon
          message={`${evidence.reviewStatus === ReviewStatus.Approved ? 'Aprobada' : 'Rechazada'} por ${evidence.reviewerName ?? 'el supervisor'}${
            evidence.reviewedAt ? ` · ${formatDateTime(evidence.reviewedAt)}` : ''
          }`}
          description={evidence.reviewerComment}
        />
      )}
    </Modal>
  );
}
