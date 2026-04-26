import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppContext } from '../AppContext';
import { X } from 'lucide-react';

const STORAGE_KEY = 'meridian_exit_shown';

export function ExitIntent() {
  const { setDiagnosticoOpen, setSellerWizardOpen } = useAppContext();
  const [show, setShow] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    // Solo mostrar 1 vez por sesión
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Solo desktop — cuando el cursor sale por arriba del viewport
      if (e.clientY <= 20 && !fired.current && window.innerWidth > 768) {
        fired.current = true;
        sessionStorage.setItem(STORAGE_KEY, '1');
        setShow(true);
      }
    };

    // Mobile — mostrar al 70% de scroll si no lo vio antes
    const handleScroll = () => {
      if (window.innerWidth > 768) return;
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.7 && !fired.current) {
        fired.current = true;
        sessionStorage.setItem(STORAGE_KEY, '1');
        setShow(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const close = () => setShow(false);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            className="bg-paper relative shadow-2xl w-full max-w-[480px] z-10 rounded-t-2xl sm:rounded-xl overflow-hidden"
          >
            {/* Handle mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-border-strong rounded-full" />
            </div>

            {/* Header ink */}
            <div className="bg-ink text-white p-6 pb-5">
              <button onClick={close} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent mb-2">Antes de irte</div>
              <h3 className="font-serif text-[22px] font-bold leading-tight">
                ¿Sabés cuánto vale tu empresa hoy?
              </h3>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-[13px] text-ink-soft leading-relaxed">
                El 80% de los dueños de PyMEs subestiman el valor de su empresa en un 30-40%. En 5 minutos, nuestra IA te dice exactamente dónde estás parado.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { close(); setDiagnosticoOpen(true); }}
                  className="btn-primary w-full !py-4"
                >
                  Hacer el diagnóstico gratis →
                </button>
                <button
                  onClick={() => { close(); setSellerWizardOpen(true); }}
                  className="btn-ghost w-full !py-3 text-[11px]"
                >
                  Listar mi empresa directamente
                </button>
              </div>

              <button onClick={close} className="text-[10px] font-mono text-ink-mute hover:text-ink text-center transition-colors">
                No me interesa por ahora
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
