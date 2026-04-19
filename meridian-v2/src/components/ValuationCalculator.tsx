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

  const fmtUSD = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  const fmtM = (v: number) => `USD ${(v / 1_000_000).toFixed(2)}M`;

  return (
    <div className="bg-ink text-white relative overflow-hidden border border-border-strong shadow-2xl">
      <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[150%] bg-accent/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT */}
        <div className="p-8 md:p-12 flex flex-col justify-center gap-6 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-accent">Motor de Precisión</div>
          <h2 className="font-serif text-[26px] sm:text-[32px] md:text-[40px] font-bold leading-[1.05] tracking-[-0.02em]">
            ¿Cuál es el valor real de tu empresa hoy?
          </h2>
          <p className="text-[13px] text-white/60 leading-[1.65] font-light max-w-sm">
            Estimá la valuación de tu compañía combinando tus métricas financieras con los múltiplos de transacción del mercado privado argentino.
          </p>
          <button
            onClick={() => setSellerWizardOpen(true)}
            className="mt-2 self-start text-[11px] font-mono tracking-widest uppercase border border-accent/40 text-accent px-5 py-3 hover:bg-accent hover:text-white transition-colors"
          >
            Listar mi empresa →
          </button>
        </div>

        {/* RIGHT — calculator */}
        <div className="p-8 md:p-12 bg-[#0d0e10] flex flex-col gap-7">

          {/* Sector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Sector</span>
              <span className="font-mono text-[9px] text-accent">{industryMult.toFixed(1)}× base</span>
            </div>
            <div className="relative">
              <select
                value={industryMult}
                onChange={e => setIndustryMult(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 text-white text-[13px] py-3 px-4 outline-none focus:border-accent appearance-none cursor-pointer"
              >
                {INDUSTRIES.map(i => <option key={i.name} value={i.multiplier}>{i.name}</option>)}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-[10px] pointer-events-none">▼</span>
            </div>
          </div>

          {/* Recurring toggle */}
          <button
            onClick={() => setIsRecurring(!isRecurring)}
            className="flex items-center justify-between p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors w-full text-left"
          >
            <div>
              <div className="text-[12px] font-medium text-white mb-0.5">+60% ingresos recurrentes</div>
              <div className="text-[10px] text-white/40 font-mono">Prima de liquidez +20% en múltiplo</div>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${isRecurring ? 'bg-accent' : 'bg-white/20'}`}>
              <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-all ${isRecurring ? 'left-6' : 'left-1'}`} />
            </div>
          </button>

          {/* Revenue slider */}
          <div>
            <div className="flex justify-between font-mono mb-3">
              <span className="text-white/40 uppercase tracking-widest text-[9px]">Ventas Anuales (LTM)</span>
              <span className="text-white font-medium text-[12px]">{fmtUSD(revenue)}</span>
            </div>
            <input type="range" min="500000" max="20000000" step="100000"
              value={revenue} onChange={e => setRevenue(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none accent-accent cursor-pointer" />
            <div className="flex justify-between font-mono text-[9px] text-white/20 mt-1">
              <span>USD 500K</span><span>USD 20M</span>
            </div>
          </div>

          {/* Margin slider */}
          <div>
            <div className="flex justify-between font-mono mb-3">
              <span className="text-white/40 uppercase tracking-widest text-[9px]">Margen EBITDA</span>
              <span className="text-white font-medium text-[12px]">{margin}%</span>
            </div>
            <input type="range" min="5" max="50" step="1"
              value={margin} onChange={e => setMargin(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none accent-accent cursor-pointer" />
            <div className="flex justify-between font-mono text-[9px] text-white/20 mt-1">
              <span>5%</span><span>50%</span>
            </div>
          </div>

          {/* Output */}
          <div className="border-t border-white/10 pt-6 flex flex-col gap-3">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-white/40">EBITDA estimado</span>
              <span className="text-white/70">{fmtUSD(ebitda)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-white/40">Múltiplo efectivo</span>
              <span className="text-white/70">{effectiveMultiple.toFixed(2)}×</span>
            </div>
            <div className="mt-2 bg-accent/10 border border-accent/30 p-5 text-center">
              <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-3">Valuación estimada</div>
              <div className="font-serif font-bold text-white leading-none">
                <span className="text-[28px] sm:text-[36px]">{fmtM(valMin)}</span>
                <span className="text-[20px] text-white/30 mx-3">—</span>
                <span className="text-[28px] sm:text-[36px]">{fmtM(valMax)}</span>
              </div>
              <div className="font-mono text-[9px] text-white/30 mt-3">Rango orientativo · No constituye oferta de compra</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
