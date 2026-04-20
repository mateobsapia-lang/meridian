import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { getUserDeals, getAllDeals, updateDealStatus, getDealNDAs, getDealDocuments, saveDealDocument } from '../lib/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, Eye, Lock, Upload, Check, X, Clock, ChevronRight } from 'lucide-react';
import type { Deal, NDARecord, DealDocument } from '../types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', under_review: 'En Revisión', published: 'Publicado',
  nda_phase: 'Fase NDA', loi_received: 'IOI Recibido', closing: 'En Cierre', closed: 'Cerrado'
};

export function Dashboard() {
  const { user } = useAppContext();
  const navigate = useNavigate();

  if (!user) return (
    <div className="p-20 text-center flex flex-col items-center">
      <h2 className="font-serif text-[32px] mb-4">Acceso Restringido</h2>
      <p className="text-ink-soft mb-8">Debe iniciar sesión para ver su panel.</p>
      <button onClick={() => navigate('/')} className="btn-primary">Volver al Inicio</button>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 bg-paper min-h-screen pb-24">
      <div className="bg-ink text-white pt-16 pb-20 px-8 border-b-4 border-accent">
        <div className="container-custom">
          <div className="font-mono text-[10px] text-accent tracking-[0.12em] uppercase mb-4">Meridian Workspace</div>
          <h1 className="font-serif text-[36px] md:text-[48px] font-bold leading-tight tracking-[-0.02em]">
            Panel de {user.role === 'admin' ? 'Administración' : user.role === 'seller' ? 'Vendedor' : 'Inversor'}
          </h1>
          <p className="text-white/60 mt-2 font-mono text-[12px]">{user.name} · {user.email}</p>
        </div>
      </div>
      <div className="container-custom -mt-10">
        {user.role === 'admin' ? <AdminDashboard /> :
         user.role === 'seller' ? <SellerDashboard userId={user.uid} /> :
         <BuyerDashboard userId={user.uid} />}
      </div>
    </div>
  );
}

// ─── SELLER ──────────────────────────────────────────────────
import { updateDeal } from '../lib/firestore';
import { Modal } from '../components/Modal';

