import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PanelLayout } from '@/components';
import { MobileShell } from '@/components/mobile';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { LoginView } from '@/views/auth/LoginView';
import { NotFoundView } from '@/views/NotFoundView';
import { DashboardView } from '@/views/panel/DashboardView';
import { EvidencesView } from '@/views/panel/EvidencesView';
import { ReportsView } from '@/views/panel/ReportsView';
import { SitesView } from '@/views/panel/SitesView';
import { TasksView } from '@/views/panel/TasksView';
import { UsersView } from '@/views/panel/UsersView';
import { MobileAttendanceView } from '@/views/mobile/MobileAttendanceView';
import { MobileHomeView } from '@/views/mobile/MobileHomeView';
import { MobileTaskDetailView } from '@/views/mobile/MobileTaskDetailView';
import { MobileTasksView } from '@/views/mobile/MobileTasksView';
import { RequireRole } from './RequireRole';
import { homeFor, paths } from './paths';

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : paths.login} replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.login} element={<LoginView />} />

        <Route
          path={paths.panel}
          element={
            <RequireRole roles={[Role.Admin, Role.Supervisor]}>
              <PanelLayout />
            </RequireRole>
          }
        >
          <Route index element={<DashboardView />} />
          <Route path="tareas" element={<TasksView />} />
          <Route path="evidencias" element={<EvidencesView />} />
          <Route path="reportes" element={<ReportsView />} />
          <Route
            path="usuarios"
            element={
              <RequireRole roles={[Role.Admin]}>
                <UsersView />
              </RequireRole>
            }
          />
          <Route
            path="sitios"
            element={
              <RequireRole roles={[Role.Admin]}>
                <SitesView />
              </RequireRole>
            }
          />
        </Route>

        {/* PROTOTIPO MÓVIL · Eliminar este bloque al quitar la parte móvil. */}
        <Route
          path={paths.mobile}
          element={
            <RequireRole roles={[Role.Contractor]}>
              <MobileShell />
            </RequireRole>
          }
        >
          <Route index element={<MobileHomeView />} />
          <Route path="asistencia" element={<MobileAttendanceView />} />
          <Route path="tareas" element={<MobileTasksView />} />
          <Route path="tareas/:taskId" element={<MobileTaskDetailView />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </BrowserRouter>
  );
}
