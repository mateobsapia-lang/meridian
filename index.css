import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext';

export function Footer() {
  const { setContactModalOpen, setSellerWizardOpen, setBuyerWizardOpen } = useAppContext();

  return (
    <footer className="bg-ink text-white/60 py-10 md:py-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-12 mb-10">
          <div className="md:col-span-3">
            <div className="flex flex-col gap-px mb-3">
              <span className="font-serif text-[20px] font-bold tracking-[-0.02em] text-white leading-none">Meridian</span>
              <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-white/30">Mercado privado de empresas</span>
            </div>
            <p className="text-[12px] leading-[1.6] max-w-[240px] text-white/45">
              Plataforma institucional de M&A para PyMEs y mid-market argentino. Confidencialidad absoluta.
            </p>
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-[9px] font-medium tracking-[0.16em] uppercase text-white/40 mb-[14px]">Plataforma</h4>
            <Link to="/mercado" className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors">Marketplace</Link>
            <button onClick={() => setSellerWizardOpen(true)} className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors text-left">Vender empresa</button>
            <button onClick={() => setBuyerWizardOpen(true)} className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors text-left">Registro comprador</button>
            <Link to="/proceso" className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors">Cómo funciona</Link>
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-[9px] font-medium tracking-[0.16em] uppercase text-white/40 mb-[14px]">Legal</h4>
            <a href="#" className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors">Términos y condiciones</a>
            <a href="#" className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors">Política AML/KYC</a>
            <a href="#" className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors">NDA estándar</a>
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-[9px] font-medium tracking-[0.16em] uppercase text-white/40 mb-[14px]">Contacto</h4>
            <button onClick={() => setContactModalOpen(true)} className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors text-left uppercase">hola@meridian.ar</button>
            <span className="text-[12px] text-white/55 mb-2">Buenos Aires, CABA</span>
            <a href="#" className="text-[12px] text-white/55 mb-2 hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-white/30">© 2025 Meridian S.A.S. · Todos los derechos reservados · CABA, Argentina</p>
          <div className="flex items-center gap-[6px] font-mono text-[9px] tracking-[0.06em] text-white/30">
            <span className="w-[6px] h-[6px] rounded-full bg-white/20"></span>
            Sujeto Obligado UIF · Res. 30/2017 · CUIT activo AFIP
          </div>
        </div>
      </div>
    </footer>
  );
}
