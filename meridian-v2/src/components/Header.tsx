import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { NotificationBell } from './NotificationBell';
import { X, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const NAV_LINKS = [
  ['Mercado', '/mercado'],
  ['Proceso', '/proceso'],
  ['Compradores', '/compradores'],
  ['Nosotros', '/nosotros'],
];

export function Header() {
  const { user, setLoginModalOpen, setSellerWizardOpen, setProfileModalOpen, setBuyerWizardOpen } = useAppContext();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleListar = () => {
    setMenuOpen(false);
    if (user) {
      setSellerWizardOpen(true);
    } else {
      // Abrir login y después el wizard — el wizard se abre desde LoginModal al completar auth
      setSellerWizardOpen(true);
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      <header className="bg-paper border-b border-border-strong sticky top-0 z-50">
        <div className="container-custom relative z-50 bg-paper">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex flex-col gap-px shrink-0">
              <span className="font-serif text-[20px] font-bold tracking-[-0.02em] text-ink leading-none">Meridian</span>
              <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-ink-mute hidden sm:block">Mercado privado de empresas</span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map(([label, path]) => (
                <Link key={path} to={path}
                  className={`text-[11px] font-medium tracking-[0.08em] uppercase transition-colors ${location.pathname === path ? 'text-ink' : 'text-ink-soft hover:text-ink'}`}>
                  {label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link to="/dashboard" className="text-[11px] font-medium tracking-[0.08em] uppercase text-accent hover:text-ink transition-colors">Admin</Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex gap-2 sm:gap-3 items-center">
              <div className="hidden sm:flex items-center gap-[5px] font-mono text-[9px] tracking-[0.1em] text-ink-mute border border-border-subtle py-[3px] px-2">
                <span className="w-[5px] h-[5px] rounded-full bg-[#4ade80] animate-pulse" />
                MERCADO ACTIVO
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <button onClick={() => setProfileModalOpen(true)}
                    className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-medium text-[10px] tracking-wider">
                    {user.initials}
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex gap-2 items-center">
                  <button onClick={() => setLoginModalOpen(true)} className="btn-ghost !py-[9px] !px-4 !text-[9px]">Ingresar</button>
                  <button onClick={handleListar} className="btn-primary !py-[9px] !px-4 !text-[9px] whitespace-nowrap">Listar mi empresa</button>
                </div>
              )}

              {/* Hamburger — solo mobile */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center border border-border-strong text-ink hover:bg-paper-mid transition-colors">
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu — fullscreen */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 bg-paper flex flex-col md:hidden"
          >
            <nav className="flex flex-col border-b border-border-strong">
              {NAV_LINKS.map(([label, path]) => (
                <Link key={path} to={path} onClick={() => setMenuOpen(false)}
                  className={`px-6 py-4 text-[13px] font-medium tracking-[0.08em] uppercase border-b border-border-subtle transition-colors ${location.pathname === path ? 'text-ink bg-paper-mid' : 'text-ink-soft hover:text-ink hover:bg-paper-mid'}`}>
                  {label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                  className="px-6 py-4 text-[13px] font-medium tracking-[0.08em] uppercase border-b border-border-subtle text-accent">
                  Admin Panel
                </Link>
              )}
              {user && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                  className="px-6 py-4 text-[13px] font-medium tracking-[0.08em] uppercase border-b border-border-subtle text-ink-soft hover:text-ink">
                  Mi Dashboard
                </Link>
              )}
            </nav>

            <div className="p-6 flex flex-col gap-3 mt-auto">
              {user ? (
                <div className="flex items-center gap-3 p-4 border border-border-strong">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-medium text-[11px]">
                    {user.initials}
                  </div>
                  <div>
                    <div className="font-medium text-ink text-[14px]">{user.name}</div>
                    <div className="text-[11px] text-ink-mute font-mono">{user.email}</div>
                  </div>
                  <button onClick={() => { setMenuOpen(false); setProfileModalOpen(true); }}
                    className="ml-auto text-[10px] font-mono text-accent hover:underline">
                    Perfil
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={handleListar}
                    className="btn-primary w-full !py-4 !text-[11px]">
                    Listar mi empresa →
                  </button>
                  <button onClick={() => { setMenuOpen(false); setBuyerWizardOpen(true); }}
                    className="btn-ghost w-full !py-4 !text-[11px]">
                    Soy comprador
                  </button>
                  <button onClick={() => { setMenuOpen(false); setLoginModalOpen(true); }}
                    className="text-[11px] font-mono text-ink-mute hover:text-ink text-center py-2">
                    Ya tengo cuenta — Ingresar
                  </button>
                </>
              )}
            </div>

            <div className="p-4 border-t border-border-subtle text-center">
              <div className="flex items-center justify-center gap-2 font-mono text-[9px] text-ink-mute">
                <span className="w-[5px] h-[5px] rounded-full bg-[#4ade80] animate-pulse" />
                MERCADO ACTIVO · MERIDIAN M&A
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
