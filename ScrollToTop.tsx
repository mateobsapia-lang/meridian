import { useState, useEffect } from 'react';
import { getPublishedDeals } from '../lib/firestore';
import type { Deal } from '../types';

// Fallback static items while loading
const FALLBACK = [
  { id: 'MRD-001', industria: 'SaaS / Tech', region: 'CABA', ebitda: 910000, crecimiento: 35, askingPrice: 7100000 },
  { id: 'MRD-002', industria: 'Agro', region: 'Córdoba', ebitda: 1400000, crecimiento: 18, askingPrice: 6300000 },
  { id: 'MRD-003', industria: 'Salud', region: 'CABA', ebitda: 680000, crecimiento: 22, askingPrice: 4200000 },
];

export function Ticker() {
  const [deals, setDeals] = useState<Partial<Deal>[]>(FALLBACK);

  useEffect(() => {
    getPublishedDeals().then(d => { if (d.length > 0) setDeals(d); }).catch(() => {});
  }, []);

  const fmtUSD = (n: number) => `USD ${(n / 1_000_000).toFixed(1)}M`;
  const items = [...deals, ...deals, ...deals];

  return (
    <div className="bg-ink overflow-hidden py-[9px] border-b border-white/10" aria-hidden="true">
      <div className="flex animate-tick whitespace-nowrap w-max">
        {items.map((d, i) => (
          <div key={i} className="flex items-center gap-[18px] px-9 font-mono text-[11px] text-white/55 border-r border-white/10">
            <span className="text-white/85 font-medium">{d.id}</span>
            <span className="bg-white/10 px-[7px] py-[1px] rounded-sm text-[10px] text-white/50">{d.industria}</span>
            <span>{d.region}</span>
            <span className="text-white">EBITDA {fmtUSD(d.ebitda ?? 0)}</span>
            <span className={(d.crecimiento ?? 0) > 15 ? 'text-[#4ade80]' : 'text-[#f87171]'}>+{d.crecimiento}%</span>
            <span>{fmtUSD(d.askingPrice ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
