import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { user, setLoginModalOpen, setSellerWizardOpen, setProfileModalOpen } = useAppContext();
  const location = useLocation();

  return (
    <header className="bg-paper border-b border-border-strong sticky top-0 z-50">
      <div className="container-custom relative z-50 bg-paper">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col gap-px">
            <span className="font-serif text-[20px] font-bold tracking-[-0.02em] text-ink leading-none">Meridian</span>
            <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-ink-mute">Mercado privado de empresas</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link to="/mercado" className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-soft hover:text-ink transition-colors">Mercado</Link>
            <Link to="/proceso" className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-soft hover:text-ink transition-colors">Proceso</Link>
            <Link to="/compradores" className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-soft hover:text-ink transition-colors">Compradores</Link>
            <Link to="/nosotros" className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-soft hover:text-ink transition-colors">Nosotros</Link>
            {user?.role === 'admin' && (
              <Link to="/dashboard" className="text-[11px] font-medium tracking-[0.08em] uppercase text-accent hover:text-ink transition-colors">Admin</Link>
            )}
          </nav>

          <div className="flex gap-2 sm:gap-3 items-center">
            <div className="hidden sm:flex items-center gap-[5px] font-mono text-[9px] tracking-[0.1em] text-ink-mute border border-border-subtle py-[3px] px-2">
              <span className="w-[5px] h-[5px] rounded-full bg-[#4ade80] animate-pulse-dot"></span>
              MERCADO ACTIVO
            </div>

            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <NotificationBell />
                <button onClick={() => setProfileModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-medium text-[10px] tracking-wider">
                  {user.initials}
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <button onClick={() => setLoginModalOpen(true)} className="hidden min-[380px]:inline-flex btn-ghost !py-[9px] !px-3 sm:!px-4 !text-[9px]">Ingresar</button>
                <button onClick={() => setSellerWizardOpen(true)} className="btn-primary !py-[9px] !px-3 sm:!px-4 !text-[9px] whitespace-nowrap">Listar</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-border-subtle bg-paper overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav className="flex items-center min-w-max px-2">
          {[['Mercado','/mercado'],['Proceso','/proceso'],['Compradores','/compradores'],['Nosotros','/nosotros']].map(([label, path]) => (
            <Link key={path} to={path}
              className={`text-[10px] font-medium tracking-[0.1em] uppercase px-3 py-3 border-b-2 transition-colors ${location.pathname === path ? 'text-ink border-ink' : 'text-ink-soft border-transparent hover:text-ink'}`}>
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/dashboard" className="text-[10px] font-medium tracking-[0.1em] uppercase px-3 py-3 border-b-2 text-accent border-transparent">Admin</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
