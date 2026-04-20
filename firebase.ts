import { useState } from 'react';
import { Modal } from '../components/Modal';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAppContext } from '../AppContext';

export function OnboardingModal() {
  const { user, login } = useAppContext();
  const [loading, setLoading] = useState(false);

  // Solo mostrar si el usuario está logueado y no tiene rol definido aún
  // Lo detectamos con un flag "isNew" que ponemos en el contexto
  const isOpen = !!user && (user as any).isNew === true;

  const handleSelect = async (role: 'seller' | 'buyer') => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { role });
      // Actualizar el contexto sin recargar
      login({ ...user, role, isNew: false } as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="">
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-2">Bienvenido a Meridian</div>
          <h2 className="font-serif text-[28px] font-bold text-ink">¿Cómo vas a usar la plataforma?</h2>
          <p className="text-ink-mute text-[13px] mt-2">Podés cambiar esto después desde tu perfil.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-2">
          <button onClick={() => handleSelect('seller')} disabled={loading}
            className="flex flex-col items-center gap-4 p-6 border-2 border-border-strong hover:border-accent hover:bg-accent-light transition-all group">
            <span className="text-4xl">🏢</span>
            <div>
              <div className="font-serif text-[16px] font-bold text-ink group-hover:text-accent">Vendedor</div>
              <div className="text-[11px] text-ink-mute mt-1">Quiero vender o listar mi empresa</div>
            </div>
          </button>

          <button onClick={() => handleSelect('buyer')} disabled={loading}
            className="flex flex-col items-center gap-4 p-6 border-2 border-border-strong hover:border-accent hover:bg-accent-light transition-all group">
            <span className="text-4xl">💼</span>
            <div>
              <div className="font-serif text-[16px] font-bold text-ink group-hover:text-accent">Comprador</div>
              <div className="text-[11px] text-ink-mute mt-1">Busco empresas para invertir o adquirir</div>
            </div>
          </button>
        </div>

        {loading && <div className="font-mono text-[11px] text-ink-mute animate-pulse">Guardando...</div>}
      </div>
    </Modal>
  );
}
