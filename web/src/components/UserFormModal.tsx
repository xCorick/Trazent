import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import { Role } from '@/types';
import type { CreateUserRequest, User } from '@/types';
import { roleLabel } from '@/utils/format';

interface UserFormModalProps {
  open: boolean;
  /** Si viene, el formulario edita a ese usuario; si no, crea uno nuevo. */
  user?: User | null;
  loading: boolean;
  onCancel: () => void;
  /** Devuelve true si se guardó, para cerrar y limpiar el formulario. */
  onSubmit: (values: CreateUserRequest) => Promise<boolean>;
}

const roleOptions = [Role.Admin, Role.Supervisor, Role.Contractor].map((role) => ({
  value: role,
  label: roleLabel(role),
}));

/** Alta y edición de usuarios (solo administrador). */
export function UserFormModal({ open, user, loading, onCancel, onSubmit }: UserFormModalProps) {
  const [form] = Form.useForm<CreateUserRequest>();
  const role = Form.useWatch('role', form);
  const isEdit = Boolean(user);

  useEffect(() => {
    if (!open) return;
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        specialty: user.specialty,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ role: Role.Contractor });
    }
  }, [open, user, form]);

  const handleFinish = async (values: CreateUserRequest) => {
    const saved = await onSubmit(values);
    if (saved) form.resetFields();
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      okText={isEdit ? 'Guardar cambios' : 'Crear usuario'}
      cancelText="Cancelar"
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={loading}
      forceRender
      width={560}
    >
      <Form<CreateUserRequest> form={form} layout="vertical" requiredMark="optional" onFinish={handleFinish}>
        <Form.Item
          name="fullName"
          label="Nombre completo"
          rules={[
            { required: true, message: 'Escribe el nombre.' },
            { max: 150, message: 'Máximo 150 caracteres.' },
          ]}
        >
          <Input placeholder="Ej. Carlos Ruiz" autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Correo electrónico"
          extra={isEdit ? undefined : 'Con este correo iniciará sesión.'}
          rules={[
            { required: true, message: 'Escribe el correo.' },
            { type: 'email', message: 'El correo no es válido.' },
          ]}
        >
          <Input placeholder="nombre@empresa.com" autoComplete="off" />
        </Form.Item>
        <div className="tz-form-row">
          <Form.Item name="role" label="Rol" rules={[{ required: true, message: 'Elige el rol.' }]}>
            <Select options={roleOptions} />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Teléfono">
            <Input placeholder="Opcional" />
          </Form.Item>
        </div>
        {role === Role.Contractor && (
          <Form.Item name="specialty" label="Especialidad">
            <Input placeholder="Ej. Limpieza, seguridad, mantenimiento" maxLength={100} />
          </Form.Item>
        )}
        {!isEdit && (
          <p className="tz-form-note">
            Se generará una contraseña temporal para que el usuario inicie sesión por primera vez.
          </p>
        )}
      </Form>
    </Modal>
  );
}
