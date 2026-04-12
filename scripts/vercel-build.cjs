/**
 * Elige la configuración de Angular según la rama desplegada en Vercel.
 * Ajusta en Vercel: Build Command = `npm run build:vercel`
 * Output Directory = `dist/llamalo-io/browser`
 */
const { execSync } = require('child_process');

const branch = process.env.VERCEL_GIT_COMMIT_REF || '';
// Ramas: master → prod (app.llamalo.ai), preprod → preprod, dev → dev (dev.llamalo.ai).
// Cualquier otra rama (p. ej. PR) usa build tipo dev para no apuntar a la API de prod por error.
let config = 'dev-deploy';

if (branch === 'master') {
  config = 'production';
} else if (branch === 'preprod') {
  config = 'preprod';
} else if (branch === 'dev') {
  config = 'dev-deploy';
}

console.log(`[vercel-build] branch=${branch || '(none)'} -> ng build --configuration=${config}`);

execSync(`npx ng build --configuration=${config}`, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});
