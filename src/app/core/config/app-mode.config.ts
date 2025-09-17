/**
 * Configuración del modo de la aplicación
 * 
 * Cambia este valor para controlar si las rutas se muestran o no en la URL:
 * - true: Modo desarrollo (rutas visibles en URL)
 * - false: Modo producción (rutas ocultas en URL)
 */
export const APP_MODE = {
  // Cambia este valor para activar/desactivar las rutas en la URL
  SHOW_ROUTES: true, // true = work mode, false = prod mode
  
  // Configuraciones adicionales
  IS_DEVELOPMENT: false,
  IS_PRODUCTION: true
};

/**
 * Función helper para obtener el modo actual
 */
export function getAppMode(): 'work' | 'prod' {
  return APP_MODE.SHOW_ROUTES ? 'work' : 'prod';
}

/**
 * Función helper para verificar si estamos en modo desarrollo
 */
export function isWorkMode(): boolean {
  return APP_MODE.SHOW_ROUTES;
}

/**
 * Función helper para verificar si estamos en modo producción
 */
export function isProdMode(): boolean {
  return !APP_MODE.SHOW_ROUTES;
}
