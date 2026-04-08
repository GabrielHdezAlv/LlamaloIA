# Contexto de la web de Llamalo AI para el agente (detallado)

Este documento describe con detalle el mapa de la web (solo zona de cliente, sin admin) para usarlo como contexto o prompt en la configuración del agente de soporte.

---

## Instrucción para el agente

No debes dar información ni orientar sobre rutas ni funcionalidades del área de administración. Al orientar al usuario, indica la **sección** y, si ayuda, la **ruta** de este mapa.

---

## 1. Zona de acceso (sin sesión)

### `/login`
- Formulario de **iniciar sesión** (email y contraseña).
- Enlace a “Regístrate” hacia `/register`.

### `/register`
- Formulario de **registro con email**.
- Enlace a “Iniciar sesión” hacia `/login`.

### `/verify-email`
- Página de **verificación de email** tras registrarse.

---

## 2. Panel de cliente (dashboard)

Tras iniciar sesión el usuario entra al **dashboard** (`/dashboard`). El layout tiene:
- **Barra lateral (sidebar)** a la izquierda con la navegación principal.
- **Barra superior (topbar)** con título de página, modo claro/oscuro, notificaciones y acceso al perfil.
- **Área de contenido** donde se carga la página correspondiente.

En la parte inferior del sidebar suele aparecer: tarjeta de **minutos/créditos** (Plan Starter, minutos disponibles) y botón **“Comprar minutos”**; **avatar del usuario** con menú desplegable (Cuenta, Comunidad privada, idioma ES/ENG, Centro de ayuda, Cerrar sesión); **modo oscuro**; opción de **regalos**; **cerrar sesión**.

---

## 3. Páginas del dashboard (detalle)

### 3.1 Inicio — `/dashboard/home` o `/dashboard`

**Contenido:**
- **Cuatro paneles de resumen** (arriba): Total de llamadas (últimos 7 días, con % vs semana pasada), Llamadas exitosas, Minutos totales, Tiempo ahorrado (cada uno con variación %).
- **Panel principal (izquierda)**: Gráfico de **“Total de llamadas”** (evolución en el tiempo).
- **Panel derecho**: **“Tasa de éxito de las llamadas”** (porcentaje grande) y **tarjeta de minutos** (Plan Starter, minutos disponibles, barra de progreso).
- **Banner “Maximiza tu Eficiencia”**: texto promocional y botón **“Mejorar Plan”** (lleva a upgrade-plan).
- **Sección “Mis agentes” / agentes recientes**: lista o acceso rápido a los agentes del usuario.

---

### 3.2 Agentes — `/dashboard/agents`

**Contenido:**
- **Barra de búsqueda**: “Agentes de búsqueda…” para filtrar la lista.
- **Botón “Crear agente”**: lleva a `/dashboard/agents/create`.
- **Lista/tabla de agentes** (si hay agentes) con columnas: **Nombre**, **Número teléfono**, **Estado**, **Minutos totales**, **Tipo** (inbound/outbound), y **acciones** (editar, etc.).
- Desde cada fila se puede **editar** el agente (ruta `/dashboard/agents/edit/:agentId`).
- Si no hay agentes, se muestra estado vacío y CTA para crear el primero.

---

### 3.3 Crear agente (asistente) — `/dashboard/agents/create`

Asistente en **9 pasos**:

1. **Nombre del agente**: campo de texto.
2. **Tipo de llamada**: elegir Inbound o Outbound.
3. **País y voz**: selector de país, listado de voces con prelisten, parámetros de voz (estabilidad, similitud, estilo, etc.).
4. **Conecta tu negocio**: opción de conectar **Shopify** (enlace a flujo Shopify).
5. **Instrucciones**: saludo (primer mensaje) y **mensaje del sistema** (instrucciones del agente); opción “Generar con IA”; posible configuración de **Make** (integraciones).
6. **Base de conocimientos**: elegir fuentes (PDF, web, texto) para este agente; subir o enlazar.
7. **Prueba de agente**: probar la voz/agente antes de continuar (llamada de prueba).
8. **Conecta tu número de teléfono**: configuración **Twilio** (cuenta existente o nueva: SID, Token); selección o compra de número; validación.
9. **Éxito**: confirmación “Agente creado correctamente” y botón para ir a la lista de agentes.

---

### 3.4 Editar agente — `/dashboard/agents/edit/:agentId`

Tres **pestañas**:

**Pestaña “Principal”:**
- **Nombre del agente** (editable).
- **Primer mensaje** (saludo).
- **Mensaje del sistema** (instrucciones del agente), con botón “Generar con IA”.
- **Número de teléfono** y **etiqueta** (selector de país + número).
- **Idioma** y **Voz** (selector de voz).
- **Parámetros de voz**: Estabilidad, Similitud, Estilo (sliders/inputs numéricos).
- Bloque de **prueba de voz en vivo** (esfera animada, botones iniciar/terminar/probar de nuevo).
- Botón **“Guardar cambios”**.

