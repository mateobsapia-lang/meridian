import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticker } from '../components/Ticker';
import { ValuationCalculator } from '../components/ValuationCalculator';
import { useAppContext } from '../AppContext';
import { getPublishedDeals } from '../lib/firestore';
import { motion } from 'motion/react';

const PLACEHOLDER_DEALS = [
  { id:'EJEMPLO', industria:'SaaS / Tech', region:'CABA', descripcion:'Plataforma B2B con ingresos recurrentes. MRR estable, churn inferior al 2%. Así se ve un deal real en Meridian.', revenue:3200000, ebitda:910000, askingPrice:7100000, placeholder:true },
  { id:'EJEMPLO', industria:'Agro', region:'Córdoba', descripcion:'Empresa agroexportadora con contratos de largo plazo y certificación orgánica. Esta podría ser tu empresa.', revenue:5100000, ebitda:1400000, askingPrice:6300000, placeholder:true },
  { id:'EJEMPLO', industria:'Salud', region:'CABA', descripcion:'Red de centros de diagnóstico con convenios vigentes con 15 obras sociales y prepagas.', revenue:2800000, ebitda:680000, askingPrice:4200000, placeholder:true },
];

const HOW_IT_WORKS = [
  { n:'01', title:'Listás tu empresa', desc:'10 minutos para listar. Nuestro equipo revisa cada empresa antes de publicarla — sin automatismos ciegos.' },
  { n:'02', title:'Compradores verificados la ven', desc:'Solo compradores con capital real acceden. NDA obligatorio para ver datos confidenciales.' },
  { n:'03', title:'Proceso estructurado', desc:'Due diligence, data room, IOI. Nuestros analistas coordinan cada etapa.' },
  { n:'04', title:'Solo cobramos al éxito', desc:'Sin éxito, sin cobro. Nuestros intereses van en la misma dirección que los tuyos.' },
];

