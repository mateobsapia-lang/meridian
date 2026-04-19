import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';

const TC_VERSION = 'v1.0-2025';

export function WelcomeModal() {
  const { user, setLoginModalOpen } = useAppContext();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<'welcome' | 'tc'>('welcome');
  const [role, setRole] = useState<'buyer' | 'seller' | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('meridian_tc_accepted');
    if (!accepted) {
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('meridian_tc_accepted', TC_VERSION);
    localStorage.setItem('meridian_tc_date', new Date().toISOString());
    if (role) localStorage.setItem('meridian_preferred_role', role);
    setShow(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) {
      setScrolledToBottom(true);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
      <div className="bg-paper border border-border-strong shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in duration-300">

        {step === 'welcome' && (
          <>
            <div className="p-8 border-b border-border-strong">
              <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-accent mb-3">Bienvenido a Meridian</div>
              <h2 className="font-serif text-[28px] font-bold text-ink leading-tight">El mercado privado donde se transmiten empresas.</h2>
            </div>
            <div className="p-8 flex flex-col gap-6 flex-1 overflow-y-auto">
              <p className="text-[13px] text-ink-soft leading-relaxed">
                Meridian es una plataforma institucional de M&A para PyMEs argentinas. Antes de continuar, necesitamos saber cómo vas a usar la plataforma.
              </p>
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-1">¿Cómo querés usar Meridian?</div>
                <button
                  onClick={() => setRole('seller')}
                  className={`flex items-start gap-4 p-4 border transition-all text-left ${role === 'seller' ? 'border-accent bg-accent-light' : 'border-border-strong hover:bg-paper-mid'}`}
                >
                  <span className="text-2xl mt-0.5">🏢</span>
                  <div>
                    <div className="font-medium text-ink text-[14px]">Quiero vender mi empresa</div>
                    <div className="text-[12px] text-ink-mute mt-0.5">Listá tu empresa y accedé a compradores institucionales verificados</div>
                  </div>
                  {role === 'seller' && <span className="ml-auto text-accent">✓</span>}
                </button>
                <button
                  onClick={() => setRole('buyer')}
                  className={`flex items-start gap-4 p-4 border transition-all text-left ${role === 'buyer' ? 'border-accent bg-accent-light' : 'border-border-strong hover:bg-paper-mid'}`}
                >
                  <span className="text-2xl mt-0.5">🔍</span>
                  <div>
                    <div className="font-medium text-ink text-[14px]">Busco empresas para adquirir</div>
                    <div className="text-[12px] text-ink-mute mt-0.5">Explorá oportunidades verificadas con métricas auditadas</div>
                  </div>
                  {role === 'buyer' && <span className="ml-auto text-accent">✓</span>}
                </button>
                <button
                  onClick={() => setRole('buyer')}
                  className={`flex items-start gap-4 p-4 border transition-all text-left ${role === 'buyer' && !role ? 'border-accent bg-accent-light' : 'border-border-strong hover:bg-paper-mid'}`}
                >
                  <span className="text-2xl mt-0.5">👀</span>
                  <div>
                    <div className="font-medium text-ink text-[14px]">Solo estoy explorando</div>
                    <div className="text-[12px] text-ink-mute mt-0.5">Conocé cómo funciona el mercado privado argentino</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-border-strong">
              <button
                onClick={() => setStep('tc')}
                disabled={!role}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar →
              </button>
            </div>
          </>
        )}

        {step === 'tc' && (
          <>
            <div className="p-6 border-b border-border-strong flex items-center gap-3">
              <button onClick={() => setStep('welcome')} className="text-ink-mute hover:text-ink text-[12px] font-mono">← Atrás</button>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">Términos y Condiciones</div>
            </div>
            <div onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 text-[12px] text-ink-soft leading-relaxed font-serif space-y-4 max-h-80">
              <p><strong className="font-sans text-ink">1. Objeto de la plataforma</strong><br />
              Meridian (en adelante "la Plataforma") opera como intermediario en procesos de compraventa de empresas ("M&A") en la República Argentina. La Plataforma no es parte de ninguna transacción y no garantiza la concreción de ninguna operación.</p>

              <p><strong className="font-sans text-ink">2. Confidencialidad</strong><br />
              Toda información publicada en la Plataforma está protegida por acuerdos de confidencialidad (NDA). El usuario se compromete a no divulgar, reproducir ni utilizar dicha información para fines distintos a la evaluación de una potencial transacción.</p>

              <p><strong className="font-sans text-ink">3. Veracidad de la información</strong><br />
              El vendedor declara bajo juramento que la información proporcionada es verídica y completa. La Plataforma no se responsabiliza por la inexactitud de los datos proporcionados por los usuarios.</p>

              <p><strong className="font-sans text-ink">4. Comisión al éxito</strong><br />
              Meridian percibe una comisión sobre el precio de cierre de la transacción, conforme al acuerdo firmado con el vendedor. No se cobran honorarios anticipados por la publicación.</p>

              <p><strong className="font-sans text-ink">5. Cumplimiento UIF</strong><br />
              Meridian opera como Sujeto Obligado ante la Unidad de Información Financiera (UIF) conforme a la Resolución 30/2017. Los usuarios aceptan someterse a los procedimientos de identificación (KYC/AML) requeridos.</p>

              <p><strong className="font-sans text-ink">6. Privacidad de datos</strong><br />
              Los datos personales son tratados conforme a la Ley 25.326 de Protección de Datos Personales. El usuario presta consentimiento expreso para el tratamiento de sus datos con fines operativos de la Plataforma.</p>

              <p><strong className="font-sans text-ink">7. Jurisdicción</strong><br />
              Las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires para cualquier controversia derivada del uso de la Plataforma.</p>

              <p><strong className="font-sans text-ink">8. Modificaciones</strong><br />
              Meridian se reserva el derecho de modificar estos términos con notificación previa a los usuarios registrados. El uso continuado de la Plataforma implica aceptación de los términos vigentes.</p>

              {!scrolledToBottom && (
                <div className="text-center text-[10px] text-ink-mute font-mono animate-bounce py-2">↓ Scrolleá para leer todo</div>
              )}
            </div>
            <div className="p-6 border-t border-border-strong flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
                  disabled={!scrolledToBottom}
                  className="mt-0.5 accent-accent" />
                <span className={`text-[12px] leading-relaxed ${!scrolledToBottom ? 'text-ink-mute' : 'text-ink-soft'}`}>
                  Leí y acepto los Términos y Condiciones, la Política de Privacidad y el compromiso de confidencialidad de Meridian.
                </span>
              </label>
              <button
                onClick={handleAccept}
                disabled={!accepted}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Ingresar a Meridian
              </button>
              <p className="text-[10px] text-ink-mute text-center font-mono">
                Versión {TC_VERSION} · Jurisdicción CABA, Argentina
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
