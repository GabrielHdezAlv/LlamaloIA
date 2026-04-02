# Estado actual: integración Shopify ↔ Llamalo AI

Documento técnico para cerrar la sincronización Shopify ↔ Llamalo AI.  
**Objetivo:** foto real del estado actual (frontend completado desde este repo; backend debe completarse por el equipo correspondiente).

---

## 🧩 FRONTEND – Estado actual

### ¿Existe ya botón "Conectar tienda Shopify"?
**Sí.** No hay un botón con ese texto exacto; hay varios puntos de entrada:

- **Página dedicada “Conectar Shopify”:** título "Conecta tu cuenta de Shopify" y botón **"Continuar"** que lanza el flujo OAuth.
- **Editar agente:** en la sección Shopify, botón **"Añadir nueva"** que navega a la misma página de onboarding.
- **Crear agente (wizard):** paso "Conecta tu negocio de Shopify" con enlace que lleva al onboarding.

### Ruta donde está
- **Onboarding (conectar tienda):** `/shopify-onboarding`  
  - Componente: `src/app/pages/shopify-onboarding/shopify-onboarding.component.ts`
- **Éxito tras OAuth:** `/shopify-onboarding/success`  
  - Componente: `src/app/pages/shopify-success/shopify-success.component.ts`
- **Editar agente (botón "Añadir nueva"):** sección Shopify en `src/app/pages/edit-agent/edit-agent.component.html` (aprox. líneas 1056–1078).
- **Crear agente:** `src/app/pages/new-create-agents/` y paso `connect-business-step` con `goToShopifyOnboarding()`.

### ¿Pide dominio manualmente o usamos instalación directa?
**Dominio manual.** El usuario escribe el dominio en un input con placeholder "Ej. mi-tienda.myshopify.com". Se valida que termine en `.myshopify.com`. También puede elegir una tienda ya conectada desde la lista (si hay varias).

### ¿Estamos redirigiendo al OAuth de Shopify?
**Sí.** El front no construye la URL de OAuth. Llama al backend para obtenerla y luego redirige con `window.location.href = res.authUrl`.

### URL exacta que generamos (desde frontend)
El frontend **no** genera la URL de OAuth. Hace un **GET** al backend:

- **Base API (hardcodeada en frontend):** `https://llamaloiabackend-5294.onrender.com`
- **Llamada:**  
  `GET {API_URL}/shopify/auth?shop={shop}&redirect=false&returnTo={returnTo}`  
  - `shop`: dominio ingresado o tienda seleccionada (ej. `mi-tienda.myshopify.com`).
  - `redirect`: siempre `false` (el backend devuelve `authUrl` en JSON).
  - `returnTo`: URL de vuelta tras OAuth: `{origin}/shopify-onboarding/success`.

La **URL de OAuth** la construye el backend y se devuelve en `res.authUrl`; el front solo hace `window.location.href = res.authUrl`.

### ¿Incluimos state dinámico?
**No visible en frontend.** El state lo debe generar y validar el backend. El front solo envía `shop` y `returnTo` en el GET a `/shopify/auth`.

### ¿Scopes actuales enviados?
**No se envían desde el frontend.** Los scopes los define el backend al construir la URL de autorización.

### ¿Tenemos pantalla de "Conectando…" o manejo de errores?
- **Conectando:** Sí. Overlay con spinner y mensaje: *"Completando el proceso de asignar tienda a tu cuenta de Llamalo AI…"* (cuando `loading === true`).
- **Errores:** Sí. Si el GET a `/shopify/auth` falla o no devuelve `authUrl`, se muestra `errorMessage` en un banner rojo (ej. "No se pudo conectar con el servidor. Inténtalo de nuevo." o el `message` que venga del backend).

### ¿Qué ocurre si falla?
- En **shopify-onboarding:** se muestra el mensaje de error y el usuario se queda en la misma página (puede corregir dominio o reintentar).
- En **shopify-onboarding/success:** la página de success lee `?shopify=error` (y opcionalmente `code`, `message`). Muestra "Error al conectar con Shopify" y un botón "Volver" que navega a `/dashboard/agents/create` sin query params.

