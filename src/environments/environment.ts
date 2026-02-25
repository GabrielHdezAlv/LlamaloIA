/**
 * Configuración de entorno (desarrollo).
 * Añade tu API key de Google Cloud Translation (o DeepL) para traducción automática al inglés.
 * Cómo obtenerla: https://cloud.google.com/translate/docs/setup
 */
export const environment = {
  production: false,
  /** API key para Google Cloud Translation API v2. Dejar vacío para usar diccionario estático en inglés. */
  translationApiKey: '',
};
