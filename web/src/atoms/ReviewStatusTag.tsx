import { CheckOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { ReviewStatus } from '@/types';
import { StatusTag } from './StatusTag';

export function ReviewStatusTag({ status }: { status: ReviewStatus }) {
  if (status === ReviewStatus.Approved) {
    return (
      <StatusTag tone="green" icon={<CheckOutlined />}>
        Aprobada
      </StatusTag>
    );
  }
  if (status === ReviewStatus.Rejected) {
    return (
      <StatusTag tone="red" icon={<CloseOutlined />}>
        Rechazada
      </StatusTag>
    );
  }
  return (
    <StatusTag tone="orange" icon={<ClockCircleOutlined />}>
      Por revisar
    </StatusTag>
  );
}
