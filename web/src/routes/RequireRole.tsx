import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';
import { homeFor, paths } from './paths';

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
}

/** Protege una ruta: exige sesión y uno de los roles indicados. */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}
