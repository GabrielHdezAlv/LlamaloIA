/**
 * HTML del email de verificación (solo estilos en línea).
 *
 * **NestJS:** copia el contenido de `verification-email-nest-body.fragment.txt` dentro de
 * `const html = \` ... \`;` en `sendVerificationEmail` (sustituye el bloque antiguo).
 * Recomendado: escapa el token antes de interpolar (`escapeHtml(verificationToken)`).
 *
 * @param verificationToken Código (se escapa para HTML en esta función).
 * @param options.logoUrl URL absoluta del logo PNG blanco. Por defecto `app.llamalo.ai`.
 */
export function buildVerificationEmailHtml(
  verificationToken: string,
  options?: { logoUrl?: string },
): string {
  const logoUrl =
    options?.logoUrl !== undefined && options.logoUrl !== ''
      ? options.logoUrl
      : 'https://app.llamalo.ai/assets/logo_blanco.png';

  return renderVerificationEmailHtml({
    logoSrcEscaped: escapeAttribute(logoUrl),
    tokenEscaped: escapeHtml(verificationToken),
  });
}

/** Misma maquetación que el fragmento para Nest (`verification-email-nest-body.fragment.txt`). */
function renderVerificationEmailHtml(parts: {
  logoSrcEscaped: string;
  tokenEscaped: string;
}): string {
  const { logoSrcEscaped, tokenEscaped } = parts;
  const font =
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const logoImg = `<img src="${logoSrcEscaped}" alt="Llamalo AI" width="112" style="display:block;margin:0 auto 14px;border:0;outline:none;text-decoration:none;height:auto;max-width:112px;width:112px;" />`;

  return `
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap" />
      <div style="font-family: ${font}; background-color: #e8ecf4; padding: 28px 14px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #dce3ee; box-shadow: 0 12px 40px rgba(27, 37, 89, 0.1);">
          <div style="font-family: ${font}; background: linear-gradient(145deg, #1b2559 0%, #121832 42%, #1e3a62 100%); padding: 36px 24px 32px; text-align: center;">
            ${logoImg}
            <h1 style="font-family: ${font}; margin: 0; color: #ffffff; font-size: 26px; line-height: 1.2; font-weight: 700;">Bienvenido a Llamalo AI</h1>
            <p style="font-family: ${font}; margin: 14px 0 0; font-size: 14px; line-height: 1.45; color: rgba(191, 219, 254, 0.95);">Verificación de correo electrónico</p>
            <div style="margin: 22px auto 0; max-width: 280px; height: 3px; border-radius: 999px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);"></div>
          </div>

          <div style="padding: 28px 24px 8px;">
            <div style="font-family: ${font}; background-color: #f4f6fb; padding: 22px 20px; border-radius: 12px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
              <h2 style="font-family: ${font}; color: #1b2559; margin: 0 0 12px; font-size: 18px; line-height: 1.3; font-weight: 700;">Verifica tu correo electrónico</h2>
              <p style="font-family: ${font}; color: #475569; line-height: 1.65; margin: 0; font-size: 15px;">
                Gracias por registrarte en Llamalo AI. Para activar tu cuenta, introduce el siguiente código de verificación en la aplicación:
              </p>
            </div>

            <div style="text-align: center; margin: 28px 0 26px;">
              <div style="font-family: ${font}; background: linear-gradient(180deg, #ffffff 0%, #f1f4ff 100%); color: #1b2559; padding: 18px 36px;
                          border-radius: 12px; display: inline-block; border: 2px solid #c7d2e8;
                          font-weight: 700; font-size: 32px; letter-spacing: 0.28em; font-variant-numeric: tabular-nums;
                          box-shadow: 0 4px 14px rgba(27, 37, 89, 0.08);">
                ${tokenEscaped}
              </div>
              <p style="font-family: ${font}; margin: 14px 0 0; font-size: 12px; color: #94a3b8;">Código de un solo uso</p>
            </div>

            <div style="font-family: ${font}; background-color: #f0f4ff; border-left: 4px solid #1b2559; padding: 16px 18px; margin: 0 0 8px; border-radius: 0 10px 10px 0;">
              <p style="font-family: ${font}; margin: 0; color: #334155; line-height: 1.6; font-size: 14px;">
                <strong style="font-family: ${font}; color: #1b2559;">Importante:</strong> este código caduca a las <strong style="font-family: ${font}; color: #1b2559;">24 horas</strong>.
                Si no verificas tu correo en ese plazo, deberás solicitar un nuevo código desde el registro.
              </p>
            </div>
          </div>

          <div style="font-family: ${font}; background: #fafbfc; border-top: 1px solid #e8ecf0; padding: 22px 24px 26px;">
            <p style="font-family: ${font}; color: #94a3b8; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
              Si no te registraste en Llamalo AI, ignora este mensaje.
            </p>
            <p style="font-family: ${font}; color: #cbd5e1; font-size: 11px; text-align: center; margin: 12px 0 0; line-height: 1.5;">
              © 2026 Llamalo AI · Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttribute(text: string): string {
  return escapeHtml(text).replace(/'/g, '&#39;');
}
