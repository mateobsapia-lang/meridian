import { useAppContext } from '../AppContext';
import { motion } from 'motion/react';

const PROFILES = [
  { icon: '🏢', title: 'Family Offices', desc: 'Patrimonios familiares que buscan diversificar con activos reales en el mercado local.' },
  { icon: '📈', title: 'Fondos de PE', desc: 'Fondos de private equity y venture capital con mandato en mid-market latinoamericano.' },
  { icon: '🤝', title: 'Compradores Estratégicos', desc: 'Empresas que buscan crecimiento inorgánico, integración vertical u horizontal.' },
  { icon: '👤', title: 'Inversores Individuales', desc: 'HNWIs y empresarios con capital disponible para adquirir operaciones rentables.' },
];

const STEPS = [
  { n: '01', title: 'Registrarse como Comprador', desc: 'Completás tu perfil de inversor con criterios de búsqueda, ticket objetivo y sectores de interés.' },
  { n: '02', title: 'Explorar el Mercado', desc: 'Accedés a teasers ciegos con métricas auditadas. El match score te ayuda a priorizar.' },
  { n: '03', title: 'Firmar NDA', desc: 'Para ver información confidencial firmás un NDA digital. Verificamos tu identidad.' },
  { n: '04', title: 'Due Diligence', desc: 'Accedés al data room, te reunís con el management y presentás una IOI.' },
  { n: '05', title: 'Cierre', desc: 'Nuestros analistas coordinan la negociación, documentación y cierre de la transacción.' },
];

export function Compradores() {
  const { setBuyerWizardOpen } = useAppContext();

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <section className="bg-paper-deep pt-16 pb-20 border-b border-border-strong">
        <div className="container-custom">
          <div className="max-w-2xl">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-4">Para Compradores</div>
            <h1 className="font-serif text-[36px] sm:text-[48px] md:text-[60px] font-bold leading-[0.95] tracking-[-0.025em] text-ink mb-6">
              Acceso institucional al mercado privado
            </h1>
            <p className="text-[16px] text-ink-soft leading-[1.65] mb-8 font-light">
              Meridian te conecta con oportunidades de adquisición verificadas, con métricas auditadas y procesos de confidencialidad de nivel institucional.
            </p>
            <button onClick={() => setBuyerWizardOpen(true)} className="btn-primary">
              Registrarme como Comprador
            </button>
          </div>
        </div>
      </section>

      {/* Perfiles */}
      <section className="py-16 bg-paper border-b border-border-strong">
        <div className="container-custom">
          <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink tracking-[-0.02em] mb-10">¿Para quién es Meridian?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border-strong border border-border-strong">
            {PROFILES.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-paper p-8 flex flex-col gap-4">
                <span className="text-3xl">{p.icon}</span>
                <h3 className="font-serif text-[18px] font-bold text-ink">{p.title}</h3>
                <p className="text-[13px] text-ink-soft leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section className="py-16 bg-paper-deep">
        <div className="container-custom">
          <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink tracking-[-0.02em] mb-10">Proceso de adquisición</h2>
          <div className="flex flex-col gap-0">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-6 md:gap-10 items-start py-7 border-b border-border-subtle last:border-none">
                <div className="font-mono text-[28px] md:text-[36px] font-bold text-border-strong shrink-0 w-12 md:w-16">{s.n}</div>
                <div>
                  <h3 className="font-serif text-[18px] md:text-[20px] font-bold text-ink mb-2">{s.title}</h3>
                  <p className="text-[13px] text-ink-soft leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <button onClick={() => setBuyerWizardOpen(true)} className="btn-primary">
              Comenzar como Comprador →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
