// ─── DEAL ────────────────────────────────────────────────────
export type DealStatus =
  | 'draft'
  | 'under_review'
  | 'published'
  | 'nda_phase'
  | 'loi_received'
  | 'closing'
  | 'closed';

export interface Deal {
  id: string;
  status: DealStatus;
  ownerId: string;

  // Información de la empresa
  nombreFantasia: string;
  industria: string;
  region: string;
  descripcion: string;

  // Financieros
  revenue: number;       // en USD
  ebitda: number;        // en USD
  crecimiento: number;   // porcentaje
  deuda: number;         // en USD
  askingPrice: number;   // en USD
  multiple?: number;     // calculado

  // Legal
  tipoSocietario: string;
  jurisdiccion: string;
  cuit: string;

  // Contacto
  representante: string;
  telefono: string;
  email: string;

  // Métricas de engagement (actualizadas por Cloud Functions / client)
  viewCount: number;
  ndaRequests: number;
  ndaSigned: number;
  dataRoomAccess: number;
  ioiCount: number;

  // Timestamps
  createdAt: any;
  updatedAt?: any;
  publishedAt?: any;

  // Highlights opcionales
  highlights?: string[];
}

// ─── USER ────────────────────────────────────────────────────
export type UserRole = 'buyer' | 'seller' | 'admin';

export interface AppUser {
  uid: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  // Perfil de buyer (para match scoring)
  buyerProfile?: BuyerProfile;
}

export interface BuyerProfile {
  ticketMin: number;   // USD
  ticketMax: number;   // USD
  industries: string[];
  regions: string[];
  structure: 'majority' | 'minority' | 'any';
}

// ─── NOTIFICATION ────────────────────────────────────────────
export type NotificationType =
  | 'nda_request'
  | 'nda_signed'
  | 'dataroom_access'
  | 'ioi_received'
  | 'deal_published'
  | 'deal_rejected';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  dealId?: string;
  read: boolean;
  createdAt: any;
}

// ─── NDA ─────────────────────────────────────────────────────
export interface NDARecord {
  id: string;
  dealId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  status: 'pending' | 'signed';
  signedAt?: any;
  createdAt: any;
}

// ─── AUDIT LOG ───────────────────────────────────────────────
export interface AuditLog {
  id: string;
  dealId: string;
  userId: string;
  userEmail: string;
  action: 'view_teaser' | 'view_dataroom' | 'download_doc' | 'sign_nda' | 'submit_ioi';
  metadata?: Record<string, any>;
  createdAt: any;
}

// ─── DOCUMENT ────────────────────────────────────────────────
export interface DealDocument {
  id: string;
  dealId: string;
  name: string;
  storagePath: string;
  downloadUrl: string;
  uploadedBy: string;
  createdAt: any;
}
