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
  { name: 'Construcción e Ingeniería', multiplier: 3.5 }
];

export function ValuationCalculator() {
  const { setLeadModalOpen } = useAppContext();
  const [revenue, setRevenue] = useState(2500000);
  const [margin, setMargin] = useState(20);
  const [industryMult, setIndustryMult] = useState(4.2);
  const [isRecurring, setIsRecurring] = useState(false);

  const ebitda = revenue * (margin / 100);
  // Recurring revenue commands a 20% premium on multiples
  const effectiveMultiple = isRecurring ? industryMult * 1.2 : industryMult;
  
  const valMin = ebitda * effectiveMultiple * 0.85;
  const valMax = ebitda * effectiveMultiple * 1.15;

  const fmtCurrency = (v: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  };
  
  const fmtM = (v: number) => `$${(v / 1000000).toFixed(2)}M`;

  return (
    <div className="bg-ink p-5 sm:p-8 md:p-12 text-white relative overflow-hidden border border-border-strong shadow-2xl">
      {/* Background Atmosphere */}
      <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[150%] bg-accent/20 blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start relative z-10">
        {/* LEFT COL: Context & Copy */}
        <div className="flex-1 pt-2 md:pt-4">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-accent mb-3 md:mb-4">Motor de Precisión</div>
          <h2 className="font-serif text-[28px] sm:text-[32px] md:text-[44px] font-bold leading-[1.05] tracking-[-0.02em] mb-4 md:mb-5">
            ¿Cuál es el valor real de su empresa hoy?
          </h2>
          <p className="text-[13px] md:text-[14px] text-white/60 leading-[1.6] mb-6 md:mb-8 font-light max-w-[420px]">
            Explore la valuación teórica de su compañía combinando sus métricas financieras con los múltiplos de transacción promediados este trimestre en el mercado de capitales privado.
          </p>
        </div>

        {/* RIGHT COL: Terminal / Specialist Tool */}
        <div className="flex-[1.2] w-full bg-[#151619] p-5 sm:p-8 md:p-10 rounded-sm border border-[#2a2b2f] shadow-2xl flex flex-col gap-6 md:gap-8">
          
          {/* Controls */}
          <div className="flex flex-col gap-6 md:gap-7">
            {/* Sector Selector */}
            <div>
              <div className="flex flex-wrap items-end justify-between font-mono mb-2 md:mb-3 gap-2">
                <span className="text-white/40 uppercase tracking-widest text-[9px]">Sector Industrial</span>
                <span className="text-accent text-[9px] tracking-widest uppercase">Múltiplo Base: {industryMult.toFixed(1)}x</span>
              </div>
              <div className="relative">
                <select 
                  value={industryMult}
                  onChange={e => setIndustryMult(Number(e.target.value))}
                  className="w-full bg-[#0D0D0B] border border-white/10 text-white/90 text-[13px] py-3 px-3 md:px-4 outline-none focus:border-accent appearance-none cursor-pointer"
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind.name} value={ind.multiplier}>{ind.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-[10px]">▼</div>
              </div>
            </div>

            {/* ARR Toggle */}
            <div className="flex items-center justify-between p-3 md:p-4 border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors gap-3" onClick={() => setIsRecurring(!isRecurring)}>
              <div className="flex-1">
                <div className="text-[11px] md:text-[12px] font-medium text-white mb-1">¿Más del 60% Ingresos Recurrentes?</div>
                <div className="text-[9px] md:text-[10px] text-white/40 font-mono tracking-wide leading-tight">Cobra un premium de liquidez</div>
              </div>
              <div className={`w-9 h-5 md:w-10 rounded-full relative transition-colors shrink-0 ${isRecurring ? 'bg-accent' : 'bg-white/20'}`}>
                <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-all ${isRecurring ? 'left-5 md:left-6' : 'left-1'}`}></div>
              </div>
            </div>

            {/* Revenue Slider */}
            <div>
              <div className="flex justify-between font-mono mb-3">
                <span className="text-white/40 uppercase tracking-widest text-[9px]">Ventas (LTM)</span>
                <span className="text-white font-medium text-[11px] md:text-[12px]">{fmtCurrency(revenue)}</span>
              </div>
              <input 
                type="range" min="500000" max="20000000" step="100000" 
                value={revenue} onChange={e => setRevenue(Number(e.target.value))} 
                className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none accent-accent cursor-pointer" 
              />
            </div>
            
            {/* Margin Slider */}
            <div>
              <div className="flex justify-between font-mono mb-3">
                <span className="text-white/40 uppercase tracking-widest text-[9px]">Margen EBITDA</span>
                <span className="text-white font-medium text-[11px] md:text-[12px]">{margin}%</span>
              </div>
              <input 
                type="range" min="5" max="50" step="1" 
                value={margin} onChange={e => setMargin(Number(e.target.value))} 
                className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none accent-accent cursor-pointer" 
              />
            </div>
          </div>

          {/* Output Display */}
          <div className="pt-6 md:pt-8 border-t border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.1em] text-white/40">EBITDA Generado</span>
              <span className="font-mono text-[11px] md:text-[12px] text-white/60">{fmtCurrency(ebitda)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.1em] text-white/40">Múltiplo Efectivo</span>
              <span className="font-mono text-[11px] md:text-[12px] text-white/60">{(effectiveMultiple).toFixed(2)}x</span>
            </div>
            
            <div className="bg-[#0b0c0e] border border-accent/20 p-4 md:p-5 mt-2 flex flex-col items-center justify-center relative overflow-hidden w-full text-center">
              <div className="absolute inset-0 bg-accent/5"></div>
              <div className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.1em] sm:tracking-[0.15em] text-accent mb-2 relative z-10 w-full">Valuación de Mercado</div>
              <div className="font-serif text-[24px] sm:text-[32px] md:text-[38px] font-bold text-white relative z-10 flex flex-wrap justify-center items-center gap-x-2 gap-y-0 w-full">
                <span>{fmtM(valMin)}</span>
                <span className="text-[18px] md:text-[20px] text-white/20 font-light">—</span>
                <span>{fmtM(valMax)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
