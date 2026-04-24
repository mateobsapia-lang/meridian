import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';

const PHASES = [
  {
    phase: 'Fase 1', title: 'Listado y Preparación', duration: '2–4 semanas',
    seller: ['Completás el wizard de información', 'Subís estados contables y documentación', 'Nuestro equipo audita los datos'],
    buyer: ['Explorás el mercado con teasers ciegos', 'El match score prioriza tus oportunidades'],
    color: 'border-accent',
  },
  {
    phase: 'Fase 2', title: 'NDA y Acceso Confidencial', duration: '1–2 semanas',
    seller: ['Recibís solicitudes de NDA de compradores verificados', 'Aprobás o rechazás cada acceso', 'El data room se activa para compradores aprobados'],
    buyer: ['Firmás el NDA digital', 'Accedés a información completa: nombre, contactos, docs', 'Analizás el data room'],
    color: 'border-amber-400',
  },
  {
    phase: 'Fase 3', title: 'Due Diligence', duration: '4–8 semanas',
    seller: ['Te reunís con compradores serios', 'Respondés preguntas de management', 'Recibís Indicaciones de Interés (IOI)'],
    buyer: ['Realizás due diligence financiero, legal y operativo', 'Presentás una IOI con precio y estructura'],
    color: 'border-blue-400',
  },
  {
    phase: 'Fase 4', title: 'Negociación y Cierre', duration: '4–12 semanas',
    seller: ['Evaluás las ofertas con nuestros analistas', 'Negociás términos: precio, earnout, management'],
    buyer: ['Enviás Letter of Intent (LOI)', 'Coordinás el cierre con tus asesores legales'],
    color: 'border-purple-400',
  },
];

export function Proceso() {
  const { setSellerWizardOpen, setBuyerWizardOpen } = useAppContext();

  return (
    <div className="animate-in fade-in duration-500">
      <section className="bg-paper-deep pt-16 pb-20 border-b border-border-strong">
        <div className="container-custom max-w-3xl">
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-4">Metodología</div>
          <h1 className="font-serif text-[36px] sm:text-[48px] md:text-[60px] font-bold leading-[0.95] tracking-[-0.025em] text-ink mb-6">
            Un proceso riguroso de principio a fin
          </h1>
          <p className="text-[16px] text-ink-soft leading-[1.65] font-light">
            Meridian estructura cada transacción con las mismas fases que usan los bancos de inversión globales, adaptadas al mid-market argentino.
          </p>
        </div>
      </section>

      <section className="py-16 bg-paper">
        <div className="container-custom">
          <div className="flex flex-col gap-6">
            {PHASES.map((phase, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className={`border-l-4 ${phase.color} bg-paper border border-border-strong pl-6 pr-6 py-8`}>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-ink-mute">{phase.phase}</span>
                  <h3 className="font-serif text-[22px] md:text-[26px] font-bold text-ink">{phase.title}</h3>
                  <span className="ml-auto font-mono text-[10px] text-ink-mute border border-border-strong px-3 py-1">{phase.duration}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-3">🏢 Vendedor</div>
                    <ul className="flex flex-col gap-2">
                      {phase.seller.map((s, j) => (
                        <li key={j} className="flex items-start gap-2 text-[13px] text-ink-soft">
                          <span className="text-accent mt-0.5 shrink-0">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-3">🔍 Comprador</div>
                    <ul className="flex flex-col gap-2">
                      {phase.buyer.map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-[13px] text-ink-soft">
                          <span className="text-blue-400 mt-0.5 shrink-0">→</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <button onClick={() => setSellerWizardOpen(true)} className="btn-primary">Listar mi Empresa</button>
            <button onClick={() => setBuyerWizardOpen(true)} className="btn-ghost">Registrarme como Comprador</button>
          </div>
        </div>
      </section>
    </div>
  );
}
