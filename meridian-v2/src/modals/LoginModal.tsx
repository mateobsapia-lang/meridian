import { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, isSellerWizardOpen, login, showToast } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fb = result.user;

      // Leer rol real desde Firestore — nunca hardcodear 'seller'
      const ref = doc(db, 'users', fb.uid);
      const snap = await getDoc(ref);
      let role: 'seller' | 'buyer' | 'admin' = 'seller';
      let buyerProfile;

      if (snap.exists()) {
        role = snap.data().role ?? 'seller';
        buyerProfile = snap.data().buyerProfile;
      } else {
        // Primer login — crear documento
        await setDoc(ref, {
          email: fb.email,
          name: fb.displayName,
          role: 'seller',
          createdAt: serverTimestamp(),
        });
      }

      const name = fb.displayName || fb.email?.split('@')[0] || 'Usuario';
      const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

      login({ uid: fb.uid, name, initials, email: fb.email || '', role, buyerProfile });
      setLoginModalOpen(false);
      showToast(`Bienvenido, ${name.split(' ')[0]}`);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast('Error al iniciar sesión. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} title="Ingresar a Meridian">
      <div className="flex flex-col gap-6">
        <p className="text-[13px] text-ink-soft leading-relaxed text-center">
          {isSellerWizardOpen
            ? 'Para listar tu empresa necesitás una cuenta verificada. Es gratuito y tarda 30 segundos.'
            : 'Para proteger la confidencialidad del mercado, solo permitimos accesos verificados institucionales.'}
        </p>

        <button onClick={handleGoogleLogin} disabled={loading}
          className="btn-primary flex items-center justify-center gap-3 w-full !py-4 disabled:opacity-60">
          <svg className="w-4 h-4 bg-white rounded-full p-[2px] shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        <p className="text-[10px] text-ink-mute text-center font-mono">
          Sin spam · Tus datos están protegidos · Podés desregistrarte en cualquier momento
        </p>
      </div>
    </Modal>
  );
}
