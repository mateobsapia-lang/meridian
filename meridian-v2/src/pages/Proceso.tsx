import { useAppContext } from '../AppContext';

export function Proceso() {
  const { setSellerWizardOpen, setBuyerWizardOpen } = useAppContext();

  return (
    <div className="animate-in fade-in duration-500 py-16 md:py-24 border-t border-border-strong">
      <div className="container-custom">
        <div className="max-w-[560px]">
          <p className="eyebrow eyebrow-accent mb-3">Cómo funciona</p>
          <h2 className="font-serif text-[32px] md:text-[48px] font-bold text-ink tracking-[-0.02em] leading-[1.05]">
            Un proceso institucional, de principio a cierre.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start mt-14">
          {/* Vendedor */}
          <div>
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase px-3 py-1.5 border border-border-strong inline-block mb-6 text-ink-soft">
              Para vendedores
            </div>
            <div className="flex flex-col">
              <Step num="01" title="Registro y verificación legal" desc="Verificamos situación societaria (IGJ), fiscal (AFIP) y concursal (Ley 24.522). Sin juicios ni deudas críticas, la empresa pasa al siguiente paso." badge="Legal check automático" />
              <Step num="02" title="Carga de métricas y documentación" desc="Revenue, EBITDA, crecimiento, deuda, working capital. Estados financieros de los últimos 3 años." />
              <Step num="03" title="Readiness Score y valuación" desc="La plataforma genera un score de preparación (0-100) y una valuación automática por múltiplos de industria y DCF simplificado." badge="Valuación USD X – Y" />
              <Step num="04" title="Publicación anónima en el mercado" desc="La empresa aparece sin nombre ni datos identificatorios. Solo métricas financieras y ubicación general." />
              <Step num="05" title="NDA y due diligence" desc="Los compradores firman NDA digital (Ley 25.506) antes de acceder al data room con documentación completa." />
              <Step num="06" title="LOI y cierre asistido" desc="El comprador envía una Letter of Intent. Nuestros analistas acompañan la negociación hasta el cierre." badge="Success fee al cierre" last />
            </div>
            <div className="mt-8">
              <button onClick={() => setSellerWizardOpen(true)} className="btn-primary w-full sm:w-auto">Listar mi empresa</button>
            </div>
          </div>
          
          {/* Comprador */}
          <div>
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase px-3 py-1.5 border border-border-strong inline-block mb-6 text-ink-soft">
              Para compradores
            </div>
            <div className="flex flex-col">
              <Step num="01" title="Registro y KYC institucional" desc="Verificación de identidad (Metamap), declaración de origen de fondos y perfil inversor. Cumplimiento UIF / Ley 25.246." badge="KYC · AML · PEP check" />
              <Step num="02" title="Configuración de tesis inversora" desc="Industrias de interés, ticket mínimo y máximo, criterios de EBITDA y crecimiento. El sistema usa esto para calcular compatibilidad." />
              <Step num="03" title="Deal flow personalizado" desc="Acceso al marketplace con matching score por deal. Los deals de alta compatibilidad llegan por alerta en tiempo real." badge="Matching 92% compatible" />
              <Step num="04" title="Firma de NDA y acceso al data room" desc="NDA digital firmado en la plataforma. Acceso a estados financieros, contratos y Q&A con el seller (mediado por analistas)." />
              <Step num="05" title="Due diligence estructurado" desc="Data room con documentos organizados, watermark por comprador, audit trail completo de cada acceso." />
              <Step num="06" title="LOI y negociación" desc="Presentación de oferta formal (LOI), seguimiento del proceso por un analista dedicado hasta el cierre." last />
            </div>
            <div className="mt-8">
              <button onClick={() => setBuyerWizardOpen(true)} className="btn-primary w-full sm:w-auto">Registro comprador</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, desc, badge, last }: { num: string, title: string, desc: string, badge?: string, last?: boolean }) {
  return (
    <div className={`flex gap-4 py-4 ${last ? '' : 'border-b border-border-subtle'}`}>
      <span className="font-mono text-[11px] text-ink-mute min-w-6 pt-0.5">{num}</span>
      <div>
        <div className="text-[13px] font-medium text-ink mb-1">{title}</div>
        <div className="text-[11px] text-ink-mute leading-[1.5]">{desc}</div>
        {badge && (
          <span className="inline-block mt-2 text-[9px] font-medium tracking-[0.1em] uppercase py-0.5 px-2 bg-accent-light text-accent rounded-sm">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
