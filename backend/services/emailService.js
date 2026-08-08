const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function buildTemplate({ heading, bodyText, ctaLabel, ctaUrl }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
    <h2 style="margin: 0 0 16px; color: #1e3a8a;">${heading}</h2>
    <p style="margin: 0 0 24px; line-height: 1.5;">${bodyText}</p>
    <a href="${ctaUrl}" style="display: inline-block; background: #1e3a8a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">${ctaLabel}</a>
    <p style="margin: 24px 0 0; font-size: 12px; color: #6b7280;">Si el botón no funciona, copia y pega esta liga en tu navegador:<br>${ctaUrl}</p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #6b7280;">Este enlace expira en 24 horas. Sistema de Control de Proyectores — UNACH.</p>
  </div>`;
}

async function sendAuthEmail({ to, subject, heading, bodyText, ctaLabel, ctaUrl }) {
  const html = buildTemplate({ heading, bodyText, ctaLabel, ctaUrl });
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
    text: `${bodyText}\n\n${ctaLabel}: ${ctaUrl}`
  });

  // El SDK de Resend NO lanza excepción en errores de la API — resuelve con
  // { data: null, error: {...} }. Hay que revisarlo explícitamente.
  if (result.error) {
    throw new Error(result.error.message || 'Error al enviar el correo');
  }

  return result;
}

async function sendInvitationEmail({ to, rawToken }) {
  const ctaUrl = `${process.env.FRONTEND_URL}/completar-registro?token=${rawToken}`;
  return sendAuthEmail({
    to,
    subject: 'Invitación — Control de Proyectores UNACH',
    heading: 'Te invitaron a Control de Proyectores',
    bodyText: 'Un administrador te dio de alta en el sistema de control de proyectores. Completa tu registro para crear tu contraseña y empezar a usarlo.',
    ctaLabel: 'Completar registro',
    ctaUrl
  });
}

async function sendPasswordResetEmail({ to, rawToken }) {
  const ctaUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  return sendAuthEmail({
    to,
    subject: 'Restablecer contraseña — Control de Proyectores UNACH',
    heading: 'Restablece tu contraseña',
    bodyText: 'Recibimos una solicitud para definir o restablecer tu contraseña. Si no la solicitaste, puedes ignorar este correo.',
    ctaLabel: 'Definir contraseña',
    ctaUrl
  });
}

module.exports = { sendInvitationEmail, sendPasswordResetEmail };
