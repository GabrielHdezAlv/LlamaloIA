# 📋 Guía Paso a Paso: Despliegue Automatizado en Namecheap

Esta guía te explica **exactamente** qué datos necesitas y dónde ponerlos para desplegar tu aplicación Angular en Namecheap.

## 🔍 Paso 1: Obtener tus Credenciales FTP de Namecheap

### 1.1 Acceder al cPanel

1. Inicia sesión en tu cuenta de **Namecheap**
2. Ve a **"Lista de Productos"** → Selecciona tu hosting
3. Haz clic en **"Administrar"** → **"Acceder a cPanel"**

### 1.2 Encontrar las Credenciales FTP

En el cPanel, busca la sección **"Archivos"** y haz clic en **"Cuentas FTP"**.

Ahí verás algo como esto:

```
Usuario FTP: tuusuario@tudominio.com
Servidor FTP: ftp.tudominio.com (o tu IP)
Puerto: 21
Directorio: /public_html
```

**⚠️ IMPORTANTE:** Anota estos datos:
- **Usuario FTP**: `tuusuario@tudominio.com` (o solo `tuusuario`)
- **Servidor FTP**: `ftp.tudominio.com` o la IP que te muestren
- **Puerto**: Generalmente `21` para FTP
- **Contraseña**: La que configuraste para FTP (si no la recuerdas, puedes cambiarla desde aquí)

---

## 📝 Paso 2: Crear el Archivo de Configuración

### 2.1 Copiar el archivo de ejemplo

Abre tu terminal en la raíz del proyecto y ejecuta:

```bash
cp deploy.config.example.json deploy.config.json
```

### 2.2 Editar `deploy.config.json`

Abre el archivo `deploy.config.json` con tu editor de código y reemplaza los valores con tus datos reales de Namecheap:

```json
{
  "method": "ftp",
  "host": "ftp.tudominio.com",
  "port": 21,
  "username": "tuusuario@tudominio.com",
  "password": "tu-contraseña-ftp",
  "remotePath": "/public_html",
  "localPath": "dist/llamalo-io/browser"
}
```

### 2.3 Ejemplo Real

Si tu dominio es `ejemplo.com` y tu usuario FTP es `usuario123`, tu configuración se vería así:

```json
{
  "method": "ftp",
  "host": "ftp.ejemplo.com",
  "port": 21,
  "username": "usuario123@ejemplo.com",
  "password": "MiContraseñaSegura123",
  "remotePath": "/public_html",
  "localPath": "dist/llamalo-io/browser"
}
```

**📌 Nota:** El campo `remotePath` debe ser exactamente `/public_html` porque es donde están tus archivos actuales y los archivos protegidos (`.well-known`, `.htaccess`, `ssl-manager.php`).

---

## 🔐 Paso 3: Seguridad de la Contraseña (Opcional pero Recomendado)

En lugar de poner tu contraseña directamente en el archivo JSON, puedes usar una variable de entorno:

### Opción A: Variable de Entorno (Recomendado para FTP)

**En macOS/Linux:**
```bash
export DEPLOY_PASSWORD="tu-contraseña-ftp"
# O usar token (puede ser la misma contraseña)
export DEPLOY_TOKEN="tu-contraseña-ftp"
```

**En Windows (PowerShell):**
```powershell
$env:DEPLOY_PASSWORD="tu-contraseña-ftp"
```

**En Windows (CMD):**
```cmd
set DEPLOY_PASSWORD=tu-contraseña-ftp
```

Luego en `deploy.config.json`, deja el password vacío:
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

### Opción B: Clave SSH (Recomendado para VPS/SFTP)

Si tienes acceso SSH, puedes usar claves SSH en lugar de contraseñas:

