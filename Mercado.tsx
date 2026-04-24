import { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getUserDeals } from '../lib/firestore';

export function ProfileModal() {
  const { isProfileModalOpen, setProfileModalOpen, user, logout, showToast, login } = useAppContext();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  if (!user) return null;

  const handleSwitchRole = async () => {
    if (!confirmSwitch) {
      setConfirmSwitch(true);
      return;
    }

    setSwitching(true);
    try {
      // Si es vendedor, verificar que no tenga deals activos
      if (user.role === 'seller') {
        const deals = await getUserDeals(user.uid);
        const activeDeals = deals.filter(d =>
          ['under_review', 'published', 'nda_phase', 'loi_received', 'closing'].includes(d.status)
        );
        if (activeDeals.length > 0) {
          showToast(`No podés cambiar de rol: tenés ${activeDeals.length} deal(s) activo(s).`);
          setSwitching(false);
          setConfirmSwitch(false);
          return;
        }
      }

      const newRole = user.role === 'buyer' ? 'seller' : 'buyer';
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });

      // Actualizar contexto
      login({ ...user, role: newRole });
      showToast(`Rol cambiado a ${newRole === 'buyer' ? 'Comprador' : 'Vendedor'}`);
      setConfirmSwitch(false);
      setProfileModalOpen(false);
      navigate('/dashboard');
    } catch {
      showToast('Error al cambiar rol. Intentá de nuevo.');
    } finally {
      setSwitching(false);
    }
  };

  const targetRole = user.role === 'buyer' ? 'Vendedor' : 'Comprador';
  const isAdmin = user.role === 'admin';

  return (
    <Modal
      isOpen={isProfileModalOpen}
      onClose={() => { setProfileModalOpen(false); setConfirmSwitch(false); }}
      title="Perfil de Usuario"
    >
      <div className="flex flex-col gap-6">
        {/* Avatar + info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-medium font-serif text-[24px]">
            {user.initials}
          </div>
          <div>
            <div className="text-[14px] font-medium text-ink">{user.name}</div>
            <div className="text-[12px] font-mono text-ink-mute">{user.email}</div>
          </div>
        </div>

        {/* Rol actual */}
        <div className="flex flex-col gap-2 border-t border-border-strong pt-5">
          <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-ink-mute mb-1">
            Tipo de cuenta
          </div>
          <div className={`flex items-center gap-3 px-4 py-3 border text-[13px] font-medium ${
            isAdmin ? 'border-accent/30 bg-accent-light text-accent' :
            user.role === 'buyer' ? 'border-blue-200 bg-blue-50 text-blue-700' :
            'border-border-subtle bg-paper-deep text-ink-soft'
          }`}>
            <span className="text-lg">
              {isAdmin ? '⚡' : user.role === 'buyer' ? '🔍' : '🏢'}
            </span>
            {isAdmin ? 'Administrador' : user.role === 'buyer' ? 'Comprador Institucional / Inversor' : 'Vendedor / Propietario'}
          </div>

          {/* Switch rol — solo buyer/seller, no admin */}
          {!isAdmin && (
            <div className="mt-2">
              {!confirmSwitch ? (
                <button
                  onClick={() => setConfirmSwitch(true)}
                  className="w-full text-[11px] font-mono tracking-wider text-ink-mute border border-border-strong px-4 py-2.5 hover:bg-paper-mid transition-colors text-left flex items-center justify-between"
                >
                  <span>Cambiar a {targetRole}</span>
                  <span>→</span>
                </button>
              ) : (
                <div className="border border-amber-300 bg-amber-50 p-4 flex flex-col gap-3">
                  <p className="text-[12px] text-amber-800">
                    {user.role === 'seller'
                      ? `¿Confirmar cambio a Comprador? Si tenés deals activos no podrás cambiar.`
                      : `¿Confirmar cambio a Vendedor? Perderás la vista de comprador.`
                    }
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSwitchRole}
                      disabled={switching}
                      className="flex-1 text-[11px] font-medium px-3 py-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                    >
                      {switching ? 'Cambiando...' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => setConfirmSwitch(false)}
                      className="flex-1 text-[11px] font-medium px-3 py-2 border border-border-strong text-ink-soft hover:bg-paper-mid transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <button
          onClick={() => { setProfileModalOpen(false); navigate('/dashboard'); }}
          className="btn-primary w-full"
        >
          Mi Panel (Workspace)
        </button>

        <button
          onClick={logout}
          className="btn-ghost !border-[#fca5a5] !text-[#ef4444] hover:!bg-[#fef2f2] hover:!border-[#ef4444] self-start"
        >
          Cerrar sesión
        </button>
      </div>
    </Modal>
  );
}
