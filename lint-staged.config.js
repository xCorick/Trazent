/**
 * Revisiones del hook pre-commit (Husky → lint-staged).
 * Solo se revisan los archivos del commit, y cada carpeta usa su propia herramienta.
 * Los tipos se revisan del proyecto completo (tsc no puede revisar archivos sueltos).
 */
const quote = (files) => files.map((file) => `"${file}"`).join(' ');

export default {
  // Panel web: ESLint con la configuración de web/, Prettier y tipos.
  'web/**/*.{ts,tsx}': (files) => [
    `yarn workspace trazent-web eslint --fix ${quote(files)}`,
    `prettier --write ${quote(files)}`,
    'yarn workspace trazent-web typecheck',
  ],

  // App móvil: igual que la web, con su propia configuración de mobile/.
  'mobile/**/*.{ts,tsx}': (files) => [
    `yarn workspace trazent-mobile eslint --fix ${quote(files)}`,
    `prettier --write ${quote(files)}`,
    'yarn workspace trazent-mobile typecheck',
  ],

  // Resto de archivos de texto (Prettier omite lo que está en .prettierignore, como Trazent.Api y db).
  '*.{json,md,css,html,yml,yaml}': 'prettier --write --ignore-unknown',
};
