import { CrownOutlined, SafetyCertificateOutlined, ToolOutlined } from '@ant-design/icons';
import { Role } from '@/types';
import { roleLabel } from '@/utils/format';
import { StatusTag } from './StatusTag';

export function RoleTag({ role }: { role: Role }) {
  if (role === Role.Admin) {
    return (
      <StatusTag tone="blue" icon={<CrownOutlined />}>
        {roleLabel(role)}
      </StatusTag>
    );
  }
  if (role === Role.Supervisor) {
    return (
      <StatusTag tone="gray" icon={<SafetyCertificateOutlined />}>
        {roleLabel(role)}
      </StatusTag>
    );
  }
  return (
    <StatusTag tone="gray" icon={<ToolOutlined />}>
      {roleLabel(role)}
    </StatusTag>
  );
}
