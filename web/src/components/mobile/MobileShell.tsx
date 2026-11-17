import { CloudOutlined, DisconnectOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { Dropdown, Grid } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { Logo, UserAvatar } from '@/atoms';
import { useAuth } from '@/context/AuthContext';
import { paths } from '@/routes/paths';
import { firstName } from '@/utils/format';
import { BottomNav, TopNav } from './BottomNav';
import { ConnectivityProvider, useConnectivity } from './ConnectivityContext';

function ConnectionPill() {
  const { offline, toggle } = useConnectivity();
  return (
    <button
      type="button"
      className={`tz-connection${offline ? ' is-offline' : ''}`}
      onClick={toggle}
      title="Haz clic para simular la pérdida de señal"
    >
      {offline ? <DisconnectOutlined /> : <CloudOutlined />}
      {offline ? 'Sin conexión' : 'En línea'}
    </button>
  );
}

function AppHeader({ wide }: { wide: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu: MenuProps = {
    items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar sesión', danger: true }],
    onClick: () => void logout().then(() => navigate(paths.login, { replace: true })),
  };

  return (
    <header className="tz-app__header">
      <div className="tz-app__header-inner">
        <Logo size={wide ? 30 : 28} />
        {wide && <TopNav />}
        <div className="tz-app__header-actions">
          <ConnectionPill />
          {user && (
            <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
              <button type="button" className="tz-app__account" aria-label="Opciones de la cuenta">
                <UserAvatar name={user.fullName} size={32} variant="solid" />
                {wide && (
                  <>
                    <span className="tz-app__account-name">{firstName(user.fullName)}</span>
                    <DownOutlined className="tz-app__account-caret" />
                  </>
                )}
              </button>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * PROTOTIPO MÓVIL · App del contratista como web responsiva: en el teléfono (o con la vista móvil
 * del inspector) muestra la barra de pestañas inferior; en pantallas grandes, la
 * navegación pasa a la cabecera. En producción será la app de React Native + Expo.
 */
export function MobileShell() {
  const screens = Grid.useBreakpoint();
  const wide = Boolean(screens.md);

  return (
    <ConnectivityProvider>
      <div className={`tz-app${wide ? '' : ' has-bottom-nav'}`}>
        <AppHeader wide={wide} />
        <main className="tz-app__main">
          <Outlet />
        </main>
        {!wide && <BottomNav />}
      </div>
    </ConnectivityProvider>
  );
}
