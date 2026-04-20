import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticker } from '../components/Ticker';
import { ValuationCalculator } from '../components/ValuationCalculator';
import { useAppContext } from '../AppContext';
import { getPublishedDeals } from '../lib/firestore';
import { motion } from 'motion/react';
import type { Deal } from '../types';

const PLACEHOLDER_DEALS = [
  { id: 'EJEMPLO', industria: 'SaaS / Tech', region: 'CABA', descripcion: 'Plataforma B2B con ingresos recurrentes. MRR estable, churn inferior al 2%. Así se ve un deal real en Meridian.', revenue: 3200000, ebitda: 910000, askingPrice: 7100000, placeholder: true },
  { id: 'EJEMPLO', industria: 'Agro', region: 'Córdoba', descripcion: 'Empresa agroexportadora con contratos de largo plazo y certificación orgánica. Esta podría ser tu empresa.', revenue: 5100000, ebitda: 1400000, askingPrice: 6300000, placeholder: true },
  { id: 'EJEMPLO', industria: 'Salud', region: 'CABA', descripcion: 'Red de centros de diagnóstico con convenios vigentes con 15 obras sociales y prepagas.', revenue: 2800000, ebitda: 680000, askingPrice: 4200000, placeholder: true },
];

const HOW_IT_WORKS = [
  { n: '01', title: 'Listás tu empresa', desc: 'Completás el wizard en 10 minutos. Nuestra IA analiza tu documentación y genera el teaser.' },
  { n: '02', title: 'Compradores verificados la ven', desc: 'Solo compradores con capital real acceden al teaser. NDA obligatorio para ver datos confidenciales.' },
  { n: '03', title: 'Proceso estructurado al cierre', desc: 'Due diligence, data room, IOI. Nuestros analistas coordinan cada etapa.' },
  { n: '04', title: 'Cobramos solo al éxito', desc: '5% del precio de cierre. Si no vendés, no pagás nada. Alineamos incentivos.' },
];

