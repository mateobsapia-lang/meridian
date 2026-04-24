import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { getDeal, hasSignedNDA, logAction, incrementDealMetric, getDealDocuments, getDealAuditLog } from '../lib/firestore';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, Eye, FileText, Download, Clock } from 'lucide-react';
import type { Deal, DealDocument, AuditLog } from '../types';

export function DealView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, openNdaModal } = useAppContext();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'dataroom' | 'audit'>('overview');

  const isOwner = user && deal && user.uid === deal.ownerId;
  const isAdmin = user?.role === 'admin';
  const canSeeFullInfo = ndaSigned || isOwner || isAdmin;

  useEffect(() => {
    if (!id) return;
    getDeal(id).then(d => {
      if (!d) { navigate('/mercado'); return; }
      setDeal(d);
      // Log teaser view
      logAction(id, 'view_teaser');
      incrementDealMetric(id, 'viewCount').catch(() => {});
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    hasSignedNDA(id, user.uid).then(setNdaSigned);
  }, [id, user]);

  useEffect(() => {
    if (!id || !canSeeFullInfo) return;
    getDealDocuments(id).then(setDocuments);
    if (isOwner || isAdmin) getDealAuditLog(id).then(setAuditLog);
    logAction(id, 'view_dataroom');
    incrementDealMetric(id, 'dataRoomAccess').catch(() => {});
  }, [id, canSeeFullInfo]);

  const fmtUSD = (n: number) => `USD ${(n / 1_000_000).toFixed(2)}M`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="font-mono text-[11px] text-ink-mute tracking-widest animate-pulse">CARGANDO DEAL...</div>
    </div>
  );

  if (!deal) return null;

  const margin = ((deal.ebitda / deal.revenue) * 100).toFixed(1);
  const multiple = deal.multiple ?? (deal.askingPrice / deal.ebitda).toFixed(1);

  // Mock chart data from real financials
  const chartData = [
    { year: '2022', rev: deal.revenue * 0.56, ebitda: deal.ebitda * 0.44 },
    { year: '2023', rev: deal.revenue * 0.76, ebitda: deal.ebitda * 0.63 },
    { year: '2024', rev: deal.revenue, ebitda: deal.ebitda },
  ];

  return (
    <div className="animate-in fade-in duration-500 bg-paper min-h-screen pb-24">
      {/* HEADER */}
      <div className="bg-ink text-white pt-16 pb-20 px-8 border-b-4 border-accent">
        <div className="container-custom">
          <button onClick={() => navigate('/mercado')} className="font-mono text-[10px] text-white/50 hover:text-white mb-6 inline-flex items-center gap-1 transition-colors">
            ← Volver al Mercado
          </button>
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="font-mono text-[9px] tracking-[0.14em] text-accent mb-3">{deal.id} · {deal.industria}</div>
              <h1 className="font-serif text-[36px] md:text-[52px] font-bold leading-tight tracking-[-0.02em]">
                {canSeeFullInfo ? deal.nombreFantasia : (
                  <span className="flex items-center gap-3">
                    <Lock size={28} className="text-white/40" />
                    <span className="blur-sm select-none">Empresa Confidencial</span>
                  </span>
                )}
              </h1>
              <p className="text-white/60 mt-3 text-[15px] max-w-xl">{deal.descripcion}</p>
            </div>
            <div className="hidden md:flex flex-col gap-3 text-right shrink-0">
              <div className="font-mono text-[9px] text-white/40 tracking-widest">ASKING PRICE</div>
              <div className="font-serif text-[40px] font-bold text-white">{fmtUSD(deal.askingPrice)}</div>
              <div className="font-mono text-[11px] text-accent">{multiple}× EBITDA</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom -mt-10">
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-strong border border-border-strong shadow-xl mb-8">
          {[
            { label: 'Revenue (LTM)', value: fmtUSD(deal.revenue) },
            { label: 'EBITDA', value: fmtUSD(deal.ebitda) },
            { label: 'Margen EBITDA', value: `${margin}%` },
            { label: 'Crecimiento', value: `+${deal.crecimiento}%` },
          ].map(kpi => (
            <div key={kpi.label} className="bg-paper p-6">
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-mute mb-2">{kpi.label}</div>
              <div className="font-serif text-[24px] font-bold text-ink">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="border-b border-border-strong mb-8">
          <div className="flex gap-0">
            {(['overview', 'financials', 'dataroom', ...(isOwner || isAdmin ? ['audit'] : [])] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-mono text-[10px] uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-ink-mute hover:text-ink'
                }`}>
                {tab === 'overview' ? 'Descripción' : tab === 'financials' ? 'Financieros' : tab === 'dataroom' ? 'Data Room' : 'Audit Trail'}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-border-strong bg-paper p-8">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-6">Highlights</h3>
              <ul className="flex flex-col gap-4">
                {(deal.highlights ?? ['Sin highlights disponibles']).map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-ink leading-relaxed">
                    <span className="text-accent mt-1 shrink-0">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-border-strong bg-paper p-8">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-6">Información Confidencial</h3>
              {canSeeFullInfo ? (
                <div className="flex flex-col gap-3 text-[13px]">
                  <div className="flex justify-between border-b border-border-subtle pb-2">
                    <span className="text-ink-mute">CUIT</span><span className="font-mono">{deal.cuit}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-subtle pb-2">
                    <span className="text-ink-mute">Tipo Societario</span><span>{deal.tipoSocietario}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-subtle pb-2">
                    <span className="text-ink-mute">Jurisdicción</span><span>{deal.jurisdiccion}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-subtle pb-2">
                    <span className="text-ink-mute">Representante</span><span>{deal.representante}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-subtle pb-2">
                    <span className="text-ink-mute">Contacto</span><span>{deal.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-mute">Deuda Total</span><span className="font-mono">{fmtUSD(deal.deuda)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <Lock size={32} className="text-ink-mute" />
                  <p className="text-ink-soft text-center text-sm">Firmá el NDA para acceder a información confidencial, contacto y documentos.</p>
                  <button onClick={() => openNdaModal(deal.id)} className="btn-primary mt-2">Solicitar Acceso NDA</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="border border-border-strong bg-paper p-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-8">Evolución Financiera</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f6e56" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0f6e56" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => `USD ${(v/1e6).toFixed(2)}M`} />
                <Area type="monotone" dataKey="rev" stroke="#0f6e56" fill="url(#rev)" name="Revenue" />
                <Area type="monotone" dataKey="ebitda" stroke="#f59e0b" fill="none" name="EBITDA" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'dataroom' && (
          <div className="border border-border-strong bg-paper p-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-6">Data Room</h3>
            {!canSeeFullInfo ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <Lock size={40} className="text-ink-mute" />
                <p className="text-ink-soft">Acceso restringido. Firmá el NDA para ver los documentos.</p>
                <button onClick={() => openNdaModal(deal.id)} className="btn-primary">Solicitar NDA</button>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-2">
                <FileText size={32} className="text-ink-mute" />
                <p className="text-ink-soft text-sm">No hay documentos cargados aún.</p>
                {(isOwner || isAdmin) && (
                  <p className="text-ink-mute text-xs mt-2">Usá el dashboard para subir documentos al data room.</p>
                )}
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {documents.map(doc => (
                  <li key={doc.id} className="flex items-center justify-between p-4 border border-border-subtle hover:bg-paper-mid transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-accent" />
                      <span className="text-[13px] text-ink">{doc.name}</span>
                    </div>
                    <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer"
                      onClick={() => logAction(deal.id, 'download_doc', { docName: doc.name })}
                      className="flex items-center gap-1.5 text-[11px] text-accent hover:underline font-mono">
                      <Download size={13} /> Descargar
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'audit' && (isOwner || isAdmin) && (
          <div className="border border-border-strong bg-paper p-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-6">Audit Trail de Accesos</h3>
            {auditLog.length === 0 ? (
              <p className="text-ink-mute text-sm">No hay registros de acceso aún.</p>
            ) : (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border-strong">
                    <th className="text-left py-2 text-ink-mute font-mono text-[9px] tracking-widest">USUARIO</th>
                    <th className="text-left py-2 text-ink-mute font-mono text-[9px] tracking-widest">ACCIÓN</th>
                    <th className="text-left py-2 text-ink-mute font-mono text-[9px] tracking-widest">FECHA</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map(log => (
                    <tr key={log.id} className="border-b border-border-subtle">
                      <td className="py-2.5 font-mono text-ink">{log.userEmail}</td>
                      <td className="py-2.5 text-ink-soft">{log.action.replace('_', ' ')}</td>
                      <td className="py-2.5 text-ink-mute">
                        {log.createdAt?.toDate?.()?.toLocaleString('es-AR') ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
