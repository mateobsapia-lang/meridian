import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { subscribeToNotifications } from './lib/firestore';
import type { AppUser, Notification } from './types';

type AppContextType = {
  user: AppUser | null;
  loading: boolean;
  login: (user: AppUser) => void;
  logout: () => void;
  // Modals
  isLoginModalOpen: boolean; setLoginModalOpen: (o:boolean)=>void;
  isSellerWizardOpen: boolean; setSellerWizardOpen: (o:boolean)=>void;
  isBuyerWizardOpen: boolean; setBuyerWizardOpen: (o:boolean)=>void;
  isProfileModalOpen: boolean; setProfileModalOpen: (o:boolean)=>void;
  isNdaModalOpen: boolean; setNdaModalOpen: (o:boolean)=>void;
  selectedDealId: string | null; openNdaModal: (id:string)=>void;
  isContactModalOpen: boolean; setContactModalOpen: (o:boolean)=>void;
  isLeadModalOpen: boolean; setLeadModalOpen: (o:boolean)=>void;
  // Lead magnets
  isDiagnosticoOpen: boolean; setDiagnosticoOpen: (o:boolean)=>void;
  isReporteOpen: boolean; setReporteOpen: (o:boolean)=>void;
  isSimuladorOpen: boolean; setSimuladorOpen: (o:boolean)=>void;
  // Notifications
  notifications: Notification[]; unreadCount: number; markRead: (id:string)=>void;
  // Toast
  toastMessage: string | null; showToast: (msg:string)=>void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSellerWizardOpen, setSellerWizardOpen] = useState(false);
  const [isBuyerWizardOpen, setBuyerWizardOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isNdaModalOpen, setNdaModalOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isLeadModalOpen, setLeadModalOpen] = useState(false);
  const [isDiagnosticoOpen, setDiagnosticoOpen] = useState(false);
  const [isReporteOpen, setReporteOpen] = useState(false);
  const [isSimuladorOpen, setSimuladorOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fb) => {
      if (fb) {
        const ref = doc(db,'users',fb.uid);
        const snap = await getDoc(ref);
        const name = fb.displayName || fb.email?.split('@')[0] || 'Usuario';
        const initials = name.slice(0,2).toUpperCase();
        let role: AppUser['role'] = 'seller';
        let buyerProfile = undefined;
        if (snap.exists()) {
          const d = snap.data();
          role = d.role ?? 'seller';
          buyerProfile = d.buyerProfile;
        } else {
          await setDoc(ref, { email: fb.email, role:'seller', createdAt: new Date() });
        }
        setUser({ uid:fb.uid, name, initials, email:fb.email||'', role, buyerProfile });
      } else { setUser(null); }
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    const unsub = subscribeToNotifications(user.uid, setNotifications);
    return unsub;
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markRead = async (id:string) => { const { markNotificationRead } = await import('./lib/firestore'); await markNotificationRead(id); };
  const showToast = (msg:string) => { setToastMessage(msg); setTimeout(()=>setToastMessage(null), 3500); };
  const login = (u:AppUser) => { setUser(u); setLoginModalOpen(false); showToast(`Bienvenido, ${u.name}`); };
  const logout = async () => { await signOut(auth); setUser(null); setProfileModalOpen(false); showToast('Sesión cerrada'); };
  const openNdaModal = (id:string) => { if (!user) { setLoginModalOpen(true); return; } setSelectedDealId(id); setNdaModalOpen(true); };

  return (
    <AppContext.Provider value={{
      user, loading, login, logout,
      isLoginModalOpen, setLoginModalOpen,
      isSellerWizardOpen, setSellerWizardOpen,
      isBuyerWizardOpen, setBuyerWizardOpen,
      isProfileModalOpen, setProfileModalOpen,
      isNdaModalOpen, setNdaModalOpen,
      isContactModalOpen, setContactModalOpen,
      isLeadModalOpen, setLeadModalOpen,
      isDiagnosticoOpen, setDiagnosticoOpen,
      isReporteOpen, setReporteOpen,
      isSimuladorOpen, setSimuladorOpen,
      selectedDealId, openNdaModal,
      notifications, unreadCount, markRead,
      toastMessage, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
