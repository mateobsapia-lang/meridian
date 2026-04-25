// ─── DEAL ────────────────────────────────────────────────────
export type DealStatus =
  | 'draft' | 'under_review' | 'published'
  | 'nda_phase' | 'loi_received' | 'closing' | 'closed';

export interface Deal {
  id: string; status: DealStatus; ownerId: string;
  nombreFantasia: string; industria: string; region: string; descripcion: string;
  revenue: number; ebitda: number; crecimiento: number; deuda: number;
  askingPrice: number; multiple?: number;
  tipoSocietario: string; jurisdiccion: string; cuit: string;
  representante: string; telefono: string; email: string;
  viewCount: number; ndaRequests: number; ndaSigned: number;
  dataRoomAccess: number; ioiCount: number;
  aiScore?: number; aiRecommendation?: 'approve' | 'review' | 'reject';
  aiSummary?: string; aiStrengths?: string[]; aiConcerns?: string[];
  aiAnalyzedAt?: any; createdAt: any; updatedAt?: any; publishedAt?: any;
  highlights?: string[];
}

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface BuyerProfile {
  ticketMin: number; ticketMax: number;
  industries: string[]; regions: string[];
  structure: 'majority' | 'minority' | 'any';
  tipoAdquirente?: string; organizacion?: string;
}

export interface AppUser {
  uid: string; name: string; initials: string; email: string;
  role: UserRole; buyerProfile?: BuyerProfile;
}

export type NotificationType =
  | 'nda_request' | 'nda_signed' | 'dataroom_access'
  | 'ioi_received' | 'deal_published' | 'deal_rejected';

export interface Notification {
  id: string; userId: string; type: NotificationType;
  title: string; message: string; dealId?: string;
  read: boolean; createdAt: any;
}

export interface NDARecord {
  id: string; dealId: string; buyerId: string;
  buyerName: string; buyerEmail: string;
  status: 'pending' | 'signed'; signedAt?: any; createdAt: any;
}

export interface AuditLog {
  id: string; dealId: string; userId: string; userEmail: string;
  action: 'view_teaser' | 'view_dataroom' | 'download_doc' | 'sign_nda' | 'submit_ioi';
  metadata?: Record<string, unknown>; createdAt: any;
}

export interface DealDocument {
  id: string; dealId: string; name: string;
  storagePath: string; downloadUrl: string;
  uploadedBy: string; createdAt: any;
}

// ─── LEAD MAGNETS ─────────────────────────────────────────────
export interface DiagnosticoLead {
  id: string; email: string; empresa?: string; industria?: string;
  revenue?: number; respuestas: Record<string, string | number | boolean>;
  score: number; scoreLabel: string; diagnostico: string;
  factoresCriticos: string[]; recomendaciones: string[]; createdAt: any;
}

export interface ReporteLead {
  id: string; email: string; empresa?: string; industria: string;
  revenue: number; margen: number; multiple: number;
  valMin: number; valMax: number; reporteGenerado: boolean; createdAt: any;
}

export interface SimuladorLead {
  id: string; email: string; nombre?: string;
  industrias: string[]; regions: string[];
  ticketMin: number; ticketMax: number; dealsMatch: number; createdAt: any;
}