### ¿Dónde redirigimos tras éxito?
- **Backend** debe redirigir al usuario a la URL que recibe como `returnTo`:  
  `{origin}/shopify-onboarding/success`  
  (con los query params que el backend decida, por ejemplo `shop`, `shopify=success` o `shopify=error`).
- Desde **shopify-onboarding/success** el usuario puede:
  - **"Continuar configurando el agente"** → navega a `/dashboard/agents/create?shopify=success&shop={shop}&step=connectBusiness`.
  - En error, **"Volver"** → `/dashboard/agents/create` sin params.

### ¿Guardamos algo en frontend?
- **No se guarda ningún token en frontend.**
- **Shop domain:** no se persiste en localStorage ni en el front. Se usa:
  - En la página de success: leído de query params (`shop`) para mostrarlo y pasarlo al crear agente.
  - En el wizard de crear agente: `shopifyConnectedDomain` en memoria (y en draft del paso) y se envía al backend al crear el agente como `shopifyDomain`.
  - En editar agente: lista de tiendas conectadas viene del perfil de usuario (`profile.integrations.shopify`); el dominio seleccionado para el agente se envía al actualizar el agente.

### ¿Estado de conexión en BD?
**No se gestiona desde el frontend.** El front asume que:
- El perfil de usuario (`GET /users/profile` o equivalente) incluye `integrations.shopify`: array de `{ connected, shopDomain }`.
- Los agentes tienen `shopifyDomain` (string o null).  
Quién escribe en BD es el backend (tras OAuth y al crear/actualizar agente).

### ¿Permitimos múltiples tiendas por usuario?
**Sí.** En la UI:
- En **shopify-onboarding** se listan las tiendas ya conectadas (`connectedStores`) y se puede "Usar esta tienda" o "Añadir nueva tienda".
- En **editar agente** se cargan `shopifyStores` desde `profile.integrations.shopify` y el usuario elige una para el agente.
- El modelo de perfil tiene `integrations.shopify` como array.

---

➡️ **Una vez completado, pasar al equipo de BACKEND** 👇

---

## 🔐 BACKEND – Estado actual

*(Este repositorio solo contiene el frontend Angular. El backend está en otro repo / servicio: `https://llamaloiabackend-5294.onrender.com`. Las respuestas deben rellenarlas el equipo de backend.)*

### ¿Existe endpoint de callback?
- **Ruta exacta:** *(rellenar backend)*

### ¿Validamos state?
- *(rellenar backend)*

### ¿Validamos HMAC?
- *(rellenar backend)*

### ¿Estamos intercambiando code por access_token?
- **Endpoint usado:** *(rellenar backend)*
- **API version:** *(rellenar backend)*

### ¿Dónde se guarda el token?
- *(rellenar backend)*

### Modelo de datos actual
- **¿Tabla Shops existe?** *(rellenar backend)*
- **Campos actuales:** *(rellenar backend)*
- **¿Relación con usuario SaaS?** *(rellenar backend)*

### ¿Tenemos webhooks?
- **¿Registramos app/uninstalled?** *(rellenar backend)*
- **¿Otros webhooks?** *(rellenar backend)*
- **¿Se validan correctamente?** *(rellenar backend)*

### ¿Ya estamos consumiendo datos?
- **¿Pedidos?** *(rellenar backend)*
- **¿Productos?** *(rellenar backend)*
- **¿Fulfillments?** *(rellenar backend)*

### ¿Sincronización inicial o solo on-demand?
- *(rellenar backend)*

### ¿Arquitectura actual?
- **¿Multi-tenant real?** *(rellenar backend)*
- **¿Un token por tienda?** *(rellenar backend)*
- **¿Soportamos múltiples tiendas por usuario?** *(rellenar backend)*

---

## 🎯 Objetivo

Confirmar que el flujo completo es:

**Usuario SaaS → OAuth Shopify → Guardado seguro de token → Sincronización → Uso por agente IA**

Cuando tengamos este documento completo (frontend + backend), se enviará para revisión técnica y cierre final del flujo.
