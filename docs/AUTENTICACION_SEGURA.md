# 🔐 Guía de Autenticación Segura para Despliegue

Esta guía explica cómo usar tokens o claves SSH en lugar de contraseñas para desplegar de forma más segura.

## 🎯 Opciones de Autenticación

### 1. **Token/Contraseña desde Variable de Entorno** (Recomendado para FTP)

La forma más segura es usar variables de entorno para no dejar credenciales en archivos.

#### Configuración:

1. **Crear el archivo de configuración sin password:**
   ```json
   {
     "method": "ftp",
     "host": "ftp.tudominio.com",
     "port": 21,
     "username": "tuusuario@tudominio.com",
     "password": "",
     "remotePath": "/public_html",
     "localPath": "dist/llamalo-io/browser"
   }
   ```

2. **Configurar la variable de entorno:**

   **En macOS/Linux:**
   ```bash
   export DEPLOY_PASSWORD="tu-contraseña-ftp"
   # O si prefieres usar un "token" (puede ser la misma contraseña)
   export DEPLOY_TOKEN="tu-contraseña-ftp"
   ```

   **En Windows (PowerShell):**
   ```powershell
   $env:DEPLOY_PASSWORD="tu-contraseña-ftp"
   # O
   $env:DEPLOY_TOKEN="tu-contraseña-ftp"
   ```

   **En Windows (CMD):**
   ```cmd
   set DEPLOY_PASSWORD=tu-contraseña-ftp
   ```

3. **Hacer permanente (opcional):**

   **macOS/Linux - Añadir a `~/.bashrc` o `~/.zshrc`:**
   ```bash
   echo 'export DEPLOY_PASSWORD="tu-contraseña-ftp"' >> ~/.zshrc
   source ~/.zshrc
   ```

   **Windows - Variable de sistema:**
   - Panel de Control → Sistema → Variables de entorno
   - Añadir `DEPLOY_PASSWORD` con tu valor

4. **Desplegar:**
   ```bash
   npm run deploy:build
   ```

---

### 2. **Claves SSH** (Recomendado para VPS/SFTP)

Si tienes acceso SSH a tu servidor, puedes usar claves SSH en lugar de contraseñas.

#### Paso 1: Generar Clave SSH (si no tienes una)

```bash
ssh-keygen -t ed25519 -C "deploy@llamalo-ia" -f ~/.ssh/deploy_key
```

Esto creará:
- `~/.ssh/deploy_key` (clave privada - **NO compartir**)
- `~/.ssh/deploy_key.pub` (clave pública - subir al servidor)

#### Paso 2: Subir Clave Pública al Servidor

```bash
ssh-copy-id -i ~/.ssh/deploy_key.pub usuario@tu-servidor.com
```

