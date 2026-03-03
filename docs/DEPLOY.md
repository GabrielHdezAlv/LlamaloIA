# Guía de Despliegue Automatizado a Namecheap

Este proyecto incluye un script automatizado para desplegar la aplicación Angular a Namecheap.

## 📋 Requisitos Previos

1. **Node.js y npm** instalados
2. **Credenciales de acceso** a tu hosting de Namecheap:
   - Para **Shared Hosting**: Usuario FTP y contraseña
   - Para **VPS**: Usuario SSH y contraseña (o clave SSH configurada)

## 🚀 Configuración Inicial

### Paso 1: Instalar dependencias

```bash
npm install
```

### Paso 2: Crear archivo de configuración

Copia el archivo de ejemplo y personalízalo con tus credenciales:

```bash
cp deploy.config.example.json deploy.config.json
```

### Paso 3: Editar `deploy.config.json`

Abre `deploy.config.json` y completa la información:

#### Para Shared Hosting (FTP/SFTP):

```json
{
  "method": "ftp",
  "host": "tu-dominio.com",
  "port": 21,
  "username": "tu-usuario-ftp",
  "password": "tu-contraseña-ftp",
  "remotePath": "/public_html",
  "localPath": "dist/llamalo-io/browser"
}
```

**O si prefieres SFTP (más seguro):**

```json
{
  "method": "sftp",
  "host": "tu-dominio.com",
  "port": 22,
  "username": "tu-usuario-ftp",
  "password": "tu-contraseña-ftp",
  "remotePath": "/public_html",
  "localPath": "dist/llamalo-io/browser"
}
```

#### Para VPS (SSH/SCP):

```json
{
  "method": "ssh",
  "host": "tu-servidor.com",
  "port": 22,
  "username": "tu-usuario-ssh",
  "password": "tu-contraseña-ssh",
  "remotePath": "/var/www/html",
  "localPath": "dist/llamalo-io/browser"
}
```

**Nota de Seguridad:** El archivo `deploy.config.json` está en `.gitignore` para evitar que se suban credenciales al repositorio.

### Paso 4: Usar variable de entorno para la contraseña (Opcional pero Recomendado)

En lugar de poner la contraseña en el archivo JSON, puedes usar una variable de entorno:

```bash
export DEPLOY_PASSWORD="tu-contraseña"
```

Y dejar el campo `password` vacío en `deploy.config.json`:

```json
{
  "method": "ftp",
  "host": "tu-dominio.com",
  "username": "tu-usuario",
  "password": "",
  ...
}
```

## 📦 Despliegue

### Opción 1: Build + Deploy (Recomendado)

Este comando construye la aplicación y la despliega automáticamente:

```bash
npm run deploy:build
```

### Opción 2: Solo Despliegue

Si ya tienes el build generado:

```bash
npm run build
npm run deploy
```

## 🔧 Métodos de Despliegue Soportados

### 1. FTP (Shared Hosting)
- **Método:** `ftp`
- **Puerto:** 21 (por defecto)
- **Uso:** Para hosting compartido de Namecheap

### 2. SFTP (Shared Hosting - Más Seguro)
- **Método:** `sftp`
- **Puerto:** 22 (por defecto)
- **Uso:** Para hosting compartido con soporte SFTP

### 3. SSH/SCP (VPS)
- **Método:** `ssh` o `scp`
- **Puerto:** 22 (por defecto)
- **Uso:** Para servidores VPS
- **Nota:** Si tienes `rsync` instalado, se usará automáticamente (más eficiente)

## 📝 Estructura de Directorios

El script despliega el contenido de `dist/llamalo-io/browser/` al directorio remoto configurado.

**Importante:** Asegúrate de que el `remotePath` apunte al directorio correcto:
- **Shared Hosting:** Generalmente `/public_html` o `/www`
- **VPS:** Puede ser `/var/www/html`, `/home/usuario/public_html`, etc.

## 🛠️ Solución de Problemas

### Error: "No se encontró el build"
```bash
npm run build
```

### Error: "No se encontró deploy.config.json"
```bash
cp deploy.config.example.json deploy.config.json
# Edita el archivo con tus credenciales
```

### Error de conexión FTP/SFTP
- Verifica que el puerto sea correcto (21 para FTP, 22 para SFTP)
- Confirma que las credenciales sean correctas
- Verifica que el firewall no esté bloqueando la conexión

### Error de conexión SSH
- Verifica que tengas acceso SSH al servidor
- Si usas clave SSH, configura el acceso sin contraseña
- Para usar contraseña, instala `sshpass`: `brew install sshpass` (macOS) o `apt-get install sshpass` (Linux)

### Archivos no se actualizan
- Verifica que el `remotePath` sea correcto
- Asegúrate de tener permisos de escritura en el directorio remoto
- Algunos servidores requieren permisos específicos (chmod 755)

## 🔐 Seguridad

- **NUNCA** subas `deploy.config.json` al repositorio (ya está en `.gitignore`)
- Usa variables de entorno para contraseñas cuando sea posible
- Considera usar claves SSH en lugar de contraseñas para VPS
- Para producción, considera usar un servicio de CI/CD como GitHub Actions

## 📚 Recursos Adicionales

- [Documentación de Namecheap sobre FTP](https://www.namecheap.com/support/knowledgebase/article.aspx/96/2174/how-to-connect-to-a-shared-server-via-ftp/)
- [Documentación de basic-ftp](https://github.com/patrickjuchli/basic-ftp)
- [Documentación de ssh2-sftp-client](https://github.com/theophilusx/ssh2-sftp-client)
