/**
 * Elige la configuración de Angular según la rama desplegada en Vercel.
 * Ajusta en Vercel: Build Command = `npm run build:vercel`
 * Output Directory = `dist/llamalo-io/browser`
 *
 * Angular 19 (application + prerender) emite `index.csr.html` en la raíz del browser,
 * no `index.html`. Vercel necesita `index.html` para servir `/`; lo generamos copiando el CSR.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
} else if (branch === 'new-dev') {
  config = 'new-dev-deploy';
}

console.log(`[vercel-build] branch=${branch || '(none)'} -> ng build --configuration=${config}`);

execSync(`npx ng build --configuration=${config}`, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

const browserDir = path.join(__dirname, '..', 'dist', 'llamalo-io', 'browser');
const csrPath = path.join(browserDir, 'index.csr.html');
const indexPath = path.join(browserDir, 'index.html');
if (fs.existsSync(csrPath)) {
  fs.copyFileSync(csrPath, indexPath);
  console.log('[vercel-build] Copiado index.csr.html -> index.html para hosting estático.');
}

function hasSentryEnv() {
  return (
    !!process.env.SENTRY_AUTH_TOKEN &&
    !!process.env.SENTRY_ORG &&
    !!process.env.SENTRY_PROJECT &&
    !!process.env.VERCEL_GIT_COMMIT_SHA
  );
}

function runSentrySourcemaps() {
  if (!hasSentryEnv()) {
    console.warn(
      '[vercel-build] Sentry sourcemaps skip: faltan SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT o VERCEL_GIT_COMMIT_SHA.',
    );
    return;
  }

  const release = process.env.VERCEL_GIT_COMMIT_SHA;
  console.log(`[vercel-build] Subiendo sourcemaps a Sentry (release=${release})`);

  execSync(`npx @sentry/cli sourcemaps inject "${browserDir}"`, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  execSync(
    `npx @sentry/cli sourcemaps upload --release="${release}" "${browserDir}"`,
    {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    },
  );
}

function deleteSourceMapFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      deleteSourceMapFiles(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.map')) {
      fs.unlinkSync(fullPath);
    }
  }
}

runSentrySourcemaps();
deleteSourceMapFiles(browserDir);
console.log('[vercel-build] Sourcemaps eliminados del artefacto público.');
