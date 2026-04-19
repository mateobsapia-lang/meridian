import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { Deal, DealStatus, NDARecord, AuditLog, Notification, DealDocument } from '../types';

// ─── DEALS ───────────────────────────────────────────────────

export async function getPublishedDeals(): Promise<Deal[]> {
  const q = query(collection(db, 'deals'), where('status', '==', 'published'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Deal));
}

export async function getDeal(id: string): Promise<Deal | null> {
  const snap = await getDoc(doc(db, 'deals', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Deal;
}

export async function getUserDeals(userId: string): Promise<Deal[]> {
  const q = query(collection(db, 'deals'), where('ownerId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Deal));
}

export async function getAllDeals(): Promise<Deal[]> {
  const q = query(collection(db, 'deals'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Deal));
}

export async function createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'ndaRequests' | 'ndaSigned' | 'dataRoomAccess' | 'ioiCount'>): Promise<string> {
  const id = 'MRD-' + Date.now().toString(36).toUpperCase();
  await setDoc(doc(db, 'deals', id), {
    ...data,
    status: 'under_review',
    viewCount: 0, ndaRequests: 0, ndaSigned: 0, dataRoomAccess: 0, ioiCount: 0,
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function updateDealStatus(dealId: string, status: DealStatus): Promise<void> {
  await updateDoc(doc(db, 'deals', dealId), {
    status, updatedAt: serverTimestamp(),
    ...(status === 'published' ? { publishedAt: serverTimestamp() } : {})
  });
}

export async function incrementDealMetric(dealId: string, field: 'viewCount' | 'ndaRequests' | 'ndaSigned' | 'dataRoomAccess' | 'ioiCount'): Promise<void> {
  await updateDoc(doc(db, 'deals', dealId), { [field]: increment(1), updatedAt: serverTimestamp() });
}

// ─── NDA ─────────────────────────────────────────────────────

export async function createNDARequest(dealId: string, buyerId: string, buyerName: string, buyerEmail: string): Promise<string> {
  const ref = await addDoc(collection(db, 'ndas'), {
    dealId, buyerId, buyerName, buyerEmail, status: 'pending', createdAt: serverTimestamp()
  });
  await incrementDealMetric(dealId, 'ndaRequests');
  return ref.id;
}

export async function signNDA(ndaId: string, dealId: string): Promise<void> {
  await updateDoc(doc(db, 'ndas', ndaId), { status: 'signed', signedAt: serverTimestamp() });
  await incrementDealMetric(dealId, 'ndaSigned');
}

export async function getUserNDAs(userId: string): Promise<NDARecord[]> {
  const q = query(collection(db, 'ndas'), where('buyerId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NDARecord));
}

export async function getDealNDAs(dealId: string): Promise<NDARecord[]> {
  const q = query(collection(db, 'ndas'), where('dealId', '==', dealId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NDARecord));
}

export async function hasSignedNDA(dealId: string, userId: string): Promise<boolean> {
  const q = query(collection(db, 'ndas'), where('dealId', '==', dealId), where('buyerId', '==', userId), where('status', '==', 'signed'));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─── AUDIT LOG ───────────────────────────────────────────────

export async function logAction(dealId: string, action: AuditLog['action'], metadata?: Record<string, any>): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  await addDoc(collection(db, 'auditLogs'), {
    dealId, userId: user.uid, userEmail: user.email, action, metadata: metadata ?? {}, createdAt: serverTimestamp()
  });
}

export async function getDealAuditLog(dealId: string): Promise<AuditLog[]> {
  const q = query(collection(db, 'auditLogs'), where('dealId', '==', dealId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
}

// ─── NOTIFICATIONS ───────────────────────────────────────────

export function subscribeToNotifications(userId: string, callback: (n: Notification[]) => void): () => void {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, snap => { callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification))); });
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

export async function createNotification(userId: string, type: Notification['type'], title: string, message: string, dealId?: string): Promise<void> {
  await addDoc(collection(db, 'notifications'), { userId, type, title, message, dealId, read: false, createdAt: serverTimestamp() });
}

// ─── DOCUMENTS ───────────────────────────────────────────────

export async function getDealDocuments(dealId: string): Promise<DealDocument[]> {
  const q = query(collection(db, 'documents'), where('dealId', '==', dealId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DealDocument));
}

export async function saveDealDocument(docData: Omit<DealDocument, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'documents'), { ...docData, createdAt: serverTimestamp() });
  return ref.id;
}