1. **Generar clave SSH** (si no tienes una):
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/deploy_key
   ```

2. **Subir clave pública al servidor:**
   ```bash
   ssh-copy-id -i ~/.ssh/deploy_key.pub usuario@servidor.com
   ```

3. **Configurar en `deploy.config.json`:**
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

**📚 Para más detalles sobre autenticación segura, consulta:** `docs/AUTENTICACION_SEGURA.md`

### Opción C: Contraseña en el archivo (Solo para desarrollo)

Simplemente pon tu contraseña directamente en el campo `password` del JSON. El archivo `deploy.config.json` está en `.gitignore`, así que no se subirá al repositorio.

---

## 📦 Paso 4: Instalar Dependencias

Antes de desplegar, asegúrate de tener todas las dependencias instaladas:

```bash
npm install
```

Esto instalará las librerías necesarias para FTP (`basic-ftp` y `ssh2-sftp-client`).

---

## 🚀 Paso 5: Desplegar

### Opción 1: Build + Deploy (Todo en uno)

Este comando construye la aplicación y la despliega automáticamente:

```bash
npm run deploy:build
```

### Opción 2: Solo Despliegue (Si ya tienes el build)

Si ya ejecutaste `npm run build` anteriormente:

```bash
npm run deploy
```

---

## ✅ Paso 6: Verificar el Despliegue

1. Ve a tu cPanel → **"Administrador de Archivos"**
2. Navega a `public_html`
3. Verifica que:
   - ✅ Los archivos nuevos de tu build estén ahí
   - ✅ Los archivos protegidos (`.well-known`, `.htaccess`, `ssl-manager.php`) **siguen intactos**
   - ✅ Tu sitio web funciona correctamente

---

## 🛡️ Archivos Protegidos

El script **NO modificará ni eliminará** estos archivos críticos:

- **`.well-known`** - Necesario para certificados SSL
- **`.htaccess`** - Configuración de Apache
- **`ssl-manager.php`** - Gestión de SSL de Namecheap

Estos archivos se preservan automáticamente durante el despliegue.

---

## 🔧 Solución de Problemas

### Error: "No se encontró deploy.config.json"

```bash
cp deploy.config.example.json deploy.config.json
# Luego edita deploy.config.json con tus datos
```

### Error: "No se encontró el build"

```bash
npm run build
npm run deploy
```

### Error de conexión FTP

**Verifica:**
1. ✅ El **host** es correcto (puede ser `ftp.tudominio.com` o una IP)
2. ✅ El **puerto** es `21` (o el que te indicó Namecheap)
3. ✅ El **username** incluye el dominio completo: `usuario@dominio.com`
4. ✅ La **contraseña** es correcta
5. ✅ Tu firewall no está bloqueando el puerto 21

**Solución alternativa:** Si FTP no funciona, intenta con SFTP:

```json
{
  "method": "sftp",
  "host": "ftp.tudominio.com",
  "port": 22,
  "username": "tuusuario@tudominio.com",
  "password": "tu-contraseña",
  "remotePath": "/public_html",
  "localPath": "dist/llamalo-io/browser"
}
```

### Los archivos no se actualizan en el sitio

1. **Limpia la caché del navegador** (Ctrl+Shift+R o Cmd+Shift+R)
2. Verifica que los archivos se subieron correctamente en el File Manager
3. Asegúrate de que el `remotePath` es exactamente `/public_html`

---

## 📊 Resumen de Datos Necesarios

| Campo | Dónde Encontrarlo | Ejemplo |
|-------|-------------------|---------|
| **method** | Siempre `"ftp"` para Namecheap shared hosting | `"ftp"` |
| **host** | cPanel → Cuentas FTP → Servidor FTP | `"ftp.ejemplo.com"` |
| **port** | cPanel → Cuentas FTP → Puerto | `21` |
| **username** | cPanel → Cuentas FTP → Usuario FTP | `"usuario@ejemplo.com"` |
| **password** | La contraseña FTP que configuraste | `"MiContraseña123"` |
| **remotePath** | Siempre `/public_html` para Namecheap | `"/public_html"` |
| **localPath** | No cambiar, siempre este valor | `"dist/llamalo-io/browser"` |

---

## 🎯 Comandos Rápidos

```bash
# 1. Configurar (solo la primera vez)
cp deploy.config.example.json deploy.config.json
# Edita deploy.config.json con tus datos

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Desplegar (cada vez que quieras actualizar)
npm run deploy:build
```

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa que todos los datos en `deploy.config.json` sean correctos
2. Verifica que puedas conectarte por FTP manualmente con un cliente FTP (FileZilla, Cyberduck, etc.)
3. Asegúrate de que el build se generó correctamente: `npm run build`

¡Listo! Con estos pasos deberías poder desplegar tu aplicación automáticamente a Namecheap. 🎉