export function Home() {
  const { setSellerWizardOpen, openNdaModal, setDiagnosticoOpen, setReporteOpen, setSimuladorOpen, setBuyerWizardOpen } = useAppContext();
  const [featured, setFeatured] = useState<any[]>([]);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  useEffect(() => {
    getPublishedDeals().then(deals => {
      if (deals.length > 0) { setFeatured(deals.slice(0,3)); setIsPlaceholder(false); }
      else { setFeatured(PLACEHOLDER_DEALS); setIsPlaceholder(true); }
    }).catch(() => { setFeatured(PLACEHOLDER_DEALS); setIsPlaceholder(true); });
  }, []);

  const fmtUSD = (n:number) => `USD ${(n/1_000_000).toFixed(1)}M`;

  return (
    <div className="animate-in fade-in duration-500 overflow-hidden">
      <Ticker />

      {/* HERO */}
      <section className="py-10 md:py-16 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
            <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.9, ease:[0.16,1,0.3,1] }} className="md:col-span-7">
              <div className="inline-flex items-center gap-2 border border-accent/30 bg-accent-light px-3 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent">Edición de portada · ARG · {new Date().getFullYear()}</span>
              </div>
              <h1 className="font-serif text-[44px] sm:text-[56px] md:text-[68px] font-bold leading-[0.95] tracking-[-0.025em] text-ink mb-7">
                El mercado discreto donde se <em className="italic text-accent">transmiten</em> las empresas.
              </h1>
              <p className="text-[17px] text-ink-soft leading-[1.65] max-w-[520px] font-light mb-9">
                El 80% de las PyMEs argentinas se venden por debajo de su valor real. No porque el mercado no pague — porque el dueño no supo cómo salir.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                  <button onClick={() => setSellerWizardOpen(true)} className="btn-primary shadow-lg shadow-ink/10 !py-4 !px-7">
                    Quiero vender mi empresa →
                  </button>
                </motion.div>
                <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                  <Link to="/mercado" className="btn-ghost !py-4 !px-7">Ver el mercado</Link>
                </motion.div>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border-subtle">
                {[['5%','Solo al cierre'],['90 días','Tiempo promedio'],['4.2×','EBITDA promedio']].map(([v,l]) => (
                  <div key={l}>
                    <div className="font-serif text-[22px] font-bold text-ink">{v}</div>
                    <div className="font-mono text-[9px] text-ink-mute tracking-wider">{l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
              transition={{ duration:1.1, ease:[0.16,1,0.3,1], delay:0.15 }}
              className="hidden md:flex flex-col md:col-span-5">
              <div className="border border-border-strong overflow-hidden shadow-2xl">
                <div className="w-full aspect-[4/3] bg-ink relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
                    alt="Mercado Meridian" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6 font-mono text-[10px] text-white/70 tracking-[0.12em]">MERIDIAN · MERCADO PRIVADO</div>
                </div>
                <div className="bg-paper p-2 pb-2.5 px-3 text-[11px] text-ink-mute italic border-t border-border-subtle flex justify-between items-center">
                  <span>Buenos Aires — Operaciones activas</span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>
              </div>
              <div className="mt-5 border-l-2 border-accent pl-[18px] pt-4">
                <div className="font-mono text-[9px] text-ink-mute tracking-[0.14em] uppercase mb-2">Análisis · {new Date().getFullYear()}</div>
                <div className="font-serif text-[15px] leading-[1.45] text-ink">
                  "Los múltiplos en PyMEs argentinas se estabilizan en <em className="italic text-accent">4.2× EBITDA</em> tras un trimestre de corrección en valuaciones."
                </div>
                <div className="mt-2 text-[10px] text-ink-mute">— Informe Trimestral Meridian</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-paper-deep border-t border-border-strong">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">Sin intermediarios innecesarios</div>
            <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink tracking-[-0.02em]">De la decisión al cierre, sin perder el control</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border-strong border border-border-strong">
            {HOW_IT_WORKS.map((s,i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay:i*0.1 }} viewport={{ once:true }}
                className="bg-paper p-7 flex flex-col gap-4">
                <div className="font-mono text-[32px] font-bold text-border-strong">{s.n}</div>
                <div>
                  <h3 className="font-serif text-[17px] font-bold text-ink mb-2">{s.title}</h3>
                  <p className="text-[13px] text-ink-soft leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEAD MAGNETS — HORMOZI FRAMEWORK ───────────────────── */}
      <section className="py-20 bg-paper border-t border-border-strong">
        <div className="container-custom">
          <div className="text-center mb-4">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">Herramientas gratuitas</div>
            <h2 className="font-serif text-[28px] md:text-[40px] font-bold text-ink tracking-[-0.02em]">
              Decidí con datos, no con suposiciones
            </h2>
            <p className="text-[14px] text-ink-mute mt-3 max-w-lg mx-auto">
              Tres herramientas que los asesores de M&A cobran. Acá son gratis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-strong border border-border-strong mt-12 shadow-xl">

            {/* 1 — DIAGNÓSTICO DE VENDIBILIDAD */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:0 }} viewport={{ once:true }}
              className="bg-paper p-8 flex flex-col gap-5 group">
              <div className="w-12 h-12 bg-ink flex items-center justify-center text-2xl shrink-0">🔬</div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Para vendedores · 5 min</div>
                <h3 className="font-serif text-[20px] font-bold text-ink mb-2">Diagnóstico de Vendibilidad</h3>
                <p className="text-[13px] text-ink-soft leading-relaxed">
                  8 preguntas. La IA analiza qué tan lista está tu empresa para el mercado y qué factores reducen tu precio de venta.
                </p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {['Score de vendibilidad 0-100','Factores que reducen tu valuación','Plan de acción priorizado'].map(b=>(
                  <li key={b} className="flex items-center gap-2 text-[12px] text-ink-soft">
                    <span className="text-accent font-bold">✓</span>{b}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-border-subtle">
                <button onClick={()=>setDiagnosticoOpen(true)}
                  className="w-full bg-ink text-white text-[10px] font-medium tracking-[0.15em] uppercase py-3 px-6 hover:bg-ink/90 transition-colors group-hover:bg-accent">
                  Hacer el diagnóstico →
                </button>
                <p className="text-[10px] text-ink-mute mt-2 text-center font-mono">Sin cargo · Confidencial</p>
              </div>
            </motion.div>

            {/* 2 — REPORTE DE VALUACIÓN */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:0.1 }} viewport={{ once:true }}
              className="bg-paper p-8 flex flex-col gap-5 group border-x border-border-strong relative">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent" />
              <div className="absolute -top-3 left-8">
                <span className="bg-accent text-white text-[8px] font-mono tracking-widest uppercase px-2 py-1">Más popular</span>
              </div>
              <div className="w-12 h-12 bg-accent flex items-center justify-center text-2xl shrink-0">📊</div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Para vendedores · 2 min</div>
                <h3 className="font-serif text-[20px] font-bold text-ink mb-2">Reporte de Valuación Privado</h3>
                <p className="text-[13px] text-ink-soft leading-relaxed">
                  Ingresás revenue y margen. La IA genera un reporte con múltiplos reales de transacciones argentinas y análisis de mercado.
                </p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {['Rango conservador / agresivo','Comparables de transacciones 2024','Análisis de timing de salida'].map(b=>(
                  <li key={b} className="flex items-center gap-2 text-[12px] text-ink-soft">
                    <span className="text-accent font-bold">✓</span>{b}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-border-subtle">
                <button onClick={()=>setReporteOpen(true)}
                  className="w-full bg-accent text-white text-[10px] font-medium tracking-[0.15em] uppercase py-3 px-6 hover:bg-accent/90 transition-colors">
                  Generar mi reporte →
                </button>
                <p className="text-[10px] text-ink-mute mt-2 text-center font-mono">Generado con IA · Gratis</p>
              </div>
            </motion.div>

            {/* 3 — SIMULADOR DE OFERTA */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:0.2 }} viewport={{ once:true }}
              className="bg-paper p-8 flex flex-col gap-5 group">
              <div className="w-12 h-12 bg-ink flex items-center justify-center text-2xl shrink-0">🎯</div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Para compradores · 3 min</div>
                <h3 className="font-serif text-[20px] font-bold text-ink mb-2">Simulador de Oportunidades</h3>
                <p className="text-[13px] text-ink-soft leading-relaxed">
                  Definís tu tesis: ticket, industria, región. Te mostramos cuántos deals activos matchean y te alertamos cuando entra uno nuevo.
                </p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {['Deals activos que matchean tu perfil','Alerta automática por email','Acceso prioritario al mercado'].map(b=>(
                  <li key={b} className="flex items-center gap-2 text-[12px] text-ink-soft">
                    <span className="text-accent font-bold">✓</span>{b}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-border-subtle">
                <button onClick={()=>setSimuladorOpen(true)}
                  className="w-full bg-ink text-white text-[10px] font-medium tracking-[0.15em] uppercase py-3 px-6 hover:bg-ink/90 transition-colors group-hover:bg-accent">
                  Simular mi búsqueda →
                </button>
                <p className="text-[10px] text-ink-mute mt-2 text-center font-mono">Sin cargo · Alertas incluidas</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* ── FIN LEAD MAGNETS ──────────────────────────────────── */}

      {/* FEATURED DEALS */}
      <section className="py-16 bg-paper-deep border-t border-border-strong">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">
                {isPlaceholder ? 'Así se ve el mercado' : 'Selección curada'}
              </div>
              <h2 className="font-serif text-[32px] md:text-[40px] font-bold text-ink tracking-[-0.02em]">
                {isPlaceholder ? 'Oportunidades que podrían estar acá' : 'Oportunidades Destacadas'}
              </h2>
            </div>
            <Link to="/mercado" className="text-[11px] font-mono tracking-wider text-accent hover:underline hidden sm:block">Ver mercado completo →</Link>
          </div>

          {isPlaceholder && (
            <div className="mb-6 bg-accent-light border border-accent/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="font-medium text-accent text-[14px] mb-1">Compradores con capital ya están registrados</div>
                <div className="text-[13px] text-ink-soft">Todavía no hay empresas disponibles. La tuya puede ser la primera en llegar.</div>
              </div>
              <button onClick={()=>setSellerWizardOpen(true)} className="btn-primary shrink-0">Listar mi empresa →</button>
            </div>
          )}

          <div className="-mx-5 sm:mx-0">
            <div className="flex overflow-x-auto scrollbar-hide md:grid md:grid-cols-3 gap-4 md:gap-px md:bg-border-strong border-y md:border border-border-strong md:shadow-xl snap-x snap-mandatory py-4 px-5 sm:px-0 md:py-0">
              {featured.map((deal,i) => (
                <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.1 }} viewport={{ once:true }}
                  className={`w-[280px] shrink-0 md:w-auto md:min-w-0 snap-center bg-paper p-6 flex flex-col gap-4 group transition-colors relative border md:border-0 border-border-strong shadow-sm md:shadow-none ${deal.placeholder?'cursor-default':'hover:bg-paper-mid cursor-pointer'}`}
                  onClick={()=>!deal.placeholder && openNdaModal(deal.id)}>
                  <div className="flex flex-wrap items-start justify-between gap-3 min-h-[48px]">
                    <span className="text-[9px] font-medium tracking-[0.1em] uppercase border border-border-strong px-2 py-[3px] text-ink-soft bg-paper">{deal.industria}</span>
                    <div className="flex flex-col items-end gap-2 ml-auto">
                      {deal.placeholder && <span className="font-mono text-[8px] uppercase tracking-widest bg-accent-light border border-accent/20 px-2 py-0.5 text-accent">EJEMPLO</span>}
                      <span className="font-mono text-[10px] text-ink-mute">{deal.region}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-[20px] font-bold text-ink mb-1">{((deal.ebitda/deal.revenue)*100).toFixed(0)}% EBITDA</div>
                    <p className={`text-[13px] text-ink-soft leading-relaxed line-clamp-2 ${deal.placeholder?'opacity-60':''}`}>{deal.descripcion}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
                    <div>
                      <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">Revenue</div>
                      <div className={`font-mono text-[14px] font-medium ${deal.placeholder?'blur-sm text-ink':'text-ink'}`}>{fmtUSD(deal.revenue)}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">Asking</div>
                      <div className={`font-mono text-[14px] font-medium ${deal.placeholder?'blur-sm text-accent':'text-accent'}`}>{fmtUSD(deal.askingPrice)}</div>
                    </div>
                  </div>
                  {deal.placeholder ? (
                    <button onClick={()=>setSellerWizardOpen(true)} className="text-[10px] font-mono text-accent hover:underline text-left">¿Tenés una empresa así? Listala →</button>
                  ) : (
                    <div className="text-[10px] font-mono text-accent group-hover:underline">Ver teaser →</div>
                  )}
                </motion.div>
              ))}
              <div className="w-1 shrink-0 md:hidden"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-16 bg-ink text-white border-t border-white/10">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-3">Transparencia total</div>
            <h2 className="font-serif text-[28px] md:text-[40px] font-bold mb-6">Sin venta, sin cobro. Así de simple.</h2>
            <div className="bg-white/5 border border-white/10 p-8 mb-6">
              <div className="font-serif text-[56px] font-bold text-accent mb-2">5%</div>
              <div className="font-mono text-[12px] text-white/60 mb-6">del precio de cierre · Solo si la operación se concreta</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[['Empresa de USD 2M','USD 100K'],['Empresa de USD 5M','USD 250K'],['Empresa de USD 10M','USD 500K']].map(([l,v])=>(
                  <div key={l} className="bg-white/5 p-4">
                    <div className="font-mono text-[10px] text-white/40 mb-1">{l}</div>
                    <div className="font-serif text-[20px] font-bold text-white">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[13px] text-white/50">Si no vendés, no pagás. Así alineamos intereses.</p>
            <button onClick={()=>setSellerWizardOpen(true)} className="mt-8 btn-primary !bg-white !text-ink hover:!bg-white/90 !py-4 !px-8">
              Quiero vender mi empresa →
            </button>
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section id="calculadora" className="py-16 bg-paper border-t border-border-strong">
        <div className="container-custom">
          <div className="text-center mb-10">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">Herramienta gratuita</div>
            <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink tracking-[-0.02em]">Descubrí cuánto vale tu empresa</h2>
            <p className="text-[14px] text-ink-mute mt-2 max-w-md mx-auto">Basado en múltiplos reales de transacciones M&A en Argentina y Latam.</p>
          </div>
          <div className="max-w-5xl mx-auto w-full">
            <ValuationCalculator />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / INFORME TRIMESTRAL */}
      <section className="py-16 bg-paper-deep border-t border-border-strong">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-strong border border-border-strong">
            {/* Informe trimestral CTA */}
            <div className="bg-paper p-10 flex flex-col gap-5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-1">Informe trimestral</div>
              <h3 className="font-serif text-[24px] font-bold text-ink leading-tight">
                Múltiplos reales del mercado argentino
              </h3>
              <p className="text-[13px] text-ink-soft leading-relaxed">
                Cada trimestre publicamos datos de transacciones M&A en PyMEs argentinas: múltiplos por industria, deals cerrados (anonimizados) y tendencias. Sin humo.
              </p>
              <ul className="flex flex-col gap-1.5">
                {['Múltiplos promedio por sector','Deals cerrados (anonimizados)','Tendencias de valuación regionales'].map(b=>(
                  <li key={b} className="flex items-center gap-2 text-[12px] text-ink-soft">
                    <span className="text-accent">✓</span>{b}
                  </li>
                ))}
              </ul>
              <button onClick={()=>setReporteOpen(true)}
                className="btn-primary w-full md:w-auto mt-2">
                Recibir próximo informe →
              </button>
            </div>

            {/* Para compradores */}
            <div className="bg-ink text-white p-10 flex flex-col gap-5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-1">Para compradores</div>
              <h3 className="font-serif text-[24px] font-bold leading-tight">
                El deal que buscás puede estar acá ahora
              </h3>
              <p className="text-[13px] text-white/60 leading-relaxed">
                Family offices, fondos de PE y adquirentes estratégicos con mandato regional tienen acceso al mercado privado. Registrate y accedé a dealflow verificado.
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
                {[['100%','Deals verificados'],['NDA','Obligatorio'],['48hs','Respuesta media']].map(([v,l])=>(
                  <div key={l}>
                    <div className="font-serif text-[20px] font-bold text-accent">{v}</div>
                    <div className="font-mono text-[9px] text-white/40 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setBuyerWizardOpen(true)}
                className="bg-accent text-white text-[10px] font-medium tracking-[0.15em] uppercase py-3 px-6 hover:bg-accent/90 transition-colors w-full md:w-auto mt-2">
                Registrarme como comprador →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-paper border-t border-border-strong">
        <div className="container-custom text-center">
          <h2 className="font-serif text-[32px] md:text-[48px] font-bold leading-tight tracking-[-0.02em] text-ink mb-4">
            Cada mes que esperás, tu empresa vale lo mismo. Tu ventana de salida, no.
          </h2>
          <p className="text-ink-mute text-[15px] mb-10 max-w-lg mx-auto">Sin costos anticipados. Sin compromisos. Solo resultados.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={()=>setSellerWizardOpen(true)} className="btn-primary !py-4 !px-8 !text-[14px]">
              Quiero vender mi empresa →
            </button>
            <Link to="/mercado" className="btn-ghost !py-4 !px-8">Explorar el Mercado</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
