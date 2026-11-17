import { UserStatus } from '@/types';
import { StatusTag } from './StatusTag';

export function UserStatusTag({ status }: { status: UserStatus }) {
  if (status === UserStatus.Active) return <StatusTag tone="green">Activo</StatusTag>;
  if (status === UserStatus.Suspended) return <StatusTag tone="red">Suspendido</StatusTag>;
  return <StatusTag tone="gray">Inactivo</StatusTag>;
}
