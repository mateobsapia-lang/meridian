import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment,
  type QueryDocumentSnapshot, type DocumentData,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type {
  Deal, DealStatus, NDARecord, AuditLog, Notification, DealDocument,
  DiagnosticoLead, ReporteLead, SimuladorLead,
} from '../types';

const snap2 = <T>(d: QueryDocumentSnapshot<DocumentData>): T => ({ id: d.id, ...d.data() } as T);

// ─── DEALS ───────────────────────────────────────────────────
export async function getPublishedDeals(): Promise<Deal[]> {
  const q = query(collection(db,'deals'), where('status','==','published'), orderBy('createdAt','desc'));
  return (await getDocs(q)).docs.map(d => snap2<Deal>(d));
}
export async function getDeal(id: string): Promise<Deal | null> {
  const s = await getDoc(doc(db,'deals',id));
  return s.exists() ? { id: s.id, ...s.data() } as Deal : null;
}
export async function getUserDeals(uid: string): Promise<Deal[]> {
  const q = query(collection(db,'deals'), where('ownerId','==',uid), orderBy('createdAt','desc'));
  return (await getDocs(q)).docs.map(d => snap2<Deal>(d));
}
export async function getAllDeals(): Promise<Deal[]> {
  const q = query(collection(db,'deals'), orderBy('createdAt','desc'));
  return (await getDocs(q)).docs.map(d => snap2<Deal>(d));
}
export async function createDeal(data: Omit<Deal,'id'|'createdAt'|'updatedAt'|'viewCount'|'ndaRequests'|'ndaSigned'|'dataRoomAccess'|'ioiCount'>): Promise<string> {
  const id = 'MRD-' + Date.now().toString(36).toUpperCase();
  await setDoc(doc(db,'deals',id), {
    ...data, status:'under_review',
    viewCount:0, ndaRequests:0, ndaSigned:0, dataRoomAccess:0, ioiCount:0,
    createdAt: serverTimestamp(),
  });
  return id;
}
export async function updateDeal(dealId: string, data: Partial<Deal>): Promise<void> {
  const { status:_s, ownerId:_o, aiScore:_ai, aiRecommendation:_ar,
    viewCount:_vc, ndaRequests:_nr, ndaSigned:_ns,
    dataRoomAccess:_da, ioiCount:_ic, createdAt:_ca, ...safe } = data;
  await updateDoc(doc(db,'deals',dealId), { ...safe, updatedAt: serverTimestamp() });
}
export async function updateDealStatus(dealId: string, status: DealStatus): Promise<void> {
  await updateDoc(doc(db,'deals',dealId), {
    status, updatedAt: serverTimestamp(),
    ...(status==='published' ? { publishedAt: serverTimestamp() } : {}),
  });
}
export async function saveDealAIScore(
  dealId: string, score: number,
  recommendation: 'approve'|'review'|'reject',
  aiSummary: string, aiStrengths: string[], aiConcerns: string[],
): Promise<void> {
  await updateDoc(doc(db,'deals',dealId), {
    aiScore: score, aiRecommendation: recommendation,
    aiSummary, aiStrengths, aiConcerns,
    aiAnalyzedAt: serverTimestamp(), updatedAt: serverTimestamp(),
    ...(score >= 80 ? { status:'published', publishedAt: serverTimestamp() } : {}),
    ...(score < 50  ? { status:'draft' } : {}),
  });
}
export async function incrementDealMetric(dealId: string, field: 'viewCount'|'ndaRequests'|'ndaSigned'|'dataRoomAccess'|'ioiCount'): Promise<void> {
  await updateDoc(doc(db,'deals',dealId), { [field]: increment(1), updatedAt: serverTimestamp() });
}

// ─── ADMIN ───────────────────────────────────────────────────
export async function getAdminUids(): Promise<string[]> {
  const q = query(collection(db,'users'), where('role','==','admin'));
  return (await getDocs(q)).docs.map(d => d.id);
}

