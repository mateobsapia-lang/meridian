import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticker } from '../components/Ticker';
import { ValuationCalculator } from '../components/ValuationCalculator';
import { useAppContext } from '../AppContext';
import { getPublishedDeals } from '../lib/firestore';
import { motion } from 'motion/react';
import type { Deal } from '../types';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 30 } }
};

export function Home() {
  const { setSellerWizardOpen, openNdaModal } = useAppContext();
  const [featured, setFeatured] = useState<Deal[]>([]);

  useEffect(() => {
    getPublishedDeals().then(deals => setFeatured(deals.slice(0, 3))).catch(() => {});
  }, []);

  const fmtUSD = (n: number) => `USD ${(n / 1_000_000).toFixed(1)}M`;

  return (
    <div className="animate-in fade-in duration-500 overflow-hidden">
      <Ticker />

      {/* HERO */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7">
              <div className="flex items-center gap-3 mb-7">
                <span className="eyebrow eyebrow-accent">Edición de portada</span>
                <div className="flex-1 h-px bg-border-strong"></div>
                <span className="font-mono text-[10px] text-ink-mute tracking-[0.12em]">ARG · {new Date().getFullYear()}</span>
              </div>
              <h1 className="font-serif text-[44px] sm:text-[56px] md:text-[72px] font-bold leading-[0.95] tracking-[-0.025em] text-ink mb-7">
                El mercado discreto donde se <em className="italic text-accent">transmiten</em> las empresas.
              </h1>
              <p className="text-[17px] text-ink-soft leading-[1.65] max-w-[520px] font-light mb-9">
                Una plataforma rigurosa que conecta empresarios que desean vender su empresa con compradores institucionales y family offices. Métricas auditadas, confidencialidad absoluta, procesos asistidos por analistas certificados.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <Link to="/mercado" className="btn-primary shadow-lg shadow-ink/10">Explorar el mercado</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <button onClick={() => setSellerWizardOpen(true)} className="btn-ghost">Listar mi empresa</button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="hidden md:flex flex-col md:col-span-5">
              <div className="border border-border-strong overflow-hidden shadow-2xl backdrop-blur-sm bg-white/40">
                <div className="w-full aspect-[4/3] bg-ink relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
                    alt="Corporate Buildings" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-6 font-mono text-[10px] text-white/70 tracking-[0.12em] mix-blend-overlay">MERIDIAN · MERCADO PRIVADO</div>
                </div>
                <div className="bg-paper p-2 pb-2.5 px-3 text-[11px] text-ink-mute italic border-t border-border-subtle flex justify-between items-center">
                  <span>Buenos Aires — Operaciones activas</span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(15,110,86,0.6)]"></span>
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
      {featured.length > 0 && (
        <section className="py-16 bg-paper-deep border-t border-border-strong">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">Selección curada</div>
                <h2 className="font-serif text-[32px] md:text-[40px] font-bold text-ink tracking-[-0.02em]">Oportunidades Destacadas</h2>
              </div>
              <Link to="/mercado" className="text-[11px] font-mono tracking-wider text-accent hover:underline hidden sm:block">
                Ver mercado completo →
              </Link>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-strong border border-border-strong shadow-xl">
              {featured.map(deal => (
                <motion.div key={deal.id} variants={fadeUpVariant}
                  className="bg-paper p-6 flex flex-col gap-4 group hover:bg-paper-mid transition-colors cursor-pointer"
                  onClick={() => openNdaModal(deal.id)}>
                  <div className="flex items-start justify-between">
                    <span className="text-[9px] font-medium tracking-[0.1em] uppercase border border-border-strong px-2 py-0.5 text-ink-soft">{deal.industria}</span>
                    <span className="font-mono text-[10px] text-ink-mute">{deal.id}</span>
                  </div>
                  <div>
                    <div className="font-serif text-[20px] font-bold text-ink mb-1">
                      {deal.region} · {((deal.ebitda / deal.revenue) * 100).toFixed(0)}% EBITDA
                    </div>
                    <p className="text-[13px] text-ink-soft leading-relaxed line-clamp-2">{deal.descripcion}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
                    <div>
                      <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">Revenue</div>
                      <div className="font-mono text-[14px] font-medium text-ink">{fmtUSD(deal.revenue)}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1">Asking</div>
                      <div className="font-mono text-[14px] font-medium text-accent">{fmtUSD(deal.askingPrice)}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-accent group-hover:underline">Ver teaser →</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* VALUATION CALCULATOR */}
      <section className="py-16 bg-paper border-t border-border-strong">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2 text-center">Herramienta gratuita</div>
            <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink text-center tracking-[-0.02em] mb-10">
              Estimá el valor de tu empresa
            </h2>
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
            Ya sea que quieras vender tu empresa o encontrar la inversión correcta, Meridian te acompaña en cada etapa del proceso.
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
