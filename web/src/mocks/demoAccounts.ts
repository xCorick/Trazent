/** Cuentas de demostración para presentar el prototipo. */
export interface DemoAccount {
  label: string;
  description: string;
  email: string;
  password: string;
  /** Dónde abre la cuenta: panel web o app del contratista. */
  app: 'panel' | 'contractor';
}

export const demoAccounts: DemoAccount[] = [
  {
    label: 'Administrador',
    description: 'Usuarios, sitios, geocercas y reportes',
    email: 'admin@trazent.mx',
    password: 'demo1234',
    app: 'panel',
  },
  {
    label: 'Supervisor',
    description: 'Asignar tareas y revisar evidencias',
    email: 'supervisor@trazent.mx',
    password: 'demo1234',
    app: 'panel',
  },
  {
    label: 'Contratista',
    description: 'Registrar asistencia y subir evidencias',
    email: 'contratista@trazent.mx',
    password: 'demo1234',
    app: 'contractor',
  },
];