// ─── NDA ─────────────────────────────────────────────────────
export async function createNDARequest(dealId:string, buyerId:string, buyerName:string, buyerEmail:string): Promise<string> {
  const ref = await addDoc(collection(db,'ndas'), { dealId, buyerId, buyerName, buyerEmail, status:'pending', createdAt: serverTimestamp() });
  await incrementDealMetric(dealId, 'ndaRequests');
  return ref.id;
}
export async function signNDA(ndaId:string, dealId:string): Promise<void> {
  await updateDoc(doc(db,'ndas',ndaId), { status:'signed', signedAt: serverTimestamp() });
  await incrementDealMetric(dealId, 'ndaSigned');
}
export async function getUserNDAs(userId:string): Promise<NDARecord[]> {
  const q = query(collection(db,'ndas'), where('buyerId','==',userId));
  return (await getDocs(q)).docs.map(d => snap2<NDARecord>(d));
}
export async function getDealNDAs(dealId:string): Promise<NDARecord[]> {
  const q = query(collection(db,'ndas'), where('dealId','==',dealId));
  return (await getDocs(q)).docs.map(d => snap2<NDARecord>(d));
}
export async function hasSignedNDA(dealId:string, userId:string): Promise<boolean> {
  const q = query(collection(db,'ndas'), where('dealId','==',dealId), where('buyerId','==',userId), where('status','==','signed'));
  return !(await getDocs(q)).empty;
}

// ─── AUDIT LOG ───────────────────────────────────────────────
export async function logAction(dealId:string, action:AuditLog['action'], metadata?: Record<string,unknown>): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  await addDoc(collection(db,'auditLogs'), { dealId, userId:user.uid, userEmail:user.email, action, metadata: metadata??{}, createdAt: serverTimestamp() });
}
export async function getDealAuditLog(dealId:string): Promise<AuditLog[]> {
  const q = query(collection(db,'auditLogs'), where('dealId','==',dealId), orderBy('createdAt','desc'));
  return (await getDocs(q)).docs.map(d => snap2<AuditLog>(d));
}

// ─── NOTIFICATIONS ───────────────────────────────────────────
export function subscribeToNotifications(userId:string, cb:(n:Notification[])=>void): ()=>void {
  const q = query(collection(db,'notifications'), where('userId','==',userId), orderBy('createdAt','desc'), limit(20));
  return onSnapshot(q, s => cb(s.docs.map(d => snap2<Notification>(d))));
}
export async function markNotificationRead(id:string): Promise<void> {
  await updateDoc(doc(db,'notifications',id), { read:true });
}
export async function createNotification(userId:string, type:Notification['type'], title:string, message:string, dealId?:string): Promise<void> {
  await addDoc(collection(db,'notifications'), { userId, type, title, message, dealId, read:false, createdAt: serverTimestamp() });
}
export async function notifyAdmins(type:Notification['type'], title:string, message:string, dealId?:string): Promise<void> {
  const uids = await getAdminUids();
  await Promise.all(uids.map(uid => createNotification(uid, type, title, message, dealId)));
}

// ─── DOCUMENTS ───────────────────────────────────────────────
export async function getDealDocuments(dealId:string): Promise<DealDocument[]> {
  const q = query(collection(db,'documents'), where('dealId','==',dealId), orderBy('createdAt','desc'));
  return (await getDocs(q)).docs.map(d => snap2<DealDocument>(d));
}
export async function saveDealDocument(data: Omit<DealDocument,'id'|'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db,'documents'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

// ─── LEAD MAGNETS ────────────────────────────────────────────

/** Guarda lead del diagnóstico de vendibilidad */
export async function saveDiagnosticoLead(data: Omit<DiagnosticoLead,'id'|'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db,'leads_diagnostico'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

/** Guarda lead del reporte de valuación */
export async function saveReporteLead(data: Omit<ReporteLead,'id'|'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db,'leads_reporte'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

/** Guarda lead del simulador de oferta (buyer) */
export async function saveSimuladorLead(data: Omit<SimuladorLead,'id'|'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db,'leads_simulador'), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

/** Guarda lead simple de la calculadora original */
export async function saveCalculadoraLead(email: string, empresa?: string): Promise<void> {
  await addDoc(collection(db,'leads'), { email, empresa: empresa??'', createdAt: serverTimestamp() });
}

/** Obtiene count de deals publicados que matchean criterios de un buyer (para simulador) */
export async function countMatchingDeals(industries: string[], ticketMin: number, ticketMax: number): Promise<number> {
  const deals = await getPublishedDeals();
  return deals.filter(d => {
    const inTicket = d.askingPrice >= ticketMin && d.askingPrice <= ticketMax;
    const inIndustry = industries.length === 0 || industries.some(i => d.industria.toLowerCase().includes(i.toLowerCase()));
    return inTicket && inIndustry;
  }).length;
}
