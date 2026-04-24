import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment,
  type QueryDocumentSnapshot, type DocumentData,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { Deal, DealStatus, NDARecord, AuditLog, Notification, DealDocument } from '../types';

// Helper tipado para mapear snapshots sin `any`
const fromSnap = <T>(d: QueryDocumentSnapshot<DocumentData>): T =>
  ({ id: d.id, ...d.data() } as T);

// ─── DEALS ───────────────────────────────────────────────────

export async function getPublishedDeals(): Promise<Deal[]> {
  const q = query(
    collection(db, 'deals'),
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => fromSnap<Deal>(d));
}

export async function getDeal(id: string): Promise<Deal | null> {
  const snap = await getDoc(doc(db, 'deals', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Deal;
}

export async function getUserDeals(userId: string): Promise<Deal[]> {
  const q = query(
    collection(db, 'deals'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => fromSnap<Deal>(d));
}

export async function getAllDeals(): Promise<Deal[]> {
  const q = query(collection(db, 'deals'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => fromSnap<Deal>(d));
}

export async function createDeal(
  data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'ndaRequests' | 'ndaSigned' | 'dataRoomAccess' | 'ioiCount'>,
): Promise<string> {
  const id = 'MRD-' + Date.now().toString(36).toUpperCase();
  await setDoc(doc(db, 'deals', id), {
    ...data,
    status: 'under_review',   // siempre forzado — nunca tomar del payload
    viewCount: 0,
    ndaRequests: 0,
    ndaSigned: 0,
    dataRoomAccess: 0,
    ioiCount: 0,
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function updateDeal(dealId: string, data: Partial<Deal>): Promise<void> {
  // Strip explícito de campos inmutables — el cliente nunca los puede cambiar
  const {
    status: _s, ownerId: _o, aiScore: _ai, aiRecommendation: _ar,
    viewCount: _vc, ndaRequests: _nr, ndaSigned: _ns,
    dataRoomAccess: _da, ioiCount: _ic, createdAt: _ca,
    ...safe
  } = data;
  await updateDoc(doc(db, 'deals', dealId), { ...safe, updatedAt: serverTimestamp() });
}

export async function updateDealStatus(dealId: string, status: DealStatus): Promise<void> {
  await updateDoc(doc(db, 'deals', dealId), {
    status,
    updatedAt: serverTimestamp(),
    ...(status === 'published' ? { publishedAt: serverTimestamp() } : {}),
  });
}

/**
 * Persiste el resultado del análisis IA en el deal.
 * También aplica la lógica de auto-publicación/rechazo por score.
 * Solo debe llamarse desde AIAnalysisModal después de obtener el resultado de Claude.
 */
export async function saveDealAIScore(
  dealId: string,
  score: number,
  recommendation: 'approve' | 'review' | 'reject',
  aiSummary: string,
  aiStrengths: string[],
  aiConcerns: string[],
): Promise<void> {
  await updateDoc(doc(db, 'deals', dealId), {
    aiScore: score,
    aiRecommendation: recommendation,
    aiSummary,
    aiStrengths,
    aiConcerns,
    aiAnalyzedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    // Regla de negocio: ≥80 auto-publica, <50 regresa a draft para que pida más docs
    ...(score >= 80 ? { status: 'published', publishedAt: serverTimestamp() } : {}),
    ...(score < 50  ? { status: 'draft' } : {}),
    // 50-79: se queda en under_review para revisión manual del admin
  });
}

export async function incrementDealMetric(
  dealId: string,
  field: 'viewCount' | 'ndaRequests' | 'ndaSigned' | 'dataRoomAccess' | 'ioiCount',
): Promise<void> {
  await updateDoc(doc(db, 'deals', dealId), {
    [field]: increment(1),
    updatedAt: serverTimestamp(),
  });
}

// ─── ADMIN ───────────────────────────────────────────────────

/** Resuelve UIDs de admins desde Firestore — nunca hardcodear. */
export async function getAdminUids(): Promise<string[]> {
  const q = query(collection(db, 'users'), where('role', '==', 'admin'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.id);
}

// ─── NDA ─────────────────────────────────────────────────────

export async function createNDARequest(
  dealId: string, buyerId: string, buyerName: string, buyerEmail: string,
): Promise<string> {
  const ref = await addDoc(collection(db, 'ndas'), {
    dealId, buyerId, buyerName, buyerEmail,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  await incrementDealMetric(dealId, 'ndaRequests');
  return ref.id;
}

export async function signNDA(ndaId: string, dealId: string): Promise<void> {
  await updateDoc(doc(db, 'ndas', ndaId), {
    status: 'signed',
    signedAt: serverTimestamp(),
  });
  await incrementDealMetric(dealId, 'ndaSigned');
}

export async function getUserNDAs(userId: string): Promise<NDARecord[]> {
  const q = query(collection(db, 'ndas'), where('buyerId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => fromSnap<NDARecord>(d));
}

export async function getDealNDAs(dealId: string): Promise<NDARecord[]> {
  const q = query(collection(db, 'ndas'), where('dealId', '==', dealId));
  const snap = await getDocs(q);
  return snap.docs.map(d => fromSnap<NDARecord>(d));
}

export async function hasSignedNDA(dealId: string, userId: string): Promise<boolean> {
  const q = query(
    collection(db, 'ndas'),
    where('dealId', '==', dealId),
    where('buyerId', '==', userId),
    where('status', '==', 'signed'),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─── AUDIT LOG ───────────────────────────────────────────────

export async function logAction(
  dealId: string, action: AuditLog['action'], metadata?: Record<string, unknown>,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  await addDoc(collection(db, 'auditLogs'), {
    dealId, userId: user.uid, userEmail: user.email,
    action, metadata: metadata ?? {},
    createdAt: serverTimestamp(),
  });
}

export async function getDealAuditLog(dealId: string): Promise<AuditLog[]> {
  const q = query(
    collection(db, 'auditLogs'),
    where('dealId', '==', dealId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => fromSnap<AuditLog>(d));
}

// ─── NOTIFICATIONS ───────────────────────────────────────────

export function subscribeToNotifications(
  userId: string, callback: (n: Notification[]) => void,
): () => void {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20),
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => fromSnap<Notification>(d)));
  });
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

export async function createNotification(
  userId: string, type: Notification['type'], title: string, message: string, dealId?: string,
): Promise<void> {
  await addDoc(collection(db, 'notifications'), {
    userId, type, title, message, dealId,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/** Notifica a todos los admins — resuelve UIDs dinámicamente. */
export async function notifyAdmins(
  type: Notification['type'], title: string, message: string, dealId?: string,
): Promise<void> {
  const adminUids = await getAdminUids();
  await Promise.all(
    adminUids.map(uid => createNotification(uid, type, title, message, dealId)),
  );
}

// ─── DOCUMENTS ───────────────────────────────────────────────

export async function getDealDocuments(dealId: string): Promise<DealDocument[]> {
  const q = query(
    collection(db, 'documents'),
    where('dealId', '==', dealId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => fromSnap<DealDocument>(d));
}

export async function saveDealDocument(
  docData: Omit<DealDocument, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'documents'), {
    ...docData,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
