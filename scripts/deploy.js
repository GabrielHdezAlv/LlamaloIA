#!/usr/bin/env node

/**
 * Script de despliegue automatizado para Namecheap
 * Sube un archivo ZIP con el contenido del build.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Verificar que existe el build
function checkBuild() {
  const buildPath = path.join(process.cwd(), 'dist/llamalo-io/browser');
  if (!fs.existsSync(buildPath)) {
    error('No se encontró el build. Ejecuta "npm run build" primero.');
  }
  info(`Build encontrado en: ${buildPath}`);
  return buildPath;
}

// Función para comprimir la carpeta
function zipFolder(localPath, zipPath) {
  info(`Comprimiendo ${localPath} en ${zipPath}...`);
  try {
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath); // Eliminar el zip anterior si existe
    }
    // Usa el comando nativo zip
    execSync(`cd "${localPath}" && zip -r "${zipPath}" . -q`, { stdio: 'inherit' });
    success('Carpeta comprimida correctamente en deploy.zip');
  } catch (err) {
    error(`Error al comprimir: ${err.message}. Asegúrate de tener "zip" instalado.`);
  }
}

// Cargar configuración
function loadConfig() {
  const configPath = path.join(process.cwd(), 'deploy.config.json');
  if (!fs.existsSync(configPath)) {
    error(`No se encontró deploy.config.json.`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  if (!config.method || !['ftp', 'sftp', 'ssh', 'scp'].includes(config.method)) {
    error('Método de despliegue inválido. Usa: ftp, sftp, ssh o scp');
  }
  
  if (!config.host || !config.username) {
    error('Faltan campos requeridos en deploy.config.json (host, username)');
  }
  
  return config;
}

// Despliegue por FTP (Solo sube el ZIP)
async function deployFTP(config, zipPath) {
  info('Iniciando subida del ZIP por FTP...');
  
  try {
    const { Client } = require('basic-ftp');
    const client = new Client();
    
    await client.access({
      host: config.host,
      port: config.port || 21,
      user: config.username,
      password: config.password,
      secure: false,
    });
    
    info(`Conectado a ${config.host}`);
    
    const remotePath = config.remotePath || '/';
    await client.ensureDir(remotePath);
    await client.cd(remotePath);
    info(`Directorio remoto: ${remotePath}`);
    
    info(`Subiendo deploy.zip a ${remotePath}...`);
    await client.uploadFrom(zipPath, "deploy.zip");

    success('deploy.zip subido correctamente al servidor FTP.');
    client.close();
  } catch (err) {
    error(`Error en FTP: ${err.message}`);
  }
}

// Despliegue por SFTP (Solo sube el ZIP)
async function deploySFTP(config, zipPath) {
  info('Iniciando subida del ZIP por SFTP...');
  
  try {
    const Client = require('ssh2-sftp-client');
    const sftp = new Client();
    
    await sftp.connect({
      host: config.host,
      port: config.port || 22,
      username: config.username,
      password: config.password
    });

    info(`Conectado a ${config.host}`);
    
    const remotePath = config.remotePath || '/public_html';
    try {
      await sftp.exists(remotePath);
    } catch {
      await sftp.mkdir(remotePath, true);
    }

    const remoteFilePath = remotePath.endsWith('/') ? remotePath + 'deploy.zip' : remotePath + '/deploy.zip';
    info(`Subiendo deploy.zip a ${remoteFilePath}...`);
    
    await sftp.put(zipPath, remoteFilePath);
    
    success('deploy.zip subido correctamente al servidor SFTP.');
    await sftp.end();
  } catch (err) {
    error(`Error en SFTP: ${err.message}`);
  }
}

// Despliegue por SCP (Solo sube el ZIP)
async function deploySCP(config, zipPath) {
  info('Iniciando subida del ZIP por SCP...');
  
  const remotePath = config.remotePath || '/var/www/html';
  const remote = `${config.username}@${config.host}:${remotePath}/deploy.zip`;
  
  try {
    let scpCmd = `scp "${zipPath}" "${remote}"`;
    if (config.password) {
      execSync(`sshpass -p "${config.password}" ${scpCmd}`, { stdio: 'inherit' });
    } else {
      execSync(scpCmd, { stdio: 'inherit' });
    }
    success('deploy.zip transferido correctamente con SCP.');
  } catch (err) {
    error(`Error con SCP: ${err.message}`);
  }
}

// Función principal
async function main() {
  log('\n🚀 Iniciando subida del ZIP a Namecheap...\n', 'blue');

  // 1. Verificar build
  const localPath = checkBuild();

  // 2. Comprimir la carpeta de build en deploy.zip
  const zipPath = path.join(process.cwd(), 'dist', 'deploy.zip');
  zipFolder(localPath, zipPath);

  // 3. Cargar configuración
  const config = loadConfig();

  // 4. Ejecutar despliegue según el método
  try {
    switch (config.method.toLowerCase()) {
      case 'ftp':
        await deployFTP(config, zipPath);
        break;
      case 'sftp':
        await deploySFTP(config, zipPath);
        break;
      case 'ssh':
      case 'scp':
        await deploySCP(config, zipPath);
        break;
      default:
        error(`Método ${config.method} no soportado`);
    }

    log('\n✨ ¡Proceso completado! deploy.zip se encuentra en tu servidor Namecheap.\n', 'green');
    info('Recuerda acceder a tu cPanel/Servidor para eliminar los archivos antiguos y descomprimir el nuevo deploy.zip.');
    
    // (Opcional) Eliminar el zip local una vez subido
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
  } catch (err) {
    error(`Error durante el despliegue: ${err.message}`);
  }
}

// Ejecutar
if (require.main === module) {
  main().catch((err) => {
    error(err.message);
  });
}

module.exports = { main };
