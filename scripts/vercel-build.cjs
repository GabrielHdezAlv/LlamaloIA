/**
 * Elige la configuración de Angular según la rama desplegada en Vercel.
 * Ajusta en Vercel: Build Command = `npm run build:vercel`
 * Output Directory = `dist/llamalo-io/browser`
 */
const { execSync } = require('child_process');

const branch = process.env.VERCEL_GIT_COMMIT_REF || '';
let config = 'production';

if (branch === 'preprod') {
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