**Pestaña “Conexiones”:**
- **Shopify**: estado (Conectado / No conectado), dominio si aplica, botón “Añadir nueva” (lleva a onboarding Shopify).
- **Twilio**: estado (Asignada / Sin asignar), datos de cuenta si aplica, botón “Añadir nueva” que abre modal para **Conectar Twilio** (elegir cuenta existente o añadir nueva con SID y Token).

**Pestaña “Base de Conocimiento”:**
- Listado de **fuentes de conocimiento** del agente (PDF, web, texto) con nombre, tipo, estado (procesando, completado, fallido) y opciones de gestión.
- Si no hay fuentes: mensaje indicando que puede añadirlas desde la página global de Base de conocimientos o desde aquí si hay flujo para ello.

---

### 3.5 Números — `/dashboard/numbers`

**Contenido:**
- **Buscador**: “Números de búsqueda…” para filtrar.
- **Botón “Importar número”** (o similar) con desplegable: opción **“Desde Twilio”** para importar números desde una cuenta Twilio.
- **Lista de números de teléfono** asociados a la cuenta: número, estado, agente vinculado (si aplica), acciones (editar, desvincular, etc.).

---

### 3.6 Historial — `/dashboard/history`

**Contenido:**
- **Buscador** por número o contacto.
- **Lista de contactos/llamadas** (panel lateral en desktop): cada ítem muestra número o identificador, avatar, estado (p. ej. “resuelto”) y fecha.
- Al seleccionar un contacto: **detalle de la conversación** (transcripción o resumen de la llamada, duración, resultado, etc.).
- Vista adaptable: en móvil puede alternar entre lista y detalle.

---

### 3.7 Métricas — `/dashboard/metrics`

**Contenido:**
- **Selectores** en la parte superior: **período** (p. ej. Últimos 7 días, Últimos 30 días) y **agente** (filtrar por agente o “Todos”).
- **Gráficos y paneles**: Total llamadas exitosas (o similar), evolución semanal/mensual, comparativas (p. ej. % respecto a semana anterior).
- En móvil: vista simplificada con barras o listado de datos por período.
- Resumen tipo “Total llamadas”, “Total minutos”, etc., según lo que exponga la API.

---

### 3.8 Base de conocimientos — `/dashboard/knowledge-base`

**Contenido:**
- **Barra de búsqueda** para filtrar fuentes.
- **Botón de actualizar/refrescar** documentos.
- **Filtros por tipo**: botones o pestañas para **PDF**, **Web**, **Texto** (y otros si existen).
- **Lista de fuentes de conocimiento**: cada ítem muestra icono por tipo, **nombre**, **tipo** (PDF, WEB, TEXT), **estado** (Procesando, Completado, Fallido), información de chunks o metadatos si aplica, y acciones (ver, eliminar, etc.).
- Permite **añadir nuevas fuentes** (subir PDF, añadir URL, pegar texto) según el tipo elegido. Las fuentes son globales a la cuenta y luego se pueden asociar a agentes (en crear/editar agente).

---

### 3.9 Cuenta (Ajustes) — `/dashboard/account`

Página de **configuración** con **sidebar interno** (en desktop) y **pestañas horizontales** en móvil. Opciones:

**Perfil**
- Foto de perfil (avatar): clic para abrir **modal de selección de avatar** (avatares predeterminados o subir foto propia).
- **Nombre completo** (editable).
- **Email** (solo lectura, con indicación de que no es editable).
- **País** (selector).
- **Nombre del negocio** y **Web del negocio** (opcionales).
- Checkbox **“Acepto recibir comunicaciones de marketing y promociones”**.
- Botón **“Guardar cambios”**.

**Seguridad**
- **Cambiar contraseña**: campos “Nueva contraseña” y “Confirmar nueva contraseña”, botón **“Actualizar contraseña”**.
- **Eliminar cuenta**: bloque con explicación y botón **“Eliminar cuenta”** (rojo). Si hay **eliminación programada**, se muestra aviso con días restantes y opción de cancelar la eliminación.

**Facturación**
- **Suscripción actual**: texto con minutos incluidos y plan (p. ej. “Plan Gratis”).
- Botones: **Cancelar suscripción**, **Editar método de pago**, **Historial de facturas**.
- Botón **“Mejorar plan”** (navega a `/dashboard/upgrade-plan`).
- Texto “Protegido por Stripe” (o similar).

**Regalos**
- Descripción de la sección de regalos.
- **Tarjeta de recompensa Trustpilot**: descripción del bonus por valoración y botón **“Canjear”** (o similar).

(En el menú del sidebar del dashboard también aparecen enlaces a **Comunidad privada** y **Centro de ayuda**; pueden llevar a rutas como `/dashboard/community` y `/dashboard/help` si están implementadas.)

---

### 3.10 Mejorar plan / Comprar minutos — `/dashboard/upgrade-plan`

