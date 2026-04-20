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
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  isSellerWizardOpen: boolean;
  setSellerWizardOpen: (open: boolean) => void;
  isBuyerWizardOpen: boolean;
  setBuyerWizardOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  isNdaModalOpen: boolean;
  setNdaModalOpen: (open: boolean) => void;
  selectedDealId: string | null;
  openNdaModal: (dealId: string) => void;
  isContactModalOpen: boolean;
  setContactModalOpen: (open: boolean) => void;
  isLeadModalOpen: boolean;
  setLeadModalOpen: (open: boolean) => void;
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
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
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario';
        const initials = name.slice(0, 2).toUpperCase();

        let role: AppUser['role'] = 'seller';
        let isNew = false;
        let buyerProfile = undefined;

        if (userSnap.exists()) {
          const data = userSnap.data();
          role = data.role ?? 'seller';
          buyerProfile = data.buyerProfile;
          // Si no tiene rol definido explícitamente, es nuevo
          isNew = !data.role;
        } else {
          // Usuario completamente nuevo — crear doc y mostrar onboarding
          await setDoc(userRef, { email: firebaseUser.email, createdAt: new Date() });
          isNew = true;
        }

        setUser({ uid: firebaseUser.uid, name, initials, email: firebaseUser.email || '', role, buyerProfile, isNew } as any);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    const unsub = subscribeToNotifications(user.uid, setNotifications);
    return unsub;
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    const { markNotificationRead } = await import('./lib/firestore');
    await markNotificationRead(id);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const login = (newUser: AppUser) => {
    setUser(newUser);
    setLoginModalOpen(false);
    showToast(`Bienvenido, ${newUser.name}`);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfileModalOpen(false);
    showToast('Sesión cerrada');
  };

  const openNdaModal = (dealId: string) => {
    if (!user) { setLoginModalOpen(true); return; }
    setSelectedDealId(dealId);
    setNdaModalOpen(true);
  };

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
