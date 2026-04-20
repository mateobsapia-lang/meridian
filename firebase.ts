import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';

const TEAM = [
  { initials: 'MS', name: 'Mateo Sapia', role: 'Fundador & CEO', bio: 'Empresario con trayectoria en M&A y mercados privados en Argentina y Latam.' },
  { initials: 'AN', name: 'Analista Senior', role: 'Due Diligence', bio: 'Especialista en valuación de PyMEs y estructuración de transacciones.' },
  { initials: 'LG', name: 'Legal', role: 'Compliance & NDA', bio: 'Abogada corporativa con foco en transacciones M&A y derecho societario.' },
];

const VALUES = [
  { title: 'Confidencialidad absoluta', desc: 'Cada deal está protegido por NDA institucional. La información nunca llega a quien no debe.' },
  { title: 'Métricas auditadas', desc: 'Verificamos cada número antes de publicar. Los compradores toman decisiones con datos reales.' },
  { title: 'Proceso estructurado', desc: 'Seguimos las mismas fases que los bancos de inversión globales, adaptadas al mercado local.' },
  { title: 'Alineación de intereses', desc: 'Solo cobramos al cierre. Nuestro éxito depende del tuyo.' },
];

export function Nosotros() {
  const { setContactModalOpen } = useAppContext();

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <section className="bg-paper-deep pt-16 pb-20 border-b border-border-strong">
        <div className="container-custom max-w-3xl">
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-4">Quiénes Somos</div>
          <h1 className="font-serif text-[36px] sm:text-[48px] md:text-[60px] font-bold leading-[0.95] tracking-[-0.025em] text-ink mb-6">
            Construimos el mercado privado que Argentina necesita
          </h1>
          <p className="text-[16px] text-ink-soft leading-[1.65] font-light max-w-2xl">
            Meridian nació de la observación de que miles de PyMEs argentinas rentables no tienen acceso a un proceso serio de venta. La informalidad, la falta de estructuración y la ausencia de confidencialidad destruyen valor en cada transacción.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-paper border-b border-border-strong">
        <div className="container-custom">
          <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink tracking-[-0.02em] mb-10">Nuestros principios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-strong border border-border-strong">
            {VALUES.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-paper p-8">
                <div className="w-8 h-0.5 bg-accent mb-6" />
                <h3 className="font-serif text-[18px] font-bold text-ink mb-3">{v.title}</h3>
                <p className="text-[13px] text-ink-soft leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 bg-paper-deep border-b border-border-strong">
        <div className="container-custom">
          <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-ink tracking-[-0.02em] mb-10">El equipo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map((m, i) => (
              <div key={i} className="border border-border-strong bg-paper p-6 flex flex-col gap-4">
                <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center font-serif text-[20px] font-bold">
                  {m.initials}
                </div>
                <div>
                  <div className="font-serif text-[17px] font-bold text-ink">{m.name}</div>
                  <div className="font-mono text-[10px] text-accent tracking-wider mt-0.5">{m.role}</div>
                </div>
                <p className="text-[13px] text-ink-soft leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-ink text-white text-center">
        <div className="container-custom">
          <h2 className="font-serif text-[28px] md:text-[40px] font-bold mb-4">¿Querés hablar con nosotros?</h2>
          <p className="text-white/60 mb-8 text-[15px]">Respondemos todas las consultas en menos de 24 horas hábiles.</p>
          <button onClick={() => setContactModalOpen(true)} className="btn-primary !bg-white !text-ink hover:!bg-white/90">
            Contactarnos
          </button>
        </div>
      </section>
    </div>
  );
}