**Contenido:**
- Título tipo “Precios que crecen contigo” y breve descripción.
- **Tarjetas de planes** (p. ej. Gratis, Pro, Enterprise): nombre, descripción, precio/mes, botón de acción (Contratar, Empezar, etc.), lista de **“Lo que incluye”** (features).
- Plan destacado (p. ej. Pro) suele resaltarse visualmente.
- Sección de **badges de confianza** (Stripe, valoraciones, etc.) al final.

---

## 4. Flujos especiales (fuera del menú lateral)

### 4.1 Configuración de empresa — `/company-setup`

- Se muestra como **modal o pantalla full** cuando la cuenta requiere completar la configuración inicial.
- Puede incluir: **secuencia de bienvenida** (“Llamalo AI”), animación “Crea tu primer agente”, y pasos como:
  - **“¿Qué quieres conseguir con Llamalo?”**: selección de objetivos (atención al cliente, ventas, recordatorios, etc.).
  - Otros pasos de onboarding (nombre empresa, sector, etc.) según el flujo actual.
- Botón “Saltar” en la intro. Al finalizar, el usuario queda en el dashboard.

### 4.2 Integración Shopify

- **`/shopify-onboarding`**: flujo para **conectar la tienda Shopify** (autorización OAuth, selección de tienda, etc.).
- **`/shopify-onboarding/success`**: página de **éxito** tras conectar Shopify (mensaje de confirmación y posible enlace de vuelta al dashboard o al asistente de crear agente).

---

## 5. Barra superior (topbar) y widget de soporte

- **Topbar**: título de la página actual (p. ej. “Panel de control” en Inicio, “Agentes”, “Métricas”), **modo claro/oscuro**, **campana de notificaciones** (dropdown con novedades o avisos), y **avatar/perfil** con acceso rápido a Cuenta y otras opciones (según implementación).
- **Widget de soporte**: flotante en una esquina del dashboard para **contacto o ayuda** (chat, formulario o enlace externo). No es una ruta propia; es un componente visible en las páginas del dashboard.

---

## 6. Resumen de rutas (solo cliente)

| Ruta | Descripción |
|------|-------------|
| `/login` | Iniciar sesión |
| `/register` | Registro |
| `/verify-email` | Verificación de email |
| `/dashboard` | Panel (redirige a home) |
| `/dashboard/home` | Inicio: resumen, gráficos, minutos, agentes |
| `/dashboard/agents` | Lista de agentes |
| `/dashboard/agents/create` | Asistente crear agente (9 pasos) |
| `/dashboard/agents/edit/:agentId` | Editar agente (Principal, Conexiones, Base de conocimiento) |
| `/dashboard/numbers` | Números de teléfono |
| `/dashboard/history` | Historial de llamadas |
| `/dashboard/metrics` | Métricas |
| `/dashboard/knowledge-base` | Base de conocimientos (fuentes globales) |
| `/dashboard/account` | Cuenta: Perfil, Seguridad, Facturación, Regalos |
| `/dashboard/upgrade-plan` | Planes y compra de minutos |
| `/company-setup` | Configuración inicial de empresa |
| `/shopify-onboarding` | Conectar Shopify |
| `/shopify-onboarding/success` | Éxito conexión Shopify |

---

## Texto para copiar en el prompt del agente (versión resumida)

Si prefieres una versión más corta para el prompt, usa este bloque:

**Contexto de la web (mapa para el agente):**  
La web de Llamalo AI tiene zona de **acceso** (login, register, verify-email) y **panel de cliente** (dashboard). No des información sobre el área de administración.  
**Dashboard:** sidebar con Inicio, Agentes, Números, Historial, Métricas, Base de conocimientos; abajo: minutos, Comprar minutos, perfil (Cuenta, Comunidad, idioma, Ayuda, Cerrar sesión).  
**Páginas:** Inicio = resumen (llamadas, minutos, tasa éxito, gráfico, tarjeta minutos, Mejorar plan) y lista de agentes. Agentes = lista con búsqueda, Crear agente, editar por agente. Crear agente = asistente 9 pasos (nombre, tipo llamada, país/voz, Shopify, instrucciones, base conocimiento, prueba, Twilio, éxito). Editar agente = pestañas Principal (nombre, mensajes, número, idioma/voz, parámetros voz, prueba), Conexiones (Shopify, Twilio), Base de conocimiento. Números = búsqueda, importar desde Twilio, lista números. Historial = lista llamadas/contactos y detalle conversación. Métricas = período, agente, gráficos. Base de conocimientos = búsqueda, tipos PDF/Web/Texto, lista fuentes y estados. Cuenta = Perfil (avatar, nombre, email, país, negocio, marketing), Seguridad (cambiar contraseña, eliminar cuenta), Facturación (suscripción, método pago, facturas, Mejorar plan), Regalos (Trustpilot). Mejorar plan = planes y precios. Flujos: company-setup (onboarding empresa), shopify-onboarding y success (conectar Shopify). Topbar = título, modo oscuro, notificaciones, perfil. Widget soporte = ayuda en esquina. Al orientar, indica sección y ruta sin mencionar admin.
