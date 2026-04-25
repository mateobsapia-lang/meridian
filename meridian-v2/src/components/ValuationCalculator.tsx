import { useState } from 'react';
import { useAppContext } from '../AppContext';

const INDUSTRIES = [
  { name: 'SaaS / Tecnología',            ebitdaMult: 7.5,  revMult: 3.5,  wacc: 0.18 },
  { name: 'Salud / Clínicas',             ebitdaMult: 6.0,  revMult: 2.8,  wacc: 0.16 },
  { name: 'Servicios Profesionales B2B',  ebitdaMult: 5.5,  revMult: 2.2,  wacc: 0.17 },
  { name: 'Alimentos y Bebidas',          ebitdaMult: 5.0,  revMult: 1.8,  wacc: 0.15 },
  { name: 'Logística y Transporte',       ebitdaMult: 4.8,  revMult: 1.5,  wacc: 0.16 },
  { name: 'Agro / Exportación',           ebitdaMult: 4.5,  revMult: 1.4,  wacc: 0.15 },
  { name: 'Manufactura Industrial',       ebitdaMult: 4.2,  revMult: 1.2,  wacc: 0.15 },
  { name: 'Retail / Omnicanal',           ebitdaMult: 3.5,  revMult: 0.9,  wacc: 0.17 },
  { name: 'Construcción e Ingeniería',    ebitdaMult: 3.5,  revMult: 0.8,  wacc: 0.16 },
  { name: 'Otros Sectores',              ebitdaMult: 4.0,  revMult: 1.3,  wacc: 0.16 },
];

const fmt = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : `${(v / 1000).toFixed(0)}K`;

const fmtFull = (v: number) =>
  v >= 1_000_000 ? `USD ${(v / 1_000_000).toFixed(2)}M` : `USD ${(v / 1000).toFixed(0)}K`;

