import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input } from 'antd';
import { DemoAccountList } from '@/molecules';
import type { DemoAccount } from '@/mocks/demoAccounts';
import type { LoginRequest } from '@/types';

interface LoginFormProps {
  onSubmit: (values: LoginRequest) => void;
  loading: boolean;
  error?: string | null;
  /** Solo en el prototipo (modo mock). */
  demoAccounts?: DemoAccount[];
}

export function LoginForm({ onSubmit, loading, error, demoAccounts }: LoginFormProps) {
  const [form] = Form.useForm<LoginRequest>();

  const fillDemo = (account: DemoAccount) => {
    form.setFieldsValue({ email: account.email, password: account.password });
    form.submit();
  };

  return (
    <>
      <Form<LoginRequest>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onSubmit}
        size="large"
        className="tz-login-form"
      >
        {error && <Alert type="error" showIcon message={error} className="tz-login-form__alert" />}
        <Form.Item
          name="email"
          label="Correo electrónico"
          rules={[
            { required: true, message: 'Escribe tu correo.' },
            { type: 'email', message: 'El correo no es válido.' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="nombre@empresa.com" autoComplete="email" />
        </Form.Item>
        <Form.Item name="password" label="Contraseña" rules={[{ required: true, message: 'Escribe tu contraseña.' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Tu contraseña" autoComplete="current-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Iniciar sesión
        </Button>
      </Form>
      {demoAccounts && demoAccounts.length > 0 && (
        <DemoAccountList accounts={demoAccounts} onSelect={fillDemo} disabled={loading} />
      )}
    </>
  );
}
