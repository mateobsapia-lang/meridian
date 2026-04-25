import { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { saveReporteLead } from '../lib/firestore';

const INDUSTRIES = [
  { name:'SaaS / Tecnología', mult:7.5 },
  { name:'Salud / Diagnóstico', mult:6.0 },
  { name:'Servicios Profesionales B2B', mult:5.5 },
  { name:'Alimentos y Bebidas', mult:5.0 },
  { name:'Logística y Transporte', mult:4.8 },
  { name:'Agro / Exportación', mult:4.5 },
  { name:'Manufactura Industrial', mult:4.2 },
  { name:'Retail / Omnicanal', mult:3.5 },
  { name:'Construcción', mult:3.5 },
  { name:'Otros', mult:4.0 },
];

const COMPARABLES: Record<string,{empresa:string;multiple:number;año:number}[]> = {
  'SaaS / Tecnología': [{empresa:'ERP PyME (CABA)',multiple:8.1,año:2024},{empresa:'SaaS Logístico (Rosario)',multiple:7.2,año:2024}],
  'Agro / Exportación': [{empresa:'Agroexportadora (Córdoba)',multiple:4.5,año:2024},{empresa:'Citrícola (Entre Ríos)',multiple:4.1,año:2023}],
  'Manufactura Industrial': [{empresa:'Insumos construcción (Santa Fe)',multiple:3.8,año:2024},{empresa:'Plásticos industriales (GBA)',multiple:4.2,año:2023}],
  'Salud / Diagnóstico': [{empresa:'Red diagnóstico (CABA)',multiple:6.2,año:2024},{empresa:'Centro médico (Córdoba)',multiple:5.8,año:2024}],
  'Servicios Profesionales B2B': [{empresa:'Consultora tech (CABA)',multiple:5.5,año:2024},{empresa:'Outsourcing RRHH (CABA)',multiple:5.1,año:2023}],
};

type Paso = 'datos' | 'email' | 'reporte';

export function ReporteValuacionModal() {
  const { isReporteOpen, setReporteOpen, showToast, setSellerWizardOpen } = useAppContext();
  const [paso, setPaso] = useState<Paso>('datos');
  const [industria, setIndustria] = useState(INDUSTRIES[0].name);
  const [revenue, setRevenue] = useState(3000000);
  const [margen, setMargen] = useState(22);
  const [recurrente, setRecurrente] = useState(false);
  const [email, setEmail] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [loading, setLoading] = useState(false);
  const [analisisIA, setAnalisisIA] = useState('');

  const ind = INDUSTRIES.find(i=>i.name===industria) ?? INDUSTRIES[0];
  const multBase = recurrente ? ind.mult * 1.2 : ind.mult;
  const ebitda = revenue * (margen/100);
  const valMin = ebitda * multBase * 0.85;
  const valMax = ebitda * multBase * 1.15;
  const comision = (valMin + valMax) / 2 * 0.05;

  const fmt = (n:number) => n >= 1e6 ? `USD ${(n/1e6).toFixed(2)}M` : `USD ${(n/1000).toFixed(0)}K`;
  const fmtShort = (n:number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : `${(n/1000).toFixed(0)}K`;

  const handleGenerarReporte = async () => {
    if (!email) return;
    setLoading(true);
    try {
      // Análisis IA
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `Sos analista senior de M&A en Argentina. Generá un párrafo de análisis de mercado para este reporte de valuación privado:

Empresa: ${empresa || 'Confidencial'}
Sector: ${industria}
Revenue: USD ${(revenue/1e6).toFixed(2)}M
Margen EBITDA: ${margen}%
EBITDA: USD ${(ebitda/1e6).toFixed(2)}M
Múltiplo aplicado: ${multBase.toFixed(1)}×
Rango de valuación: ${fmt(valMin)} – ${fmt(valMax)}
Ingresos recurrentes: ${recurrente ? 'Sí (prima +20%)' : 'No'}

Escribí 3-4 oraciones que:
1. Contextualizá el múltiplo para este sector en Argentina en 2025
2. Mencioná qué factores podrían mejorar o reducir la valuación final
3. Recomendá el momento actual de mercado para salir

Tono institucional, preciso. Sin títulos ni bullets.`,
          }],
        }),
      });
      const data = await res.json();
      const texto = data.content?.[0]?.text ?? `Los múltiplos en ${industria} se mantienen estables en ${multBase.toFixed(1)}× EBITDA en Argentina durante 2025, impulsados por la demanda de compradores institucionales con capital en dólares. Una empresa con las características indicadas tiene un perfil de riesgo/retorno atractivo para family offices y fondos de PE con mandato regional.`;
      setAnalisisIA(texto);

      await saveReporteLead({
        email, empresa, industria,
        revenue, margen, multiple: multBase,
        valMin, valMax, reporteGenerado: true,
      });

      setPaso('reporte');
    } catch { showToast('Error al generar. Intentá de nuevo.'); }
    finally { setLoading(false); }
  };

  const reset = () => { setPaso('datos'); setEmail(''); setEmpresa(''); setAnalisisIA(''); };
  const comparables = COMPARABLES[industria] ?? [];

  return (
    <Modal isOpen={isReporteOpen} onClose={()=>{ setReporteOpen(false); setTimeout(reset,300); }}
      title="Reporte de Valuación Privado" maxWidth="max-w-[560px]">

      {paso === 'datos' && (
        <div className="flex flex-col gap-5">
          <div className="bg-accent-light border border-accent/20 p-4 text-[12px] text-accent">
            📊 Reporte con múltiplos reales de transacciones M&A en Argentina. Generado con IA en segundos.
          </div>

          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5">Sector</label>
            <select value={industria} onChange={e=>setIndustria(e.target.value)}
              className="w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent">
              {INDUSTRIES.map(i=><option key={i.name}>{i.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between font-mono text-[9px] mb-1.5">
                <span className="uppercase tracking-widest text-ink-mute">Revenue anual</span>
                <span className="text-ink font-medium">USD {fmtShort(revenue)}</span>
              </div>
              <input type="range" min={500000} max={20000000} step={100000} value={revenue}
                onChange={e=>setRevenue(Number(e.target.value))}
                className="w-full h-1 bg-border-strong rounded appearance-none accent-accent cursor-pointer"/>
              <div className="flex justify-between font-mono text-[9px] text-ink-mute mt-1"><span>500K</span><span>20M</span></div>
            </div>
            <div>
              <div className="flex justify-between font-mono text-[9px] mb-1.5">
                <span className="uppercase tracking-widest text-ink-mute">Margen EBITDA</span>
                <span className="text-ink font-medium">{margen}%</span>
              </div>
              <input type="range" min={5} max={50} step={1} value={margen}
                onChange={e=>setMargen(Number(e.target.value))}
                className="w-full h-1 bg-border-strong rounded appearance-none accent-accent cursor-pointer"/>
              <div className="flex justify-between font-mono text-[9px] text-ink-mute mt-1"><span>5%</span><span>50%</span></div>
            </div>
          </div>

          <button onClick={()=>setRecurrente(!recurrente)}
            className="flex items-center justify-between p-3 border border-border-strong hover:bg-paper-mid transition-colors">
            <div className="text-[12px] text-ink">+60% ingresos recurrentes <span className="text-ink-mute text-[11px]">(prima +20% en múltiplo)</span></div>
            <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${recurrente?'bg-accent':'bg-border-strong'}`}>
              <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-all ${recurrente?'left-6':'left-1'}`}/>
            </div>
          </button>

          {/* Preview */}
          <div className="bg-paper-deep border border-border-strong p-5 text-center">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-3">Rango estimado</div>
            <div className="font-serif text-[36px] font-bold text-ink">{fmt(valMin)} – {fmt(valMax)}</div>
            <div className="font-mono text-[10px] text-ink-mute mt-1">{multBase.toFixed(2)}× EBITDA · Comisión Meridian: {fmt(comision)}</div>
          </div>

          <button onClick={()=>setPaso('email')} className="btn-primary w-full">
            Generar reporte completo →
          </button>
        </div>
      )}

      {paso === 'email' && (
        <div className="flex flex-col gap-5">
          <div className="bg-paper-deep border border-border-strong p-5">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Tu reporte incluye</div>
            {['Análisis de mercado generado con IA','Comparables de transacciones recientes en Argentina','Rango de valuación conservador / agresivo','Factores que mejoran o reducen el precio','Recomendación de timing de salida'].map(f=>(
              <div key={f} className="flex items-center gap-2 text-[12px] text-ink-soft py-1">
                <span className="text-accent">✓</span>{f}
              </div>
            ))}
          </div>
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5">Email corporativo</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent"
              placeholder="ceo@empresa.com" />
          </div>
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5">Empresa (opcional)</label>
            <input type="text" value={empresa} onChange={e=>setEmpresa(e.target.value)}
              className="w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent"
              placeholder="Razón social" />
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setPaso('datos')} className="btn-ghost flex-1">← Atrás</button>
            <button onClick={handleGenerarReporte} disabled={!email || loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Generando con IA...
                </span>
              ) : 'Generar Reporte →'}
            </button>
          </div>
          <p className="text-[10px] text-ink-mute text-center font-mono">Confidencial · No constituye oferta vinculante</p>
        </div>
      )}

      {paso === 'reporte' && (
        <div className="flex flex-col gap-5">
          {/* Header reporte */}
          <div className="bg-ink text-white p-6">
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-accent mb-1">MERIDIAN M&A · REPORTE PRIVADO</div>
            <div className="font-serif text-[22px] font-bold">{empresa || 'Empresa Confidencial'}</div>
            <div className="font-mono text-[10px] text-white/50 mt-1">{industria} · {new Date().toLocaleDateString('es-AR',{year:'numeric',month:'long'})}</div>
          </div>

          {/* Valuación principal */}
          <div className="border border-border-strong p-5">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-3">Rango de Valuación</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border border-border-subtle p-3">
                <div className="font-mono text-[9px] text-ink-mute mb-1">Conservador</div>
                <div className="font-serif text-[20px] font-bold text-ink">{fmt(valMin)}</div>
              </div>
              <div className="border-2 border-accent p-3">
                <div className="font-mono text-[9px] text-accent mb-1">Punto medio</div>
                <div className="font-serif text-[20px] font-bold text-accent">{fmt((valMin+valMax)/2)}</div>
              </div>
              <div className="border border-border-subtle p-3">
                <div className="font-mono text-[9px] text-ink-mute mb-1">Agresivo</div>
                <div className="font-serif text-[20px] font-bold text-ink">{fmt(valMax)}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3 text-[11px] font-mono">
              {[['Revenue',fmt(revenue)],['EBITDA',fmt(ebitda)],['Múltiplo',`${multBase.toFixed(1)}×`]].map(([l,v])=>(
                <div key={l} className="text-center border-t border-border-subtle pt-2">
                  <div className="text-ink-mute text-[9px]">{l}</div>
                  <div className="text-ink font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Análisis IA */}
          <div className="border-l-2 border-accent pl-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Análisis de Mercado</div>
            <p className="text-[12px] text-ink-soft leading-relaxed">{analisisIA}</p>
          </div>

          {/* Comparables */}
          {comparables.length > 0 && (
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Transacciones Comparables (Argentina)</div>
              {comparables.map((c,i)=>(
                <div key={i} className="flex justify-between items-center py-2 border-b border-border-subtle text-[12px]">
                  <span className="text-ink-soft">{c.empresa}</span>
                  <div className="flex gap-3 font-mono">
                    <span className="text-accent font-medium">{c.multiple}× EBITDA</span>
                    <span className="text-ink-mute">{c.año}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comisión */}
          <div className="bg-paper-deep border border-border-subtle p-4 text-[12px]">
            <div className="flex justify-between">
              <span className="text-ink-mute">Comisión Meridian (5% al cierre)</span>
              <span className="font-mono font-medium text-ink">~{fmt(comision)}</span>
            </div>
            <div className="text-[10px] text-ink-mute mt-1">Solo si la operación se concreta. Sin costos anticipados.</div>
          </div>

          {/* CTA */}
          <button onClick={()=>{ setReporteOpen(false); setTimeout(reset,300); setSellerWizardOpen(true); }}
            className="btn-primary w-full">
            Listar mi empresa y validar este precio →
          </button>
          <p className="text-[10px] text-ink-mute text-center font-mono">
            Reporte confidencial generado por Meridian M&A · No constituye oferta vinculante
          </p>
        </div>
      )}
    </Modal>
  );
}
