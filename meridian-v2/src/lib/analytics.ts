/**
 * Google Analytics 4 — configuración
 *
 * Para activar:
 * 1. Reemplazá GA4_ID con tu ID real de GA4 (formato: G-XXXXXXXXXX)
 * 2. Descomentá la línea initGA4() en App.tsx
 *
 * Para obtener tu ID:
 * analytics.google.com → Administrar → Flujos de datos → Web → ID de medición
 */

const GA4_ID = 'G-XXXXXXXXXX'; // ← Reemplazá con tu ID real

export function initGA4() {
  if (GA4_ID === 'G-XXXXXXXXXX') {
    console.warn('[Meridian] GA4 no configurado. Reemplazá GA4_ID en src/lib/analytics.ts');
    return;
  }

  // Cargar script de GA4
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  // Inicializar gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) { window.dataLayer.push(args); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA4_ID, {
    page_path: window.location.pathname,
    anonymize_ip: true,
  });
}

/** Trackear un evento custom */
export function trackEvent(event: string, params?: Record<string, string | number>) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', event, params);
}

/** Eventos predefinidos de Meridian */
export const events = {
  listar_click:        () => trackEvent('listar_click'),
  calculadora_uso:     (sector: string) => trackEvent('calculadora_uso', { sector }),
  diagnostico_inicio:  () => trackEvent('diagnostico_inicio'),
  diagnostico_fin:     (score: number) => trackEvent('diagnostico_fin', { score }),
  reporte_generado:    (industria: string) => trackEvent('reporte_generado', { industria }),
  simulador_uso:       () => trackEvent('simulador_uso'),
  nda_solicitado:      (dealId: string) => trackEvent('nda_solicitado', { deal_id: dealId }),
  chat_abierto:        () => trackEvent('chat_abierto'),
  wizard_paso:         (paso: number) => trackEvent('wizard_paso', { paso }),
};

// Extend window types
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
