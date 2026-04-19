import { useAppContext } from '../AppContext';

export function Compradores() {
  const { setBuyerWizardOpen } = useAppContext();

  const benefits = [
    { title: 'Deal Flow Filtrado', desc: 'Reciba sólo oportunidades que hagan match con su tesis de inversión. Filtramos el ruido.' },
    { title: 'Data Room Estructurado', desc: 'Información financiera estandarizada y normalizada lista para análisis.' },
    { title: 'KYC / AML Integrado', desc: 'Cumplimiento normativo automático (UIF, Ley 25.246) en un solo onboarding.' },
    { title: 'Contacto Asistido', desc: 'Negociaciones facilitadas por analistas M&A senior para mayor tasa de éxito.' }
  ];

  return (
    <div className="animate-in fade-in duration-500 py-16 md:py-24">
      <div className="container-custom max-w-[800px] mx-auto text-center mb-16">
        <h1 className="font-serif text-[40px] md:text-[56px] font-bold text-ink leading-[1.05] tracking-[-0.02em] mb-6">
          El pipeline más <em className="italic text-accent">calificado</em> del mercado privado.
        </h1>
        <p className="text-[16px] text-ink-soft leading-[1.65] font-light mb-8 max-w-[600px] mx-auto">
          Acceda a operaciones pre-filtradas con EBITDA superior a USD 150.000. Diseñado para fondos de capital privado, family offices y adquirentes estratégicos.
        </p>
        <button onClick={() => setBuyerWizardOpen(true)} className="btn-primary">Registrarse como comprador</button>
      </div>

      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border-strong border border-border-strong">
          {benefits.map((b, i) => (
            <div key={i} className="bg-paper p-8">
              <div className="font-mono text-[24px] text-accent mb-4">0{i + 1}</div>
              <h3 className="text-[14px] font-medium text-ink mb-2">{b.title}</h3>
              <p className="text-[12px] text-ink-mute leading-[1.6]">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