O manualmente:
1. Copia el contenido de `~/.ssh/deploy_key.pub`
2. En el servidor, añádelo a `~/.ssh/authorized_keys`:
   ```bash
   echo "contenido-de-tu-clave-publica" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

#### Paso 3: Configurar el Despliegue

**Opción A: Ruta a la Clave (Recomendado)**

```json
{
  "method": "sftp",
  "host": "tu-servidor.com",
  "port": 22,
  "username": "tuusuario",
  "password": "",
  "privateKeyPath": "/Users/tuusuario/.ssh/deploy_key",
  "remotePath": "/var/www/html",
  "localPath": "dist/llamalo-io/browser"
}
```

**Opción B: Clave desde Variable de Entorno**

1. Lee el contenido de tu clave privada:
   ```bash
   cat ~/.ssh/deploy_key
   ```

2. Configura la variable de entorno:
   ```bash
   export DEPLOY_SSH_KEY="$(cat ~/.ssh/deploy_key)"
   ```

3. Configura `deploy.config.json`:
   ```json
   {
     "method": "sftp",
     "host": "tu-servidor.com",
     "port": 22,
     "username": "tuusuario",
     "password": "",
     "remotePath": "/var/www/html",
     "localPath": "dist/llamalo-io/browser"
   }
   ```

**Si tu clave tiene passphrase:**

```bash
export DEPLOY_SSH_PASSPHRASE="tu-passphrase"
```

---

### 3. **Token Personalizado** (Para Servicios que lo Soporten)

Algunos servicios permiten generar tokens de API. Si Namecheap ofrece esta opción:

```json
{
  "method": "ftp",
  "host": "ftp.tudominio.com",
  "port": 21,
  "username": "tuusuario@tudominio.com",
  "token": "",
  "remotePath": "/public_html",
  "localPath": "dist/llamalo-io/browser"
}
```

Y configura:
```bash
export DEPLOY_TOKEN="tu-token-de-api"
```

---

## 📊 Comparación de Métodos

| Método | Seguridad | Facilidad | Cuándo Usar |
|--------|-----------|-----------|-------------|
| **Password en archivo** | ⚠️ Baja | ✅ Muy fácil | Solo desarrollo local |
| **Password en variable** | ✅ Media | ✅ Fácil | Shared hosting (FTP) |
| **Token en variable** | ✅ Media | ✅ Fácil | Si el servicio soporta tokens |
| **Clave SSH (ruta)** | ✅✅ Alta | ✅ Fácil | VPS, servidores propios |
| **Clave SSH (env)** | ✅✅✅ Muy Alta | ⚠️ Media | Máxima seguridad |

---

## 🔒 Mejores Prácticas

### ✅ Hacer

- ✅ Usar variables de entorno para credenciales
- ✅ Usar claves SSH para servidores propios
- ✅ Mantener `deploy.config.json` en `.gitignore`
- ✅ Usar claves SSH con passphrase para máxima seguridad
- ✅ Rotar credenciales periódicamente

### ❌ No Hacer

- ❌ Subir `deploy.config.json` con contraseñas al repositorio
- ❌ Compartir claves SSH privadas
- ❌ Dejar contraseñas en texto plano en archivos de configuración
- ❌ Usar la misma contraseña para múltiples servicios

---

## 🛠️ Ejemplos Completos

### Ejemplo 1: FTP con Variable de Entorno

```bash
# 1. Configurar variable
export DEPLOY_PASSWORD="MiContraseña123"

# 2. deploy.config.json
{
  "method": "ftp",
  "host": "ftp.ejemplo.com",
  "port": 21,
  "username": "admin@ejemplo.com",
  "password": "",
  "remotePath": "/public_html",
  "localPath": "dist/llamalo-io/browser"
}

# 3. Desplegar
npm run deploy:build
```

### Ejemplo 2: SFTP con Clave SSH

```bash
# 1. Generar clave (si no existe)
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key

# 2. Subir al servidor
ssh-copy-id -i ~/.ssh/deploy_key.pub usuario@servidor.com

# 3. deploy.config.json
{
  "method": "sftp",
  "host": "servidor.com",
  "port": 22,
  "username": "usuario",
  "password": "",
  "privateKeyPath": "/Users/tuusuario/.ssh/deploy_key",
  "remotePath": "/var/www/html",
  "localPath": "dist/llamalo-io/browser"
}

# 4. Desplegar
npm run deploy:build
```

### Ejemplo 3: SSH con Clave desde Variable

```bash
# 1. Configurar variable con la clave
export DEPLOY_SSH_KEY="$(cat ~/.ssh/deploy_key)"

# 2. deploy.config.json
{
  "method": "ssh",
  "host": "servidor.com",
  "port": 22,
  "username": "usuario",
  "password": "",
  "remotePath": "/var/www/html",
  "localPath": "dist/llamalo-io/browser"
}

# 3. Desplegar
npm run deploy:build
```

---

## 🔍 Verificar Configuración

Para verificar que tu configuración es correcta sin desplegar:

```bash
# Verificar que la variable está configurada
echo $DEPLOY_PASSWORD
# o
echo $DEPLOY_SSH_KEY_PATH

# Probar conexión SSH (si usas claves)
ssh -i ~/.ssh/deploy_key usuario@servidor.com
```

---

## 📝 Notas Importantes

1. **Namecheap Shared Hosting**: Generalmente solo soporta FTP con usuario/contraseña. Las variables de entorno son la mejor opción aquí.

2. **Namecheap VPS**: Si tienes VPS, puedes usar claves SSH, que es mucho más seguro.

3. **Tokens de API**: Namecheap tiene una API, pero es principalmente para gestión de dominios, no para despliegue de archivos.

4. **Seguridad de Variables**: Las variables de entorno son más seguras que archivos porque:
   - No se suben al repositorio
   - Se pueden rotar fácilmente
   - Cada desarrollador puede tener sus propias credenciales

---

¿Necesitas ayuda configurando algún método específico? 🚀