function SellerDashboard({ userId }: { userId: string }) {
  const { setSellerWizardOpen, showToast } = useAppContext();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [ndas, setNdas] = useState<NDARecord[]>([]);
  const [docs, setDocs] = useState<DealDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { getUserDeals(userId).then(setDeals); }, [userId]);

  useEffect(() => {
    if (!selectedDeal) return;
    getDealNDAs(selectedDeal.id).then(setNdas);
    getDealDocuments(selectedDeal.id).then(setDocs);
  }, [selectedDeal]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDeal) return;
    setUploading(true);
    const storageRef = ref(storage, `deals/${selectedDeal.id}/${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on('state_changed',
      snap => setUploadProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      () => setUploading(false),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await saveDealDocument({ dealId: selectedDeal.id, name: file.name, storagePath: storageRef.fullPath, downloadUrl: url, uploadedBy: userId });
        getDealDocuments(selectedDeal.id).then(setDocs);
        setUploading(false);
        setUploadProgress(0);
      }
    );
  };

  const activeDeal = deals.find(d => ['published','nda_phase','loi_received'].includes(d.status));

  const handleSaveEdit = async (updatedData: Partial<Deal>) => {
    if(!editingDeal) return;
    try {
      await updateDeal(editingDeal.id, updatedData);
      setDeals(prev => prev.map(d => d.id === editingDeal.id ? { ...d, ...updatedData } : d));
      if (selectedDeal?.id === editingDeal.id) setSelectedDeal({ ...selectedDeal, ...updatedData } as Deal);
      setEditingDeal(null);
      showToast('Empresa actualizada exitosamente.');
    } catch {
      showToast('Error al actualizar la empresa.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* KPI CARDS */}
      {activeDeal && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-border-strong border border-border-strong shadow-xl">
          {[
            { label: 'Estado', value: STATUS_LABELS[activeDeal.status], color: activeDeal.status === 'published' ? 'text-[#4ade80]' : 'text-accent' },
            { label: 'Visualizaciones', value: String(activeDeal.viewCount ?? 0) },
            { label: 'NDAs Solicitados', value: String(activeDeal.ndaRequests ?? 0) },
            { label: 'NDAs Firmados', value: String(activeDeal.ndaSigned ?? 0) },
          ].map(k => (
            <div key={k.label} className="bg-paper p-6">
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-mute mb-2">{k.label}</div>
              <div className={`font-serif text-[24px] font-bold ${k.color ?? 'text-ink'}`}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* DEALS LIST */}
      <div className="border border-border-strong bg-paper p-8">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-6 border-b border-border-subtle pb-4">Mis Empresas</h3>
        {deals.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border-strong bg-paper-deep">
            <div className="w-16 h-16 bg-white border border-border-subtle rounded-full flex items-center justify-center shadow-sm mb-5 text-2xl">
              🏢
            </div>
            <h4 className="font-serif text-[22px] font-bold text-ink mb-2">Aún no tenés empresas listadas</h4>
            <p className="text-[13px] text-ink-soft max-w-sm mb-6 leading-relaxed">
              Comenzá el proceso listando tu empresa de forma confidencial para conectarte con compradores institucionales de nuestra red.
            </p>
            <button onClick={() => setSellerWizardOpen(true)} className="btn-primary">
              Listar mi primera empresa →
            </button>
          </div>
        ) : deals.map(d => (
          <div key={d.id} onClick={() => setSelectedDeal(d)}
            className={`flex items-center justify-between p-4 mb-2 border cursor-pointer transition-colors ${selectedDeal?.id === d.id ? 'border-accent bg-accent-light' : 'border-border-subtle hover:bg-paper-mid'}`}>
            <div>
              <div className="font-medium text-ink flex items-center gap-2">
                {d.nombreFantasia}
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingDeal(d); }}
                  className="text-[10px] font-mono border border-border-strong px-2 py-0.5 hover:bg-white text-ink-soft transition-colors"
                >
                  Editar
                </button>
              </div>
              <div className="font-mono text-[10px] text-ink-mute mt-0.5">{d.id} · {d.industria}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono border border-border-strong px-2 py-0.5 text-ink-soft">{STATUS_LABELS[d.status]}</span>
              <ChevronRight size={14} className="text-ink-mute" />
            </div>
          </div>
        ))}
      </div>

      {editingDeal && (
        <EditDealModal 
          deal={editingDeal} 
          onClose={() => setEditingDeal(null)} 
          onSave={handleSaveEdit} 
        />
      )}

      {/* DEAL DETAIL */}
      {selectedDeal && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* NDAs */}
          <div className="border border-border-strong bg-paper p-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-6">NDAs ({ndas.length})</h3>
            {ndas.length === 0 ? <p className="text-sm text-ink-mute">Sin solicitudes aún.</p> : ndas.map(n => (
              <div key={n.id} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-none text-[12px]">
                <div>
                  <div className="text-ink font-medium">{n.buyerName}</div>
                  <div className="text-ink-mute font-mono">{n.buyerEmail}</div>
                </div>
                <span className={`font-mono text-[10px] px-2 py-0.5 border ${n.status === 'signed' ? 'border-accent/30 text-accent bg-accent-light' : 'border-border-strong text-ink-mute'}`}>
                  {n.status === 'signed' ? 'Firmado' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>

          {/* DATA ROOM */}
          <div className="border border-border-strong bg-paper p-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-6">Data Room</h3>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border-strong px-4 py-3 hover:bg-paper-mid transition-colors mb-4 text-[11px] text-ink-soft">
              <Upload size={14} />
              {uploading ? `Subiendo... ${uploadProgress}%` : 'Subir documento'}
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.xls,.xlsx" />
            </label>
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-none text-[12px]">
                <div className="flex items-center gap-2"><FileText size={13} className="text-accent" />{doc.name}</div>
                <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-accent text-[10px] font-mono hover:underline">Ver</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const INDUSTRIES = ['SaaS / Tech', 'Agro', 'Manufactura', 'Servicios', 'Retail', 'Salud', 'Construcción', 'Logística', 'Otro'];
const REGIONS = ['CABA', 'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Entre Ríos', 'Tucumán', 'Otro'];

function EditDealModal({ deal, onClose, onSave }: { deal: Deal, onClose: () => void, onSave: (data: Partial<Deal>) => void }) {
  const [form, setForm] = useState({
    nombreFantasia: deal.nombreFantasia || '',
    industria: deal.industria || '',
    region: deal.region || '',
    descripcion: deal.descripcion || '',
    revenue: deal.revenue ? Math.round(deal.revenue / 1000).toString() : '',
    ebitda: deal.ebitda ? Math.round(deal.ebitda / 1000).toString() : '',
    askingPrice: deal.askingPrice ? Math.round(deal.askingPrice / 1000).toString() : '',
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nombreFantasia: form.nombreFantasia,
      industria: form.industria,
      region: form.region,
      descripcion: form.descripcion,
      revenue: Number(form.revenue) * 1000,
      ebitda: Number(form.ebitda) * 1000,
      askingPrice: Number(form.askingPrice) * 1000,
    });
  };

  const inputClass = "w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5";

  return (
    <Modal isOpen={true} onClose={onClose} title={`Editar ${deal.id}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {deal.status !== 'under_review' && deal.status !== 'draft' && (
          <div className="bg-amber-50 border border-amber-300 p-3 text-[12px] text-amber-800 mb-2">
            <strong>Nota:</strong> Como esta empresa ya fue publicada o está en proceso, cualquier edición podría requerir una nueva revisión por parte del equipo de Meridian.
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Nombre Fantasía</label>
            <input name="nombreFantasia" value={form.nombreFantasia} onChange={handle} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Industria</label>
            <select name="industria" value={form.industria} onChange={handle} className={inputClass}>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Región</label>
            <select name="region" value={form.region} onChange={handle} className={inputClass}>
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Descripción (Teaser)</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle} className={inputClass + " resize-none"} rows={4} required />
          </div>
          <div>
            <label className={labelClass}>Revenue (USD miles)</label>
            <input type="number" name="revenue" value={form.revenue} onChange={handle} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>EBITDA (USD miles)</label>
            <input type="number" name="ebitda" value={form.ebitda} onChange={handle} className={inputClass} required />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Precio de Venta Deseado (USD miles)</label>
            <input type="number" name="askingPrice" value={form.askingPrice} onChange={handle} className={inputClass} required />
          </div>
        </div>
        <div className="flex gap-3 mt-4 pt-4 border-t border-border-subtle">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
          <button type="submit" className="btn-primary flex-1">Guardar Cambios</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── BUYER ───────────────────────────────────────────────────
function BuyerDashboard({ userId }: { userId: string }) {
  const [signedDeals, setSignedDeals] = useState<{ nda: NDARecord; deal: Deal | null }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    
    // Load NDAs and resolve deals
    import('../lib/firestore').then(({ getUserNDAs, getDeal }) => {
      getUserNDAs(userId).then(async ndas => {
        const resolved = await Promise.all(ndas.map(async nda => ({
          nda, deal: await getDeal(nda.dealId)
        })));
        setSignedDeals(resolved);
      });
    });
  }, [userId]);

  return (
    <div className="flex flex-col gap-8">
      <div className="border border-border-strong bg-paper p-8">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-6">Mis NDAs y Accesos</h3>
        {signedDeals.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border-strong bg-paper-deep">
            <div className="w-16 h-16 bg-white border border-border-subtle rounded-full flex items-center justify-center shadow-sm mb-5 text-2xl">
              🔍
            </div>
            <h4 className="font-serif text-[22px] font-bold text-ink mb-2">No tenés NDAs firmados aún</h4>
            <p className="text-[13px] text-ink-soft max-w-sm mb-6 leading-relaxed">
              Explorá el mercado para encontrar oportunidades de inversión que se ajusten a tus criterios. Firmá tu primer NDA para acceder al Data Room confidencial.
            </p>
            <button onClick={() => navigate('/mercado')} className="btn-primary">
              Explorar el Mercado →
            </button>
          </div>
        ) : signedDeals.map(({ nda, deal }) => (
          <div key={nda.id} className="flex items-center justify-between p-4 mb-2 border border-border-subtle hover:bg-paper-mid">
            <div>
              <div className="font-medium text-ink">{deal?.nombreFantasia ?? nda.dealId}</div>
              <div className="font-mono text-[10px] text-ink-mute">{deal?.industria} · {deal?.region}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono px-2 py-0.5 border ${nda.status === 'signed' ? 'border-accent/30 text-accent bg-accent-light' : 'border-amber-400/40 text-amber-600 bg-amber-50'}`}>
                {nda.status === 'signed' ? '✓ Firmado' : 'Pendiente'}
              </span>
              {deal && <button onClick={() => navigate(`/deal/${deal.id}`)} className="text-[10px] font-mono text-accent hover:underline">Ver →</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN ───────────────────────────────────────────────────
function AdminDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => { getAllDeals().then(setDeals).finally(() => setLoading(false)); }, []);

  const handleStatusChange = async (dealId: string, status: Deal['status']) => {
    await updateDealStatus(dealId, status);
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status } : d));
    showToast(`Deal ${dealId} → ${STATUS_LABELS[status]}`);
  };

  const pending = deals.filter(d => d.status === 'under_review');
  const active = deals.filter(d => !['under_review','draft'].includes(d.status));

  return (
    <div className="flex flex-col gap-8">
      {/* GLOBAL KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-strong border border-border-strong shadow-xl">
        {[
          { label: 'Total Deals', value: deals.length },
          { label: 'Pendientes Revisión', value: pending.length },
          { label: 'Publicados', value: deals.filter(d => d.status === 'published').length },
          { label: 'En Proceso', value: deals.filter(d => ['nda_phase','loi_received','closing'].includes(d.status)).length },
        ].map(k => (
          <div key={k.label} className="bg-paper p-6">
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-mute mb-2">{k.label}</div>
            <div className="font-serif text-[32px] font-bold text-ink">{k.value}</div>
          </div>
        ))}
      </div>

      {/* PENDING REVIEW */}
      {pending.length > 0 && (
        <div className="border border-amber-400/40 bg-amber-50/30 p-8">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-amber-700 mb-6">⚠ Pendientes de Aprobación ({pending.length})</h3>
          {pending.map(d => (
            <div key={d.id} className="flex items-center justify-between p-4 mb-2 bg-white border border-border-subtle">
              <div>
                <div className="font-medium text-ink">{d.nombreFantasia}</div>
                <div className="font-mono text-[10px] text-ink-mute">{d.id} · {d.industria} · {d.region}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleStatusChange(d.id, 'published')}
                  className="flex items-center gap-1 text-[10px] font-medium px-3 py-1.5 bg-accent text-white hover:bg-accent/90 transition-colors">
                  <Check size={12} /> Publicar
                </button>
                <button onClick={() => navigate(`/deal/${d.id}`)}
                  className="flex items-center gap-1 text-[10px] font-medium px-3 py-1.5 border border-border-strong text-ink-soft hover:bg-paper-mid transition-colors">
                  <Eye size={12} /> Revisar
                </button>
                <button onClick={() => handleStatusChange(d.id, 'draft')}
                  className="flex items-center gap-1 text-[10px] font-medium px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                  <X size={12} /> Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ALL DEALS */}
      <div className="border border-border-strong bg-paper p-8">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-6">Todos los Deals</h3>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border-strong">
              {['ID', 'Empresa', 'Industria', 'Asking', 'Estado', 'Views', 'NDAs', 'Acciones'].map(h => (
                <th key={h} className="text-left py-2.5 px-2 font-mono text-[9px] tracking-widest text-ink-mute">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deals.map(d => (
              <tr key={d.id} className="border-b border-border-subtle hover:bg-paper-mid">
                <td className="py-2.5 px-2 font-mono text-ink">{d.id}</td>
                <td className="py-2.5 px-2 text-ink font-medium">{d.nombreFantasia}</td>
                <td className="py-2.5 px-2 text-ink-soft">{d.industria}</td>
                <td className="py-2.5 px-2 font-mono">USD {(d.askingPrice/1e6).toFixed(1)}M</td>
                <td className="py-2.5 px-2">
                  <select value={d.status} onChange={e => handleStatusChange(d.id, e.target.value as Deal['status'])}
                    className="text-[10px] font-mono border border-border-strong bg-paper text-ink px-1 py-0.5">
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td className="py-2.5 px-2 font-mono text-ink-mute">{d.viewCount ?? 0}</td>
                <td className="py-2.5 px-2 font-mono text-ink-mute">{d.ndaSigned ?? 0}/{d.ndaRequests ?? 0}</td>
                <td className="py-2.5 px-2">
                  <button onClick={() => navigate(`/deal/${d.id}`)} className="text-accent text-[10px] font-mono hover:underline">Ver →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
