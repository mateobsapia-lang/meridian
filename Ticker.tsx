/**
 * SEO hook — updates document title and meta description per page
 * Call at the top of each page component
 */
export function useSEO(title: string, description?: string) {
  document.title = `${title} · Meridian`;
  
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && description) {
    metaDesc.setAttribute('content', description);
  }

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', `${title} · Meridian`);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && description) ogDesc.setAttribute('content', description);
}

/** Track custom events to GA4 */
export function trackEvent(event: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, params);
  }
}
