import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';

const TC_VERSION = 'v1.0-2025';

export function WelcomeModal() {
  const { setSellerWizardOpen } = useAppContext();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<'value' | 'tc'>('value');
  const [role, setRole] = useState<'seller' | 'buyer' | 'viewer' | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem('meridian_tc_accepted');
    if (!done) setTimeout(() => setShow(true), 800);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('meridian_tc_accepted', TC_VERSION);
    localStorage.setItem('meridian_tc_date', new Date().toISOString());
    if (role) localStorage.setItem('meridian_preferred_role', role);
    setShow(false);
    if (role === 'seller') setTimeout(() => setSellerWizardOpen(true), 400);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) setScrolledToBottom(true);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-ink/85 backdrop-blur-sm">
        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-paper w-full sm:max-w-lg max-h-[95vh] flex flex-col border border-border-strong shadow-2xl">

          {step === 'value' && (
            <>
              {/* Hero section con propuesta de valor */}
              <div className="bg-ink p-8 flex flex-col gap-5">
                <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-accent">Meridian · Argentina</div>
                <h2 className="font-serif text-[26px] font-bold text-white leading-tight">
                  Vendé tu empresa al precio correcto. Sin intermediarios genéricos.
                </h2>
                <p className="text-[13px] text-white/60 leading-relaxed">
                  Conectamos dueños de PyMEs rentables con compradores institucionales verificados. Solo pagás si vendés.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
                  {[['5%', 'Solo al cierre'], ['90 días', 'Tiempo promedio'], ['4.2×', 'EBITDA promedio']].map(([v, l]) => (
                    <div key={l} className="flex flex-col gap-1">
                      <div className="font-serif text-[20px] font-bold text-accent">{v}</div>
                      <div className="font-mono text-[9px] text-white/40 leading-tight">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selector de rol */}
              <div className="p-6 flex flex-col gap-3 overflow-y-auto">
                <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-1">¿Cómo querés usar Meridian?</div>
                {[
                  { id: 'seller' as const, icon: '🏢', title: 'Quiero vender mi empresa', desc: 'Listá tu empresa y accedé a compradores verificados. 5% solo al cierre.' },
                  { id: 'buyer' as const, icon: '🔍', title: 'Busco empresas para adquirir', desc: 'Explorá oportunidades con métricas auditadas y NDA digital.' },
                  { id: 'viewer' as const, icon: '👀', title: 'Solo estoy explorando', desc: 'Conocé cómo funciona el mercado privado argentino.' },
                ].map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)}
                    className={`flex items-start gap-4 p-4 border text-left transition-all ${role === r.id ? 'border-accent bg-accent-light' : 'border-border-strong hover:bg-paper-mid'}`}>
                    <span className="text-2xl shrink-0">{r.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-ink text-[14px]">{r.title}</div>
                      <div className="text-[12px] text-ink-mute mt-0.5">{r.desc}</div>
                    </div>
                    {role === r.id && <span className="text-accent shrink-0 mt-1">✓</span>}
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-border-strong">
                <button onClick={() => setStep('tc')} disabled={!role}
                  className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">
                  Continuar →
                </button>
              </div>
            </>
          )}

          {step === 'tc' && (
            <>
              <div className="p-6 border-b border-border-strong flex items-center gap-3">
                <button onClick={() => setStep('value')} className="font-mono text-[10px] text-ink-mute hover:text-ink">← Atrás</button>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">Términos y Condiciones</div>
              </div>
              <div onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 text-[12px] text-ink-soft leading-relaxed font-serif space-y-4" style={{ maxHeight: '320px' }}>
                <p><strong className="font-sans text-ink">1. Objeto de la plataforma</strong><br />
                Meridian opera como intermediario en procesos de M&A en la República Argentina. No garantiza la concreción de ninguna operación ni es parte de las transacciones.</p>
                <p><strong className="font-sans text-ink">2. Confidencialidad</strong><br />
                Toda información publicada está protegida por NDA. El usuario se compromete a no divulgar ni usar la información para fines distintos a evaluar una transacción.</p>
                <p><strong className="font-sans text-ink">3. Veracidad</strong><br />
                El vendedor declara bajo juramento que la información es verídica. Meridian no se responsabiliza por inexactitudes en los datos provistos por usuarios.</p>
                <p><strong className="font-sans text-ink">4. Honorarios</strong><br />
                Meridian percibe una comisión del 5% sobre el precio de cierre. No se cobran honorarios anticipados por publicación ni revisión.</p>
                <p><strong className="font-sans text-ink">5. UIF / AML</strong><br />
                Meridian opera como Sujeto Obligado ante la UIF (Res. 30/2017). Los usuarios aceptan someterse a procedimientos KYC/AML requeridos por ley.</p>
                <p><strong className="font-sans text-ink">6. Privacidad</strong><br />
                Los datos personales son tratados conforme a la Ley 25.326. El usuario presta consentimiento para su tratamiento con fines operativos de la Plataforma.</p>
                <p><strong className="font-sans text-ink">7. Jurisdicción</strong><br />
                Cualquier controversia se somete a los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires.</p>
                <p><strong className="font-sans text-ink">8. Modificaciones</strong><br />
                Meridian puede modificar estos términos con notificación previa. El uso continuado implica aceptación de los términos vigentes.</p>
                {!scrolledToBottom && (
                  <div className="text-center text-[10px] text-ink-mute font-mono animate-bounce py-2 sticky bottom-0">↓ Scrolleá para continuar</div>
                )}
              </div>
              <div className="p-6 border-t border-border-strong flex flex-col gap-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
                    disabled={!scrolledToBottom} className="mt-0.5 accent-accent" />
                  <span className={`text-[12px] leading-relaxed ${!scrolledToBottom ? 'text-ink-mute' : 'text-ink-soft'}`}>
                    Leí y acepto los Términos y Condiciones, la Política de Privacidad y el compromiso de confidencialidad de Meridian.
                  </span>
                </label>
                <button onClick={handleAccept} disabled={!accepted}
                  className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">
                  {role === 'seller' ? 'Ingresar y listar mi empresa →' : 'Ingresar a Meridian →'}
                </button>
                <p className="text-[10px] text-ink-mute text-center font-mono">{TC_VERSION} · CABA, Argentina</p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
