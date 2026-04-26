import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function NotFound() {
  const [count, setCount] = useState(10);
  useEffect(() => {
    const t = setInterval(() => setCount(c => {
      if (c <= 1) { clearInterval(t); window.location.href = '/'; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent mb-6">Error 404</div>
      <h1 className="font-serif text-[clamp(3rem,8vw,6rem)] font-bold text-ink leading-none mb-4">
        Esta página<br/>no existe.
      </h1>
      <p className="text-[14px] text-ink-mute max-w-sm mb-10 leading-relaxed">
        El deal que buscás puede haber sido retirado del mercado o la URL está incorrecta.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link to="/" className="btn-primary !py-4 !px-8">Volver al inicio</Link>
        <Link to="/mercado" className="btn-ghost !py-4 !px-8">Ver el mercado</Link>
      </div>
      <p className="font-mono text-[10px] text-ink-mute mt-10">
        Redirigiendo en {count}s...
      </p>
    </div>
  );
}
