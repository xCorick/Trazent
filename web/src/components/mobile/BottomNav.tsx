import { CameraOutlined, CarryOutOutlined, HomeOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';
import { paths } from '@/routes/paths';

const items = [
  { to: paths.mobile, label: 'Inicio', icon: <HomeOutlined />, end: true },
  { to: paths.mobileAttendance, label: 'Asistencia', icon: <CameraOutlined />, end: false },
  { to: paths.mobileTasks, label: 'Mis tareas', icon: <CarryOutOutlined />, end: false },
];

/** Navegación en la cabecera, para pantallas medianas y grandes. */
export function TopNav() {
  return (
    <nav className="tz-top-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `tz-top-nav__item${isActive ? ' is-active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/** Barra de pestañas inferior, solo en pantallas de teléfono. */
export function BottomNav() {
  return (
    <nav className="tz-bottom-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `tz-bottom-nav__item${isActive ? ' is-active' : ''}`}
        >
          <span className="tz-bottom-nav__icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
