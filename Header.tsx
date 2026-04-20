/**
 * Email notifications via EmailJS (free tier: 200 emails/month)
 * Setup: https://www.emailjs.com
 * 
 * INSTRUCCIONES:
 * 1. Crear cuenta en emailjs.com
 * 2. Add Email Service (Gmail)
 * 3. Create Template con variables: {{from_name}}, {{deal_id}}, {{industry}}, {{asking}}, {{email}}
 * 4. Reemplazar los IDs de abajo con los tuyos
 */

const EMAILJS_SERVICE_ID = 'TU_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'TU_PUBLIC_KEY';
const ADMIN_EMAIL = 'TU_EMAIL@gmail.com'; // Tu email para recibir notificaciones

export async function sendDealNotificationEmail(params: {
  dealId: string;
  nombreFantasia: string;
  industria: string;
  askingPrice: number;
  representante: string;
  email: string;
  region: string;
}) {
  // Solo intentar si EmailJS está configurado
  if (EMAILJS_SERVICE_ID === 'TU_SERVICE_ID') {
    console.log('EmailJS no configurado — omitiendo email');
    return;
  }

  try {
    const { default: emailjs } = await import('@emailjs/browser');
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: ADMIN_EMAIL,
        from_name: params.representante || 'Vendedor',
        deal_id: params.dealId,
        empresa: params.nombreFantasia,
        industry: params.industria,
        region: params.region,
        asking: `USD ${(params.askingPrice / 1000).toFixed(0)}K`,
        contact_email: params.email,
        link: `https://meridian-market.vercel.app/deal/${params.dealId}`,
      },
      EMAILJS_PUBLIC_KEY
    );
  } catch (err) {
    // No bloquear el flujo si falla el email
    console.warn('Email notification failed:', err);
  }
}
