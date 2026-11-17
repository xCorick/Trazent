import {
  BarChartOutlined,
  CarryOutOutlined,
  DashboardOutlined,
  DownOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
  MenuOutlined,
  PictureOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Dropdown, Grid, Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo, UserAvatar } from '@/atoms';
import { useAuth } from '@/context/AuthContext';
import { paths } from '@/routes/paths';
import { Role } from '@/types';
import { roleLabel } from '@/utils/format';

const operationItems: NonNullable<MenuProps['items']> = [
  { key: paths.panel, icon: <DashboardOutlined />, label: 'Inicio' },
  { key: paths.panelTasks, icon: <CarryOutOutlined />, label: 'Tareas' },
  { key: paths.panelEvidences, icon: <PictureOutlined />, label: 'Evidencias' },
  { key: paths.panelReports, icon: <BarChartOutlined />, label: 'Reportes' },
];

const adminItems: NonNullable<MenuProps['items']> = [
  { key: paths.panelUsers, icon: <TeamOutlined />, label: 'Usuarios' },
  { key: paths.panelSites, icon: <EnvironmentOutlined />, label: 'Sitios y geocercas' },
];

/** El menú depende del rol: el administrador ve además la sección de administración. */
function menuFor(role?: Role): MenuProps['items'] {
  if (role !== Role.Admin) return operationItems;
  return [
    { type: 'group', key: 'operation', label: 'Operación', children: operationItems },
    { type: 'group', key: 'admin', label: 'Administración', children: adminItems },
  ];
}

const menuKeys = [paths.panelTasks, paths.panelEvidences, paths.panelReports, paths.panelUsers, paths.panelSites];

/** Estructura del panel web: menú lateral en escritorio y cajón en móvil. */
export function PanelLayout() {
  const screens = Grid.useBreakpoint();
  const isDesktop = Boolean(screens.lg);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const menuItems = useMemo(() => menuFor(user?.role), [user?.role]);

  const selectedKey = menuKeys.find((key) => pathname.startsWith(key)) ?? paths.panel;

  const handleMenu: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const userMenu: MenuProps = {
    items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar sesión', danger: true }],
    onClick: ({ key }) => {
      if (key === 'logout') void logout().then(() => navigate(paths.login, { replace: true }));
    },
  };

  const navigation = (
    <div className="tz-sider">
      <div className="tz-sider__brand">
        <Logo variant="light" size={34} />
      </div>
      <Menu theme="dark" mode="inline" items={menuItems} selectedKeys={[selectedKey]} onClick={handleMenu} />
      <div className="tz-sider__footer">Panel web · Datos simulados</div>
    </div>
  );

  return (
    <Layout className="tz-panel">
      {isDesktop ? (
        <Layout.Sider width={248} className="tz-panel__sider">
          {navigation}
        </Layout.Sider>
      ) : (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={264}
          closable={false}
          className="tz-panel__drawer"
          styles={{ body: { padding: 0 } }}
        >
          {navigation}
        </Drawer>
      )}

      <Layout>
        <Layout.Header className="tz-panel__header">
          {!isDesktop && (
            <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} aria-label="Abrir menú" />
          )}
          {!isDesktop && <Logo size={28} />}
          <div className="tz-panel__header-spacer" />
          {user && (
            <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
              <button type="button" className="tz-user-chip">
                <UserAvatar name={user.fullName} size={34} variant="solid" />
                <span className="tz-user-chip__text">
                  <strong>{user.fullName}</strong>
                  <small>{roleLabel(user.role)}</small>
                </span>
                <DownOutlined className="tz-user-chip__caret" />
              </button>
            </Dropdown>
          )}
        </Layout.Header>
        <Layout.Content className="tz-panel__content">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
