import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';

export function ProfileModal() {
  const { isProfileModalOpen, setProfileModalOpen, user, logout } = useAppContext();
  const navigate = useNavigate();

  if (!user) return null;

  const navigateToDashboard = () => {
    setProfileModalOpen(false);
    navigate('/dashboard');
  };

  return (
    <Modal 
      isOpen={isProfileModalOpen} 
      onClose={() => setProfileModalOpen(false)} 
      title="Perfil de Usuario"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-medium font-serif text-[24px]">
            {user.initials}
          </div>
          <div>
            <div className="text-[14px] font-medium text-ink">{user.name}</div>
            <div className="text-[12px] font-mono text-ink-mute">{user.email}</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 border-t border-border-strong pt-5 mt-2">
          <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-ink-mute">
            Tipo de cuenta
          </div>
          <div className="text-[13px] border border-border-subtle bg-paper-deep px-4 py-3 text-ink-soft">
            {user.role === 'buyer' ? 'Comprador Institucional / Inversor' : 'Vendedor / Propietario'}
          </div>
        </div>

        <button 
          onClick={navigateToDashboard}
          className="btn-primary w-full mt-4"
        >
          Mi Panel (Workspace)
        </button>

        <button 
          onClick={logout}
          className="btn-ghost mt-2 !border-[#fca5a5] !text-[#ef4444] hover:!bg-[#fef2f2] hover:!border-[#ef4444] self-start"
        >
          Cerrar sesión
        </button>
      </div>
    </Modal>
  );
}
