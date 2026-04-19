import { useState } from 'react';
import { useAppContext } from '../AppContext';

const INDUSTRIES = [
  { name: 'SaaS / Tecnología', multiplier: 7.5 },
  { name: 'Salud / Clínicas y Laboratorios', multiplier: 6.0 },
  { name: 'Servicios Profesionales B2B', multiplier: 5.5 },
  { name: 'Alimentos y Bebidas', multiplier: 5.0 },
  { name: 'Logística y Transporte', multiplier: 4.8 },
  { name: 'Agro / Exportación', multiplier: 4.5 },
  { name: 'Manufactura Industrial', multiplier: 4.2 },
  { name: 'Otros Sectores', multiplier: 4.0 },
  { name: 'Retail / Omnicanal', multiplier: 3.5 },
  { name: 'Construcción e Ingeniería', multiplier: 3.5 },
];

export function ValuationCalculator() {
  const { setSellerWizardOpen } = useAppContext();
  const [revenue, setRevenue] = useState(2500000);
  const [margin, setMargin] = useState(20);
  const [industryMult, setIndustryMult] = useState(4.2);
  const [isRecurring, setIsRecurring] = useState(false);

  const ebitda = revenue * (margin / 100);
  const effectiveMultiple = isRecurring ? industryMult * 1.2 : industryMult;
  const valMin = ebitda * effectiveMultiple * 0.85;
  const valMax = ebitda * effectiveMultiple * 1.15;
  const fmtUSD = (v: number) => `USD ${(v / 1_000_000).toFixed(2)}M`;
  const fmtShort = (v: number) => v >= 1_000_000
    ? `USD ${(v / 1_000_000).toFixed(1)}M`
    : `USD ${(v / 1000).toFixed(0)}K`;

  return (
    <div className="border border-border-strong shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-ink px-8 py-6 border-b border-white/10">
        <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-accent mb-1">Motor de Precisión</div>
        <h2 className="font-serif text-[22px] md:text-[28px] font-bold text-white leading-tight">
          ¿Cuál es el valor real de tu empresa?
        </h2>
      </div>

      {/* Body */}
      <div className="bg-[#0d0e10] p-6 md:p-10 flex flex-col gap-6">

        {/* Sector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Sector industrial</span>
            <span className="font-mono text-[10px] text-accent font-medium">{industryMult.toFixed(1)}× base</span>
          </div>
          <div className="relative">
            <select value={industryMult} onChange={e => setIndustryMult(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 text-white text-[13px] py-3 px-4 outline-none focus:border-accent appearance-none cursor-pointer">
              {INDUSTRIES.map(i => <option key={i.name} value={i.multiplier}>{i.name}</option>)}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-[10px] pointer-events-none">▼</span>
          </div>
        </div>

        {/* Sliders — side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between font-mono mb-2">
              <span className="text-white/40 uppercase tracking-widest text-[9px]">Ventas anuales (LTM)</span>
              <span className="text-white font-medium text-[11px]">{fmtShort(revenue)}</span>
            </div>
            <input type="range" min="500000" max="20000000" step="100000"
              value={revenue} onChange={e => setRevenue(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none accent-accent cursor-pointer" />
            <div className="flex justify-between font-mono text-[9px] text-white/20 mt-1">
              <span>USD 500K</span><span>USD 20M</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between font-mono mb-2">
              <span className="text-white/40 uppercase tracking-widest text-[9px]">Margen EBITDA</span>
              <span className="text-white font-medium text-[11px]">{margin}%</span>
            </div>
            <input type="range" min="5" max="50" step="1"
              value={margin} onChange={e => setMargin(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none accent-accent cursor-pointer" />
            <div className="flex justify-between font-mono text-[9px] text-white/20 mt-1">
              <span>5%</span><span>50%</span>
            </div>
          </div>
        </div>

        {/* Recurring toggle */}
        <button onClick={() => setIsRecurring(!isRecurring)}
          className="flex items-center justify-between p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors w-full text-left">
          <div>
            <div className="text-[13px] font-medium text-white">+60% ingresos recurrentes</div>
            <div className="text-[10px] text-white/40 font-mono mt-0.5">Prima de liquidez +20% en múltiplo</div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${isRecurring ? 'bg-accent' : 'bg-white/20'}`}>
            <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-all ${isRecurring ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        {/* Output */}
        <div className="border-t border-white/10 pt-6">
          <div className="grid grid-cols-2 gap-3 mb-4 text-[12px] font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-white/40 text-[9px] uppercase tracking-widest">EBITDA estimado</span>
              <span className="text-white font-medium">{fmtShort(ebitda)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/40 text-[9px] uppercase tracking-widest">Múltiplo efectivo</span>
              <span className="text-white font-medium">{effectiveMultiple.toFixed(2)}×</span>
            </div>
          </div>

          {/* Result box */}
          <div className="bg-accent/10 border border-accent/30 p-6 text-center">
            <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-4">Valuación estimada de mercado</div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="font-serif text-[32px] md:text-[42px] font-bold text-white">{fmtUSD(valMin)}</span>
              <span className="text-white/20 text-[24px] font-light">—</span>
              <span className="font-serif text-[32px] md:text-[42px] font-bold text-white">{fmtUSD(valMax)}</span>
            </div>
            <div className="font-mono text-[9px] text-white/30 mt-3">Rango orientativo · No constituye oferta de compra</div>
          </div>

          <button onClick={() => setSellerWizardOpen(true)}
            className="w-full mt-4 text-[11px] font-mono tracking-widest uppercase border border-accent/40 text-accent px-5 py-3 hover:bg-accent hover:text-white transition-colors">
            Listar mi empresa y obtener valuación real →
          </button>
        </div>
      </div>
    </div>
  );
}
