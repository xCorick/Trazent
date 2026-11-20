import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Card, Input, Segmented, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { UserFormModal, UserTable } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useCreateUser, useUpdateUser, useUsers } from '@/features/admin';
import { PageHeader } from '@/molecules';
import { errorMessage } from '@/services/apiError';
import { Role, UserStatus } from '@/types';
import type { CreateUserRequest, User } from '@/types';

type Filter = 'all' | Role;

const filterOptions: { label: string; value: Filter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Administradores', value: Role.Admin },
  { label: 'Supervisores', value: Role.Supervisor },
  { label: 'Contratistas', value: Role.Contractor },
];

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Administración de usuarios: alta, edición y activación (solo administrador). */
export function UsersView() {
  const { message, modal } = App.useApp();
  const { user: currentUser } = useAuth();
  const users = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const visibleUsers = useMemo(() => {
    const term = normalize(search.trim());
    return (users.data ?? []).filter(
      (user) =>
        (filter === 'all' || user.role === filter) &&
        (!term || normalize(`${user.fullName} ${user.email}`).includes(term)),
    );
  }, [users.data, filter, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setModalOpen(true);
  };

  const handleSubmit = async (values: CreateUserRequest) => {
    try {
      if (editing) {
        await updateUser.mutateAsync({ id: editing.id, ...values });
        message.success('Usuario actualizado.');
      } else {
        const { user, temporaryPassword } = await createUser.mutateAsync(values);
        modal.success({
          title: 'Usuario creado',
          content: (
            <div className="tz-temp-password">
              <p>
                Comparte estos datos con <strong>{user.fullName}</strong>. La contraseña solo se muestra esta vez.
              </p>
              <p>
                Correo: <Typography.Text copyable>{user.email}</Typography.Text>
              </p>
              <p>
                Contraseña temporal:{' '}
                <Typography.Text code copyable>
                  {temporaryPassword}
                </Typography.Text>
              </p>
            </div>
          ),
          okText: 'Entendido',
        });
      }
      setModalOpen(false);
      return true;
    } catch (err) {
      message.error(errorMessage(err));
      return false;
    }
  };

  const handleToggle = async (user: User, active: boolean) => {
    setTogglingId(user.id);
    try {
      await updateUser.mutateAsync({ id: user.id, status: active ? UserStatus.Active : UserStatus.Inactive });
      message.success(active ? `${user.fullName} puede volver a iniciar sesión.` : `${user.fullName} fue desactivado.`);
    } catch (err) {
      message.error(errorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="tz-page">
      <PageHeader
        title="Usuarios"
        subtitle="Da de alta a supervisores y contratistas, y controla quién puede entrar."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo usuario
          </Button>
        }
      />

      <Card className="tz-card">
        <div className="tz-toolbar">
          <Segmented options={filterOptions} value={filter} onChange={(value) => setFilter(value as Filter)} />
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por nombre o correo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="tz-toolbar__search"
          />
        </div>
        <UserTable
          users={visibleUsers}
          loading={users.isLoading}
          currentUserId={currentUser?.id}
          togglingId={togglingId}
          onEdit={openEdit}
          onToggleStatus={(user, active) => void handleToggle(user, active)}
        />
      </Card>

      <UserFormModal
        open={modalOpen}
        user={editing}
        loading={createUser.isPending || (updateUser.isPending && !togglingId)}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
