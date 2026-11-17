import { CameraOutlined, EnvironmentOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Logo } from '@/atoms';
import { LoginForm } from '@/components';
import { env } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { demoAccounts } from '@/mocks/demoAccounts';
import { homeFor } from '@/routes/paths';
import { errorMessage } from '@/services/apiError';
import type { LoginRequest } from '@/types';

const highlights = [
  { icon: <CameraOutlined />, text: 'Asistencia con foto, GPS y hora del servidor' },
  { icon: <EnvironmentOutlined />, text: 'Validación automática de geocercas' },
  { icon: <SafetyCertificateOutlined />, text: 'Evidencias revisadas en un solo lugar' },
];

export function LoginView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const handleSubmit = async (values: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await login(values);
      navigate(homeFor(loggedUser.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="tz-login">
      <section className="tz-login__brand" aria-hidden="true">
        <svg className="tz-login__decor" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="290" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="2" />
          <circle
            cx="300"
            cy="300"
            r="205"
            fill="#FFFFFF"
            fillOpacity="0.05"
            stroke="#FFFFFF"
            strokeOpacity="0.45"
            strokeWidth="3"
            strokeDasharray="14 12"
          />
          <circle cx="300" cy="300" r="115" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="2" />
          <path d="M300 228c-30 0-52 22-52 52 0 38 52 88 52 88s52-50 52-88c0-30-22-52-52-52z" fill="#FFFFFF" />
          <circle cx="300" cy="280" r="18" fill="#1D4ED8" />
        </svg>
        <div className="tz-login__brand-content">
          <Logo variant="light" size={44} />
          <h1>Asistencia verificable, incluso sin señal.</h1>
          <p>Controla la asistencia, las tareas y las evidencias de tu personal externo desde un solo lugar.</p>
          <ul className="tz-login__highlights">
            {highlights.map((item) => (
              <li key={item.text}>
                <span>{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="tz-login__form-side">
        <div className="tz-login__card">
          <div className="tz-login__mobile-logo">
            <Logo size={38} />
          </div>
          <h2>Inicia sesión</h2>
          <p className="tz-login__subtitle">Usa la cuenta que te dio tu empresa.</p>
          <LoginForm
            onSubmit={(values) => void handleSubmit(values)}
            loading={loading}
            error={error}
            demoAccounts={env.useMocks ? demoAccounts : undefined}
          />
        </div>
      </section>
    </div>
  );
}
