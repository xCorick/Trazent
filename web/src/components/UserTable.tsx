import { EditOutlined } from '@ant-design/icons';
import { Button, Space, Switch, Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { RoleTag, UserAvatar, UserStatusTag } from '@/atoms';
import { EmptyState } from '@/molecules';
import { UserStatus } from '@/types';
import type { User } from '@/types';

interface UserTableProps {
  users: User[];
  loading: boolean;
  currentUserId?: string;
  togglingId?: string | null;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User, active: boolean) => void;
}

/** Tabla de usuarios de la empresa (solo administrador). */
export function UserTable({ users, loading, currentUserId, togglingId, onEdit, onToggleStatus }: UserTableProps) {
  const columns: TableColumnsType<User> = [
    {
      title: 'Usuario',
      dataIndex: 'fullName',
      render: (_, user) => (
        <span className="tz-cell-user">
          <UserAvatar name={user.fullName} size={32} />
          <span className="tz-cell-user__text">
            <strong>{user.fullName}</strong>
            <small>{user.email}</small>
          </span>
        </span>
      ),
    },
    { title: 'Rol', dataIndex: 'role', width: 160, render: (_, user) => <RoleTag role={user.role} /> },
    {
      title: 'Especialidad / teléfono',
      key: 'extra',
      width: 220,
      render: (_, user) => <span className="tz-muted">{user.specialty ?? user.phoneNumber ?? '—'}</span>,
    },
    { title: 'Estado', dataIndex: 'status', width: 120, render: (_, user) => <UserStatusTag status={user.status} /> },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      align: 'right',
      render: (_, user) => {
        const isSelf = user.id === currentUserId;
        const active = user.status === UserStatus.Active;
        return (
          <Space>
            <Tooltip title="Editar">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(user)}
                aria-label={`Editar a ${user.fullName}`}
              />
            </Tooltip>
            <Tooltip title={isSelf ? 'No puedes desactivar tu propia cuenta' : active ? 'Desactivar' : 'Activar'}>
              <Switch
                size="small"
                checked={active}
                disabled={isSelf}
                loading={togglingId === user.id}
                onChange={(checked) => onToggleStatus(user, checked)}
                aria-label={active ? `Desactivar a ${user.fullName}` : `Activar a ${user.fullName}`}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <Table<User>
      rowKey="id"
      columns={columns}
      dataSource={users}
      loading={loading}
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      scroll={{ x: 820 }}
      className="tz-table"
      locale={{ emptyText: <EmptyState title="Sin usuarios" description="Cambia el filtro o crea un usuario." /> }}
    />
  );
}