export function ValuationCalculator() {
  const { setSellerWizardOpen } = useAppContext();
  const [revenue, setRevenue] = useState(2500000);
  const [margin, setMargin] = useState(20);
  const [selectedIdx, setSelectedIdx] = useState(6); // Manufactura por defecto
  const [isRecurring, setIsRecurring] = useState(false);
  const [crecimiento, setCrecimiento] = useState(15); // % YoY
  const [activeMethod, setActiveMethod] = useState<'ebitda'|'revenue'|'dcf'>('ebitda');
  const [showDetail, setShowDetail] = useState(false);

  const ind = INDUSTRIES[selectedIdx];
  const ebitda = revenue * (margin / 100);
  const recurringBonus = isRecurring ? 1.2 : 1.0;
  const growthBonus = crecimiento > 20 ? 1.1 : crecimiento > 10 ? 1.05 : 1.0;

  // Método 1: Múltiplo EBITDA
  const ebitdaMultEfectivo = ind.ebitdaMult * recurringBonus * growthBonus;
  const valEbitdaMin = ebitda * ebitdaMultEfectivo * 0.85;
  const valEbitdaMax = ebitda * ebitdaMultEfectivo * 1.15;

  // Método 2: Múltiplo de Revenue
  const revMultEfectivo = ind.revMult * recurringBonus;
  const valRevMin = revenue * revMultEfectivo * 0.80;
  const valRevMax = revenue * revMultEfectivo * 1.20;

  // Método 3: DCF simplificado (5 años, valor terminal)
  const fcf = ebitda * 0.75; // FCF aprox como 75% del EBITDA
  const g = crecimiento / 100; // tasa de crecimiento
  const wacc = ind.wacc;
  const terminalValue = (fcf * (1 + g)) / (wacc - Math.min(g, 0.05));
  const pvFCF = fcf * (1 - Math.pow(1 + wacc, -5)) / wacc;
  const pvTerminal = terminalValue / Math.pow(1 + wacc, 5);
  const valDCF = pvFCF + pvTerminal;
  const valDCFMin = valDCF * 0.82;
  const valDCFMax = valDCF * 1.18;

  // Rango consenso: promedio ponderado de los 3 métodos
  const consensoMin = (valEbitdaMin * 0.5 + valRevMin * 0.25 + valDCFMin * 0.25);
  const consensoMax = (valEbitdaMax * 0.5 + valRevMax * 0.25 + valDCFMax * 0.25);

  const methods = {
    ebitda: { min: valEbitdaMin, max: valEbitdaMax, mult: `${ebitdaMultEfectivo.toFixed(1)}×`, label: 'Múltiplo EBITDA', desc: 'Método más usado en M&A de PyMEs. Normaliza la rentabilidad operativa.' },
    revenue: { min: valRevMin, max: valRevMax, mult: `${revMultEfectivo.toFixed(1)}×`, label: 'Múltiplo de Revenue', desc: 'Relevante en empresas de alto crecimiento con márgenes en expansión.' },
    dcf: { min: valDCFMin, max: valDCFMax, mult: `${wacc*100}% WACC`, label: 'DCF (5 años)', desc: 'Descuento de flujos futuros a valor presente. Mayor precisión, más supuestos.' },
  };

  const current = methods[activeMethod];

  return (
    <div className="w-full overflow-hidden bg-[#0d0e10] shadow-2xl">
      {/* Header */}
      <div className="px-6 md:px-10 py-6 border-b border-white/10">
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-accent mb-1">Motor de Precisión</div>
        <h2 className="font-serif font-bold text-white leading-tight" style={{ fontSize:'clamp(1.4rem, 2.5vw, 2rem)' }}>
          ¿Cuál es el valor real de tu empresa?
        </h2>
      </div>

      {/* Body */}
      <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

        {/* LEFT — Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Sector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Sector industrial</span>
              <span className="font-mono text-[11px] text-accent font-medium">{ind.ebitdaMult}× EBITDA base</span>
            </div>
            <div className="relative">
              <select value={selectedIdx} onChange={e => setSelectedIdx(Number(e.target.value))}
                className="w-full bg-transparent border border-white/10 text-white py-3 px-4 outline-none focus:border-accent appearance-none cursor-pointer"
                style={{ fontSize:'clamp(12px, 1.5vw, 14px)' }}>
                {INDUSTRIES.map((ind, i) => <option key={ind.name} value={i} className="bg-[#0d0e10] text-white">{ind.name}</option>)}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-[10px] pointer-events-none">▼</span>
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label:'Ventas anuales (LTM)', val:revenue, setVal:setRevenue, min:500000, max:20000000, step:100000,
                display: `USD ${fmt(revenue)}`, rangeL:'500K', rangeR:'20M' },
              { label:'Margen EBITDA', val:margin, setVal:setMargin, min:5, max:50, step:1,
                display:`${margin}%`, rangeL:'5%', rangeR:'50%' },
              { label:'Crecimiento YoY', val:crecimiento, setVal:setCrecimiento, min:0, max:60, step:1,
                display:`${crecimiento}%`, rangeL:'0%', rangeR:'60%' },
            ].map(s => (
              <div key={s.label} className={s.label === 'Ventas anuales (LTM)' ? 'sm:col-span-2' : ''}>
                <div className="flex justify-between font-mono mb-2">
                  <span className="text-white/40 uppercase tracking-widest text-[9px]">{s.label}</span>
                  <span className="text-white font-medium text-[12px]">{s.display}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step}
                  value={s.val} onChange={e => s.setVal(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none accent-accent cursor-pointer"/>
                <div className="flex justify-between font-mono text-[9px] text-white/20 mt-1">
                  <span>{s.rangeL}</span><span>{s.rangeR}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recurrente toggle */}
          <button onClick={() => setIsRecurring(!isRecurring)}
            className="flex items-center justify-between p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors w-full text-left">
            <div>
              <div className="text-white font-medium" style={{ fontSize:'clamp(12px,1.3vw,13px)' }}>+60% ingresos recurrentes</div>
              <div className="text-[10px] text-white/40 font-mono mt-0.5">Prima de liquidez +20% en múltiplo</div>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${isRecurring ? 'bg-accent' : 'bg-white/20'}`}>
              <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-all ${isRecurring ? 'left-6' : 'left-1'}`}/>
            </div>
          </button>

          {/* Desglose expandible — oculto por defecto */}
          <button onClick={() => setShowDetail(!showDetail)}
            className="flex items-center justify-between w-full text-left border border-white/10 px-4 py-2.5 hover:bg-white/5 transition-colors">
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
              {showDetail ? 'Ocultar desglose' : '¿Cómo se calculó este número? →'}
            </span>
            <span className="text-white/30 text-[10px]">{showDetail ? '▲' : '▼'}</span>
          </button>
          {showDetail && (
            <div className="border border-white/10 p-4 flex flex-col gap-3 bg-white/[0.02]">
              <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">3 metodologías · consenso ponderado</div>
              {(Object.keys(methods) as Array<'ebitda'|'revenue'|'dcf'>).map(m => (
                <div key={m} className="flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-mono text-white/50 uppercase text-[9px]">{methods[m].label}</span>
                    <span className="text-white/30 font-mono text-[9px] ml-2">{methods[m].mult}</span>
                  </div>
                  <span className="font-mono text-white/60">
                    {fmt(methods[m].min)}–{fmt(methods[m].max)}
                  </span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 text-[10px] text-white/30 font-mono">
                Ponderación: 50% EBITDA · 25% Revenue · 25% DCF
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Output */}
        <div className="lg:col-span-5 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-10">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">EBITDA estimado</div>
              <div className="font-mono font-medium text-white" style={{ fontSize:'clamp(15px,1.8vw,20px)' }}>USD {fmt(ebitda)}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Consenso 3 métodos</div>
              <div className="font-mono font-medium text-accent" style={{ fontSize:'clamp(15px,1.8vw,20px)' }}>{ebitdaMultEfectivo.toFixed(1)}× EBITDA</div>
            </div>
          </div>

          {/* Rango activo */}
          {/* Consenso como resultado principal */}
          <div className="border border-accent/20 bg-accent/5 p-6 text-center">
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-accent mb-4">
              Tu empresa vale aproximadamente
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="font-serif font-bold text-white tracking-tight" style={{ fontSize:'clamp(1.6rem,3.5vw,2.8rem)' }}>
                {fmt(consensoMin)}
              </span>
              <span className="w-6 h-px bg-white/20 shrink-0"/>
              <span className="font-serif font-bold text-white tracking-tight" style={{ fontSize:'clamp(1.6rem,3.5vw,2.8rem)' }}>
                {fmt(consensoMax)}
              </span>
            </div>
            <div className="font-mono text-[8px] text-white/30 mt-3 uppercase tracking-widest">Estimación · No constituye oferta vinculante</div>
          </div>

          <button onClick={() => setSellerWizardOpen(true)}
            className="w-full font-mono text-[10px] md:text-[11px] font-medium tracking-[0.15em] uppercase bg-white text-ink py-4 hover:bg-accent hover:text-white transition-colors duration-200">
            Listar mi empresa y auditar valor →
          </button>
        </div>
      </div>
    </div>
  );
}
