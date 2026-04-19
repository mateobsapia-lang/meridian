import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticker } from '../components/Ticker';
import { ValuationCalculator } from '../components/ValuationCalculator';
import { useAppContext } from '../AppContext';
import { getPublishedDeals } from '../lib/firestore';
import { motion } from 'motion/react';
import type { Deal } from '../types';

const PLACEHOLDER_DEALS = [
  { id: 'EJEMPLO', industria: 'SaaS / Tech', region: 'CABA', descripcion: 'Así se verá tu empresa en el mercado. Métricas auditadas, descripción confidencial, proceso estructurado.', revenue: 3200000, ebitda: 910000, askingPrice: 7100000, placeholder: true },
  { id: 'EJEMPLO', industria: 'Agro', region: 'Córdoba', descripcion: 'Empresa agroexportadora con contratos de largo plazo. Así se ve un deal real en Meridian.', revenue: 5100000, ebitda: 1400000, askingPrice: 6300000, placeholder: true },
  { id: 'EJEMPLO', industria: 'Salud', region: 'CABA', descripcion: 'Red de centros de diagnóstico. Convenios con prepagas. Esta podría ser tu empresa.', revenue: 2800000, ebitda: 680000, askingPrice: 4200000, placeholder: true },
];

export function Home() {
  const { setSellerWizardOpen, openNdaModal } = useAppContext();
  const [featured, setFeatured] = useState<any[]>([]);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  useEffect(() => {
    getPublishedDeals().then(deals => {
      if (deals.length > 0) {
        setFeatured(deals.slice(0, 3));
        setIsPlaceholder(false);
      } else {
        setFeatured(PLACEHOLDER_DEALS);
        setIsPlaceholder(true);
      }
    }).catch(() => {
      setFeatured(PLACEHOLDER_DEALS);
      setIsPlaceholder(true);
    });
  }, []);

  const fmtUSD = (n: number) => `USD ${(n / 1_000_000).toFixed(1)}M`;

  return (
    <div className="animate-in fade-in duration-500 overflow-hidden">
      <Ticker />

      {/* HERO */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="md:col-span-7">
              <div className="flex items-center gap-3 mb-7">
                <span className="eyebrow eyebrow-accent">Edición de portada</span>
                <div className="flex-1 h-px bg-border-strong" />
                <span className="font-mono text-[10px] text-ink-mute tracking-[0.12em]">ARG · {new Date().getFullYear()}</span>
              </div>
              <h1 className="font-serif text-[44px] sm:text-[56px] md:text-[72px] font-bold leading-[0.95] tracking-[-0.025em] text-ink mb-7">
                El mercado discreto donde se <em className="italic text-accent">transmiten</em> las empresas.
              </h1>
              <p className="text-[17px] text-ink-soft leading-[1.65] max-w-[520px] font-light mb-9">
                Una plataforma rigurosa que conecta empresarios que desean vender su empresa con compradores institucionales y family offices. Métricas auditadas, confidencialidad absoluta.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/mercado" className="btn-primary shadow-lg shadow-ink/10">Explorar el mercado</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <button onClick={() => setSellerWizardOpen(true)} className="btn-ghost">Listar mi empresa</button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="hidden md:flex flex-col md:col-span-5">
              <div className="border border-border-strong overflow-hidden shadow-2xl">
                <div className="w-full aspect-[4/3] bg-ink relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
                    alt="Corporate Buildings" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
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
            <Link to="/mercado" className="text-[11px] font-mono tracking-wider text-accent hover:underline hidden sm:block">
              Ver mercado completo →
            </Link>
          </div>

          {isPlaceholder && (
            <div className="mb-6 bg-accent-light border border-accent/20 p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="text-[13px] text-accent">
                <strong>El mercado está vacío.</strong> Sé el primero en listar tu empresa y llegar a compradores institucionales.
              </div>
              <button onClick={() => setSellerWizardOpen(true)} className="btn-primary shrink-0 !py-2">
                Listar mi empresa →
              </button>
            </div>
          )}

          <div className="-mx-5 sm:mx-0">
            <div className="flex overflow-x-auto scrollbar-hide md:grid md:grid-cols-3 gap-4 md:gap-px md:bg-border-strong border-y md:border border-border-strong md:shadow-xl snap-x snap-mandatory py-4 px-5 sm:px-0 md:py-0">
              {featured.map((deal, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className={`w-[280px] shrink-0 md:w-auto md:min-w-0 snap-center bg-paper p-6 flex flex-col gap-4 group transition-colors relative border md:border-0 border-border-strong shadow-sm md:shadow-none ${
                    deal.placeholder ? 'cursor-default' : 'hover:bg-paper-mid cursor-pointer'
                  }`}
                  onClick={() => !deal.placeholder && openNdaModal(deal.id)}
                >
                {deal.placeholder && (
                  <div className="absolute top-3 right-3 font-mono text-[8px] uppercase tracking-widest border border-border-strong px-2 py-0.5 text-ink-mute">
                    Ejemplo
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <span className="text-[9px] font-medium tracking-[0.1em] uppercase border border-border-strong px-2 py-0.5 text-ink-soft">{deal.industria}</span>
                  <span className="font-mono text-[10px] text-ink-mute">{deal.region}</span>
                </div>
                <div>
                  <div className="font-serif text-[20px] font-bold text-ink mb-1">
                    {((deal.ebitda / deal.revenue) * 100).toFixed(0)}% EBITDA
                  </div>
                  <p className={`text-[13px] text-ink-soft leading-relaxed line-clamp-2 ${deal.placeholder ? 'opacity-60' : ''}`}>
                    {deal.descripcion}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
                  <div>
                    <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">Revenue</div>
                    <div className={`font-mono text-[14px] font-medium ${deal.placeholder ? 'blur-sm text-ink' : 'text-ink'}`}>{fmtUSD(deal.revenue)}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">Asking</div>
                    <div className={`font-mono text-[14px] font-medium ${deal.placeholder ? 'blur-sm text-accent' : 'text-accent'}`}>{fmtUSD(deal.askingPrice)}</div>
                  </div>
                </div>
                {deal.placeholder ? (
                  <button onClick={() => setSellerWizardOpen(true)} className="text-[10px] font-mono text-accent hover:underline text-left">
                    ¿Tenés una empresa así? Listala →
                  </button>
                ) : (
                  <div className="text-[10px] font-mono text-accent group-hover:underline">Ver teaser →</div>
                )}
              </motion.div>
            ))}
              {/* Spacer on mobile to ensure last card doesn't stick to the screen edge */}
              <div className="w-1 shrink-0 md:hidden"></div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUATION CALCULATOR */}
      <section className="py-16 bg-paper border-t border-border-strong">
        <div className="container-custom">
          <div className="text-center mb-10">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">Herramienta gratuita</div>
            <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink tracking-[-0.02em]">Estimá el valor de tu empresa</h2>
          </div>
          <div className="max-w-5xl mx-auto w-full">
            <ValuationCalculator />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ink text-white">
        <div className="container-custom text-center">
          <h2 className="font-serif text-[36px] md:text-[52px] font-bold leading-tight tracking-[-0.02em] mb-6">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-white/60 text-[16px] mb-10 max-w-xl mx-auto">
            Ya sea que quieras vender tu empresa o encontrar la inversión correcta, Meridian te acompaña en cada etapa.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => setSellerWizardOpen(true)} className="btn-primary !bg-white !text-ink hover:!bg-white/90">
              Listar mi Empresa
            </button>
            <Link to="/mercado" className="btn-ghost !border-white/30 !text-white hover:!bg-white/10">
              Explorar el Mercado
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