export function Home() {
  const { setSellerWizardOpen, openNdaModal } = useAppContext();
  const [featured, setFeatured] = useState<any[]>([]);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  useEffect(() => {
    getPublishedDeals().then(deals => {
      if (deals.length > 0) { setFeatured(deals.slice(0, 3)); setIsPlaceholder(false); }
      else { setFeatured(PLACEHOLDER_DEALS); setIsPlaceholder(true); }
    }).catch(() => { setFeatured(PLACEHOLDER_DEALS); setIsPlaceholder(true); });
  }, []);

  const fmtUSD = (n: number) => `USD ${(n / 1_000_000).toFixed(1)}M`;

  return (
    <div className="animate-in fade-in duration-500 overflow-hidden">
      <Ticker />

      {/* HERO — outcome driven */}
      <section className="py-14 md:py-24 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="md:col-span-7">
              <div className="inline-flex items-center gap-2 border border-accent/30 bg-accent-light px-3 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent">Solo cobramos si vendés</span>
              </div>
              <h1 className="font-serif text-[42px] sm:text-[54px] md:text-[68px] font-bold leading-[0.95] tracking-[-0.025em] text-ink mb-6">
                Vendé tu empresa al precio justo. En 90 días.
              </h1>
              <p className="text-[17px] text-ink-soft leading-[1.65] max-w-[500px] font-light mb-8">
                Conectamos dueños de PyMEs rentables con compradores institucionales verificados. NDA digital, data room seguro, proceso estructurado. 5% al cierre — sin costos anticipados.
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSellerWizardOpen(true)}
                  className="btn-primary shadow-lg shadow-ink/10 !py-4 !px-7 !text-[13px]">
                  Quiero vender mi empresa →
                </motion.button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/mercado" className="btn-ghost !py-4 !px-7 !text-[13px]">Ver el mercado</Link>
                </motion.div>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border-subtle">
                {[['5%', 'Solo al cierre'], ['90 días', 'Tiempo promedio'], ['4.2×', 'EBITDA promedio']].map(([v, l]) => (
                  <div key={l}>
                    <div className="font-serif text-[22px] font-bold text-ink">{v}</div>
                    <div className="font-mono text-[9px] text-ink-mute tracking-wider">{l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="hidden md:flex flex-col md:col-span-5">
              <div className="border border-border-strong overflow-hidden shadow-2xl">
                <div className="w-full aspect-[4/3] bg-ink relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
                    alt="Corporate Buildings" className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="font-mono text-[9px] text-white/50 tracking-[0.12em] mb-2">DEAL ACTIVO · MRD-2501</div>
                    <div className="font-serif text-[18px] text-white font-bold mb-1">SaaS B2B · CABA</div>
                    <div className="flex items-center gap-4 text-[11px] font-mono text-white/70">
                      <span>Revenue <strong className="text-white">USD 3.2M</strong></span>
                      <span>EBITDA <strong className="text-white">28%</strong></span>
                      <span className="text-accent font-medium">Asking USD 7.1M</span>
                    </div>
                  </div>
                </div>
                <div className="bg-paper px-4 py-2.5 text-[11px] text-ink-mute flex justify-between items-center border-t border-border-subtle">
                  <span>Buenos Aires · Deal confidencial</span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>
              </div>
              <div className="mt-4 bg-ink/5 border border-border-strong p-4">
                <div className="font-mono text-[9px] text-ink-mute mb-2">¿POR QUÉ MERIDIAN?</div>
                {['Compradores verificados con capital real', 'NDA digital y data room seguro', '5% solo al cierre — sin adelantos'].map(t => (
                  <div key={t} className="flex items-center gap-2 text-[12px] text-ink-soft py-1">
                    <span className="text-accent">✓</span> {t}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-paper-deep border-t border-border-strong">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">Proceso</div>
            <h2 className="font-serif text-[28px] md:text-[38px] font-bold text-ink tracking-[-0.02em]">Así funciona Meridian</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border-strong border border-border-strong">
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
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

      {/* PRICING — transparent */}
      <section className="py-16 bg-ink text-white border-t border-white/10">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-3">Transparencia total</div>
            <h2 className="font-serif text-[28px] md:text-[40px] font-bold mb-6">¿Cuánto cobra Meridian?</h2>
            <div className="bg-white/5 border border-white/10 p-8 mb-6">
              <div className="font-serif text-[56px] font-bold text-accent mb-2">5%</div>
              <div className="font-mono text-[12px] text-white/60 mb-6">del precio de cierre · Solo si la operación se concreta</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Empresa de USD 2M', value: 'USD 100K' },
                  { label: 'Empresa de USD 5M', value: 'USD 250K' },
                  { label: 'Empresa de USD 10M', value: 'USD 500K' },
                ].map(ex => (
                  <div key={ex.label} className="bg-white/5 p-4">
                    <div className="font-mono text-[10px] text-white/40 mb-1">{ex.label}</div>
                    <div className="font-serif text-[20px] font-bold text-white">{ex.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[13px] text-white/50">
              Si no vendés, no pagás. Así alineamos intereses — ganamos cuando vos ganás.
            </p>
            <button onClick={() => setSellerWizardOpen(true)}
              className="mt-8 btn-primary !bg-white !text-ink hover:!bg-white/90 !py-4 !px-8">
              Quiero vender mi empresa →
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED DEALS */}
      <section className="py-16 bg-paper border-t border-border-strong">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">
                {isPlaceholder ? 'Así se verán tus deals' : 'Oportunidades activas'}
              </div>
              <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink tracking-[-0.02em]">
                {isPlaceholder ? 'El mercado te está esperando' : 'Deals Destacados'}
              </h2>
            </div>
            <Link to="/mercado" className="text-[11px] font-mono text-accent hover:underline hidden sm:block">
              Ver todo →
            </Link>
          </div>

          {isPlaceholder && (
            <div className="mb-6 bg-accent-light border border-accent/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="font-medium text-accent text-[14px] mb-1">El mercado está abierto</div>
                <div className="text-[13px] text-ink-soft">Sé el primero en listar tu empresa. Los compradores ya están registrados.</div>
              </div>
              <button onClick={() => setSellerWizardOpen(true)} className="btn-primary shrink-0">
                Listar mi empresa →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-strong border border-border-strong">
            {featured.map((deal, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className={`bg-paper p-7 flex flex-col gap-5 relative transition-colors ${deal.placeholder ? '' : 'hover:bg-paper-mid cursor-pointer group'}`}
                onClick={() => !deal.placeholder && openNdaModal(deal.id)}>
                {deal.placeholder && (
                  <div className="absolute top-4 right-4 font-mono text-[8px] uppercase tracking-widest border border-border-strong px-2 py-0.5 text-ink-mute">Ejemplo</div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-medium tracking-[0.1em] uppercase border border-border-strong px-2 py-0.5 text-ink-soft">{deal.industria}</span>
                  <span className="font-mono text-[10px] text-ink-mute">{deal.region}</span>
                </div>
                <div>
                  <div className="font-serif text-[22px] font-bold text-ink mb-2">
                    {((deal.ebitda / deal.revenue) * 100).toFixed(0)}% margen EBITDA
                  </div>
                  <p className="text-[13px] text-ink-soft leading-relaxed">{deal.descripcion}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                  <div>
                    <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">Revenue</div>
                    <div className={`font-mono text-[15px] font-bold text-ink ${deal.placeholder ? 'blur-sm' : ''}`}>{fmtUSD(deal.revenue)}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">Asking</div>
                    <div className={`font-mono text-[15px] font-bold text-accent ${deal.placeholder ? 'blur-sm' : ''}`}>{fmtUSD(deal.askingPrice)}</div>
                  </div>
                </div>
                {deal.placeholder ? (
                  <button onClick={() => setSellerWizardOpen(true)} className="text-[11px] font-mono text-accent hover:underline text-left">
                    ¿Tenés una empresa así? → Listala gratis
                  </button>
                ) : (
                  <div className="text-[11px] font-mono text-accent group-hover:underline">Ver teaser confidencial →</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="py-16 bg-paper-deep border-t border-border-strong">
        <div className="container-custom">
          <div className="text-center mb-10">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">Gratis · Sin registro</div>
            <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink tracking-[-0.02em]">
              Descubrí cuánto vale tu empresa hoy
            </h2>
            <p className="text-[14px] text-ink-mute mt-2 max-w-md mx-auto">Basado en múltiplos reales de transacciones de M&A en Argentina y Latam.</p>
          </div>
          <div className="max-w-xl mx-auto">
            <ValuationCalculator />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-ink text-white border-t border-white/10">
        <div className="container-custom text-center">
          <h2 className="font-serif text-[32px] md:text-[48px] font-bold leading-tight tracking-[-0.02em] mb-4">
            El momento de vender bien es ahora.
          </h2>
          <p className="text-white/50 text-[15px] mb-10 max-w-lg mx-auto">
            El mercado de PyMEs argentinas está en un momento de valuaciones históricamente altas. Sin costos anticipados. Sin compromisos.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => setSellerWizardOpen(true)}
              className="btn-primary !bg-white !text-ink hover:!bg-white/90 !py-4 !px-8 !text-[14px]">
              Quiero vender mi empresa →
            </button>
            <Link to="/mercado" className="btn-ghost !border-white/30 !text-white hover:!bg-white/10 !py-4 !px-8">
              Explorar el mercado
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
