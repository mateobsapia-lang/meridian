import type { Deal, BuyerProfile } from '../types';

/**
 * Calcula un score de match entre un deal y un perfil de buyer.
 * Retorna un número entre 0 y 100.
 */
export function calculateMatchScore(deal: Deal, profile: BuyerProfile): number {
  let score = 0;
  let factors = 0;

  // 1. Ticket range (peso 40%)
  const asking = deal.askingPrice;
  if (asking >= profile.ticketMin && asking <= profile.ticketMax) {
    score += 40;
  } else if (asking < profile.ticketMin) {
    const ratio = asking / profile.ticketMin;
    score += Math.round(40 * ratio);
  } else {
    const ratio = profile.ticketMax / asking;
    score += Math.round(40 * ratio);
  }
  factors += 40;

  // 2. Industria (peso 35%)
  if (profile.industries.length > 0) {
    const match = profile.industries.some(ind =>
      deal.industria.toLowerCase().includes(ind.toLowerCase()) ||
      ind.toLowerCase().includes(deal.industria.toLowerCase())
    );
    if (match) score += 35;
  } else {
    score += 35; // sin preferencia = match total
  }
  factors += 35;

  // 3. Región (peso 25%)
  if (profile.regions.length > 0) {
    const match = profile.regions.some(r =>
      deal.region.toLowerCase().includes(r.toLowerCase()) ||
      r.toLowerCase().includes(deal.region.toLowerCase())
    );
    if (match) score += 25;
    else score += 5; // penalidad leve, no nula
  } else {
    score += 25;
  }
  factors += 25;

  return Math.min(100, Math.round((score / factors) * 100));
}

/** Match score por defecto cuando no hay perfil de buyer */
export function defaultMatchScore(deal: Deal): number {
  // Score basado en calidad del deal: margen EBITDA + crecimiento
  const margin = deal.ebitda / deal.revenue;
  const growth = deal.crecimiento / 100;
  return Math.min(99, Math.round(50 + margin * 30 + growth * 20));
}
