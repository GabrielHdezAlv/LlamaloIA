#!/usr/bin/env node

/**
 * Script de despliegue automatizado para Namecheap
 * Soporta FTP/SFTP (shared hosting) y SSH/SCP (VPS)
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

// Cargar configuración
function loadConfig() {
  const configPath = path.join(process.cwd(), 'deploy.config.json');
  if (!fs.existsSync(configPath)) {
    error(
      `No se encontró deploy.config.json. Copia deploy.config.example.json y renómbralo.`
    );
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Validar configuración
  if (!config.method || !['ftp', 'sftp', 'ssh', 'scp'].includes(config.method)) {
    error('Método de despliegue inválido. Usa: ftp, sftp, ssh o scp');
  }
  
  if (!config.host || !config.username) {
    error('Faltan campos requeridos en deploy.config.json (host, username)');
  }

  // Prioridad de autenticación:
  // 1. Token/Key desde variable de entorno (más seguro)
  // 2. Token/Key desde config
  // 3. Password desde variable de entorno
  // 4. Password desde config
  
  // Para SSH/SFTP: usar clave SSH si está disponible
  if (config.method === 'ssh' || config.method === 'sftp' || config.method === 'scp') {
    // Buscar clave SSH
    config.privateKey = process.env.DEPLOY_SSH_KEY || config.privateKey;
    config.privateKeyPath = process.env.DEPLOY_SSH_KEY_PATH || config.privateKeyPath;
    
    // Si hay clave SSH, no necesitamos password
    if (config.privateKey || config.privateKeyPath) {
      config.useKeyAuth = true;
      info('Usando autenticación por clave SSH');
    }
  }
  
  // Para FTP: usar token si está disponible
  config.token = process.env.DEPLOY_TOKEN || config.token;
  
  // Si no hay token ni clave SSH, usar password
  if (!config.useKeyAuth && !config.token) {
    if (!config.password) {
      config.password = process.env.DEPLOY_PASSWORD;
      if (!config.password) {
        error('No se encontró método de autenticación. Configura:\n' +
              '  - DEPLOY_PASSWORD (variable de entorno)\n' +
              '  - DEPLOY_TOKEN (variable de entorno)\n' +
              '  - DEPLOY_SSH_KEY_PATH (variable de entorno, para SSH/SFTP)\n' +
              '  - O password/token/privateKeyPath en deploy.config.json');
      }
    }
  }

  return config;
}

// Archivos protegidos que NO deben eliminarse ni sobrescribirse
const PROTECTED_FILES = [
  '.well-known',
  '.htaccess',
  'ssl-manager.php',
];

// Función auxiliar para subir archivos preservando los protegidos
async function uploadFilesPreservingProtected(client, localPath, remotePath, isFTP = true) {
  const fs = require('fs');
  const path = require('path');
  
  async function uploadRecursive(localDir, remoteDir) {
    const items = fs.readdirSync(localDir);
    
    for (const item of items) {
      const localPathItem = path.join(localDir, item);
      const stat = fs.statSync(localPathItem);
      
      // Verificar si el archivo/carpeta está protegido
      if (PROTECTED_FILES.includes(item)) {
        warning(`Preservando archivo protegido: ${item}`);
        continue;
      }
      
      if (stat.isDirectory()) {
        // Crear directorio remoto si no existe
        const remoteDirPath = remoteDir.endsWith('/') 
          ? remoteDir + item 
          : remoteDir + '/' + item;
        
        if (isFTP) {
          await client.ensureDir(remoteDirPath);
        } else {
          // Para SFTP
          const sftp = client;
          try {
            await sftp.exists(remoteDirPath);
          } catch {
            await sftp.mkdir(remoteDirPath, true);
          }
        }
        await uploadRecursive(localPathItem, remoteDirPath);
      } else {
        // Subir archivo
        const remoteFilePath = remoteDir.endsWith('/') 
          ? remoteDir + item 
          : remoteDir + '/' + item;
        
        if (isFTP) {
          await client.uploadFrom(localPathItem, remoteFilePath);
        } else {
          // Para SFTP
          const sftp = client;
          await sftp.put(localPathItem, remoteFilePath);
        }
        info(`✓ ${item}`);
      }
    }
  }
  
  await uploadRecursive(localPath, remotePath);
}

// Despliegue por FTP
async function deployFTP(config, localPath) {
  info('Iniciando despliegue por FTP...');
  
  try {
    const { Client } = require('basic-ftp');
    const client = new Client();
    
    // Usar token si está disponible, sino password
    const authPassword = config.token || config.password;
    
    await client.access({
      host: config.host,
      port: config.port || 21,
      user: config.username,
      password: authPassword,
      secure: false,
    });
    
    if (config.token) {
      info('Autenticado con token');
    }

    info(`Conectado a ${config.host}`);
    
    // Cambiar al directorio remoto
    const remotePath = config.remotePath || '/public_html';
    await client.ensureDir(remotePath);
    await client.cd(remotePath);
    info(`Directorio remoto: ${remotePath}`);
    warning(`Archivos protegidos que NO se modificarán: ${PROTECTED_FILES.join(', ')}`);

    // Subir archivos preservando los protegidos
    await uploadFilesPreservingProtected(client, localPath, remotePath, true);

    success('Archivos subidos correctamente');
    client.close();
  } catch (err) {
    error(`Error en FTP: ${err.message}`);
  }
}

// Despliegue por SFTP
async function deploySFTP(config, localPath) {
  info('Iniciando despliegue por SFTP...');
  
  try {
    const Client = require('ssh2-sftp-client');
    const sftp = new Client();
    
    // Configurar autenticación: clave SSH o password
    const connectionOptions = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
    };
    
    if (config.useKeyAuth) {
      // Autenticación por clave SSH
      if (config.privateKeyPath) {
        connectionOptions.privateKey = fs.readFileSync(config.privateKeyPath);
        info(`Usando clave SSH desde: ${config.privateKeyPath}`);
      } else if (config.privateKey) {
        connectionOptions.privateKey = config.privateKey;
        info('Usando clave SSH desde variable de entorno');
      }
      
      // Passphrase opcional para la clave
      if (config.passphrase) {
        connectionOptions.passphrase = config.passphrase;
      } else if (process.env.DEPLOY_SSH_PASSPHRASE) {
        connectionOptions.passphrase = process.env.DEPLOY_SSH_PASSPHRASE;
      }
    } else {
      // Autenticación por password o token
      connectionOptions.password = config.token || config.password;
      if (config.token) {
        info('Usando token para autenticación');
      }
    }
    
    await sftp.connect(connectionOptions);

    info(`Conectado a ${config.host}`);
    
    // Verificar que existe el directorio remoto
    const remotePath = config.remotePath || '/public_html';
    try {
      await sftp.exists(remotePath);
    } catch {
      warning(`El directorio ${remotePath} no existe, intentando crearlo...`);
      await sftp.mkdir(remotePath, true);
    }

    info(`Directorio remoto: ${remotePath}`);
    warning(`Archivos protegidos que NO se modificarán: ${PROTECTED_FILES.join(', ')}`);

    // Subir archivos preservando los protegidos
    await uploadFilesPreservingProtected(sftp, localPath, remotePath, false);
    
    success('Archivos subidos correctamente');
    await sftp.end();
  } catch (err) {
    error(`Error en SFTP: ${err.message}`);
  }
}

// Despliegue por SSH/SCP (rsync si está disponible, sino scp)
async function deploySSH(config, localPath) {
  info('Iniciando despliegue por SSH...');
  
  const remotePath = config.remotePath || '/var/www/html';
  const remote = `${config.username}@${config.host}:${remotePath}`;
  
  // Configurar opciones SSH según método de autenticación
  let sshOptions = '';
  if (config.useKeyAuth && config.privateKeyPath) {
    sshOptions = `-i "${config.privateKeyPath}"`;
    info(`Usando clave SSH: ${config.privateKeyPath}`);
  } else if (config.useKeyAuth && config.privateKey) {
    // Si la clave está en variable de entorno, guardarla temporalmente
    const tempKeyPath = path.join(process.cwd(), '.deploy_temp_key');
    fs.writeFileSync(tempKeyPath, config.privateKey, { mode: 0o600 });
    sshOptions = `-i "${tempKeyPath}"`;
    info('Usando clave SSH desde variable de entorno');
    
    // Limpiar al final
    process.on('exit', () => {
      if (fs.existsSync(tempKeyPath)) {
        fs.unlinkSync(tempKeyPath);
      }
    });
  }
  
  // Intentar usar rsync (más eficiente)
  try {
    execSync('which rsync', { stdio: 'ignore' });
    info('Usando rsync para transferencia...');
    
    // Excluir archivos protegidos
    const excludeArgs = [
      '--exclude=".DS_Store"',
      '--exclude="*.map"',
      '--exclude="*.log"',
      '--exclude=".well-known"',
      '--exclude=".htaccess"',
      '--exclude="ssl-manager.php"',
    ];
    
    let rsyncCmd = [
      'rsync',
      '-avz',
      '--delete-excluded',
      ...excludeArgs,
    ];
    
    // Añadir opciones SSH si hay clave
    if (sshOptions) {
      rsyncCmd.push(`-e "ssh ${sshOptions}"`);
    }
    
    rsyncCmd.push(`${localPath}/`, remote);
    rsyncCmd = rsyncCmd.join(' ');

    // Si hay password (y no hay clave), usar sshpass
    if (!config.useKeyAuth && config.password) {
      execSync(`sshpass -p "${config.password}" ${rsyncCmd}`, {
        stdio: 'inherit',
      });
    } else {
      execSync(rsyncCmd, { stdio: 'inherit' });
    }
    
    success('Archivos transferidos correctamente con rsync');
    return;
  } catch (err) {
    if (err.message.includes('which rsync')) {
      warning('rsync no está disponible, usando scp...');
    } else {
      error(`Error con rsync: ${err.message}`);
    }
  }

  // Fallback a scp
  try {
    info('Usando scp para transferencia...');
    let scpCmd = ['scp', '-r'];
    
    // Añadir opciones SSH si hay clave
    if (sshOptions) {
      scpCmd.push(sshOptions);
    }
    
    scpCmd.push(`${localPath}/*`, remote);
    scpCmd = scpCmd.join(' ');

    if (!config.useKeyAuth && config.password) {
      execSync(`sshpass -p "${config.password}" ${scpCmd}`, {
        stdio: 'inherit',
      });
    } else {
      execSync(scpCmd, { stdio: 'inherit' });
    }
    
    success('Archivos transferidos correctamente con scp');
  } catch (err) {
    error(`Error con scp: ${err.message}`);
  }
}

// Función principal
async function main() {
  log('\n🚀 Iniciando despliegue a Namecheap...\n', 'blue');

  // 1. Verificar build
  const localPath = checkBuild();

  // 2. Cargar configuración
  const config = loadConfig();

  // 3. Ejecutar despliegue según el método
  try {
    switch (config.method.toLowerCase()) {
      case 'ftp':
        await deployFTP(config, localPath);
        break;
      case 'sftp':
        await deploySFTP(config, localPath);
        break;
      case 'ssh':
      case 'scp':
        await deploySSH(config, localPath);
        break;
      default:
        error(`Método ${config.method} no soportado`);
    }

    log('\n✨ Despliegue completado exitosamente!\n', 'green');
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
