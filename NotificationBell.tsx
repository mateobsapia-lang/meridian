import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';

export function ExitIntent() {
  const { setSellerWizardOpen } = useAppContext();
  const [show, setShow] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('meridian_exit_shown');
    if (alreadyShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !shown.current) {
        shown.current = true;
        sessionStorage.setItem('meridian_exit_shown', '1');
        setTimeout(() => setShow(true), 100);
      }
    };

    // Solo en desktop
    if (window.innerWidth >= 768) {
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm"
      onClick={() => setShow(false)}>
      <div className="bg-paper border border-border-strong shadow-2xl w-full max-w-md p-8 flex flex-col gap-5 animate-in fade-in slide-in-from-top-4 duration-300"
        onClick={e => e.stopPropagation()}>
        <button onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-ink-mute hover:text-ink text-[18px] leading-none">×</button>
        <div className="font-mono text-[9px] uppercase tracking-widest text-accent">Antes de irte</div>
        <h2 className="font-serif text-[24px] font-bold text-ink leading-tight">
          ¿Sabés cuánto vale tu empresa?
        </h2>
        <p className="text-[13px] text-ink-soft leading-relaxed">
          Miles de dueños de PyMEs dejan dinero sobre la mesa por no conocer el valor real de su negocio. La calculadora es gratis y tarda 30 segundos.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setShow(false); document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="btn-primary w-full">
            Calcular el valor de mi empresa →
          </button>
          <button
            onClick={() => { setShow(false); setSellerWizardOpen(true); }}
            className="btn-ghost w-full text-[12px]">
            Ya sé cuánto vale — quiero listarla
          </button>
          <button onClick={() => setShow(false)} className="text-[11px] text-ink-mute text-center hover:text-ink transition-colors mt-1">
            No me interesa por ahora
          </button>
        </div>
      </div>
    </div>
  );
}
