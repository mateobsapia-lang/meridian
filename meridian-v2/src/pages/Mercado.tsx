import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { getPublishedDeals } from '../lib/firestore';
import { defaultMatchScore, calculateMatchScore } from '../lib/matching';
import type { Deal } from '../types';

const INDUSTRIES = ['Todas', 'SaaS / Tech', 'Agro', 'Manufactura', 'Servicios', 'Retail', 'Salud'];

const STATUS_LABEL: Record<string, string> = {
  published: 'Activo',
  nda_phase: 'En NDA',
  loi_received: 'IOI Recibido',
  closing: 'En Cierre',
  closed: 'Cerrado',
};

const STATUS_COLOR: Record<string, string> = {
  published: 'bg-[#4ade80]',
  nda_phase: 'bg-gold',
  loi_received: 'bg-accent',
  closing: 'bg-amber-400',
  closed: 'bg-ink-mute',
};

export function Mercado() {
  const { user, showToast, openNdaModal } = useAppContext();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todas');
  const [sortBy, setSortBy] = useState<'match' | 'asking' | 'ebitda' | 'crecimiento'>('match');
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => setTime('Actualizado · ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getPublishedDeals()
      .then(setDeals)
      .catch(() => showToast('Error al cargar el mercado'))
      .finally(() => setLoading(false));
  }, []);

  const getScore = (deal: Deal) =>
    user?.buyerProfile ? calculateMatchScore(deal, user.buyerProfile) : defaultMatchScore(deal);

  const filtered = deals
    .filter(d => filter === 'Todas' || d.industria.includes(filter))
    .sort((a, b) => {
      if (sortBy === 'match') return getScore(b) - getScore(a);
      if (sortBy === 'asking') return b.askingPrice - a.askingPrice;
      if (sortBy === 'ebitda') return b.ebitda - a.ebitda;
      if (sortBy === 'crecimiento') return b.crecimiento - a.crecimiento;
      return 0;
    });

  const fmtUSD = (n: number) => `USD ${(n / 1_000_000).toFixed(1)}M`;

  return (
    <div className="animate-in fade-in duration-500 bg-paper-deep min-h-screen pb-20">
      <section className="pt-10 md:pt-16 pb-6">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-accent mb-2">Mercado primario</div>
              <h2 className="font-serif text-[28px] sm:text-[32px] md:text-[40px] font-bold text-ink tracking-[-0.02em]">Cotizaciones del día</h2>
            </div>
            <div className="font-mono text-[10px] text-ink-mute">{time}</div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="bg-paper-deep border-y border-border-strong py-3">
        <div className="container-custom">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[9px] font-medium tracking-[0.14em] uppercase text-ink-mute">Industria</span>
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => setFilter(ind)}
                className={`text-[10px] font-medium py-1.5 px-3.5 border transition-all duration-150 tracking-[0.04em] ${
                  filter === ind ? 'bg-ink text-paper border-ink' : 'border-border-strong bg-paper text-ink-soft hover:bg-ink hover:text-paper hover:border-ink'
                }`}>
                {ind}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[9px] font-mono text-ink-mute">Ordenar por:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="text-[10px] font-mono border border-border-strong bg-paper text-ink px-2 py-1">
                <option value="match">Match %</option>
                <option value="asking">Asking Price</option>
                <option value="ebitda">EBITDA</option>
                <option value="crecimiento">Crecimiento</option>
              </select>
              <span className="font-mono text-[10px] text-ink-mute">{filtered.length} resultados</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="container-custom mt-6 overflow-x-auto">
        {/* CARDS — mobile */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3 md:hidden mb-6">
            {filtered.map(d => {
              const score = getScore(d);
              const margin = ((d.ebitda / d.revenue) * 100).toFixed(0);
              return (
                <div key={d.id} onClick={() => navigate(`/deal/${d.id}`)}
                  className="bg-paper border border-border-strong p-5 cursor-pointer hover:border-accent transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[9px] font-medium tracking-widest uppercase border border-border-strong px-2 py-0.5 text-ink-soft">{d.industria}</span>
                    <span className="font-mono text-[10px] bg-accent-light text-accent border border-accent/20 px-2 py-0.5">{score}%</span>
                  </div>
                  <div className="font-serif text-[20px] font-bold text-ink mb-1">{margin}% EBITDA</div>
                  <div className="text-[12px] text-ink-soft mb-3">{d.region} · {d.id}</div>
                  <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-3">
                    <div>
                      <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-0.5">Revenue</div>
                      <div className="font-mono text-[13px] font-medium text-ink">{fmtUSD(d.revenue)}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-0.5">Asking</div>
                      <div className="font-mono text-[13px] font-medium text-accent">{fmtUSD(d.askingPrice)}</div>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); openNdaModal(d.id); }}
                    className="mt-3 text-[10px] font-mono text-accent hover:underline">
                    Ver teaser →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE — desktop only */}
        <div className="hidden md:block">
        {loading ? (
          <div className="py-24 text-center">
            <div className="font-mono text-[11px] text-ink-mute tracking-widest animate-pulse">CARGANDO MERCADO...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center border border-border-strong bg-paper">
            <div className="font-serif text-[22px] text-ink mb-2">Sin resultados</div>
            <div className="text-ink-mute text-sm">No hay deals publicados en esta categoría aún.</div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0"><table className="w-full border-collapse border border-border-strong min-w-[700px] sm:min-w-[1000px] bg-paper">
            <thead>
              <tr>
                {['ID Deal','Industria','Región','Revenue','EBITDA','Margen','Crec.','Múltiplo','Asking','Match','Estado',''].map(h => (
                  <th key={h} className="text-[9px] font-medium tracking-[0.14em] uppercase text-ink-mute text-left py-2.5 px-3.5 border-b border-border-strong whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const score = getScore(d);
                const margin = ((d.ebitda / d.revenue) * 100).toFixed(0);
                const multiple = d.multiple ?? (d.askingPrice / d.ebitda).toFixed(1);
                return (
                  <tr key={d.id} className="hover:bg-paper-mid transition-colors group cursor-pointer" onClick={() => navigate(`/deal/${d.id}`)}>
                    <td className="text-[11px] font-mono py-3 px-3.5 border-b border-border-subtle text-ink">{d.id}</td>
                    <td className="py-3 px-3.5 border-b border-border-subtle">
                      <span className="inline-block text-[9px] font-medium tracking-[0.08em] uppercase py-0.5 px-2 border border-border-strong text-ink-soft">{d.industria}</span>
                    </td>
                    <td className="text-[12px] py-3 px-3.5 border-b border-border-subtle text-ink">{d.region}</td>
                    <td className="text-[11px] font-mono text-right py-3 px-3.5 border-b border-border-subtle text-ink">{fmtUSD(d.revenue)}</td>
                    <td className="text-[11px] font-mono text-right py-3 px-3.5 border-b border-border-subtle text-ink">{fmtUSD(d.ebitda)}</td>
                    <td className="text-[11px] font-mono text-right py-3 px-3.5 border-b border-border-subtle text-ink">{margin}%</td>
                    <td className={`text-[11px] font-mono text-right py-3 px-3.5 border-b border-border-subtle ${d.crecimiento > 20 ? 'text-[#16a34a]' : 'text-ink'}`}>
                      +{d.crecimiento}%
                    </td>
                    <td className="text-[11px] font-mono text-right py-3 px-3.5 border-b border-border-subtle text-ink">{multiple}×</td>
                    <td className="text-[11px] font-mono font-medium text-right py-3 px-3.5 border-b border-border-subtle text-ink">{fmtUSD(d.askingPrice)}</td>
                    <td className="py-3 px-3.5 border-b border-border-subtle">
                      <span className="inline-block font-mono text-[10px] font-medium py-0.5 px-2 bg-accent-light text-accent border border-accent/20">{score}%</span>
                    </td>
                    <td className="text-[12px] py-3 px-3.5 border-b border-border-subtle">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-[7px] h-[7px] rounded-full inline-block ${STATUS_COLOR[d.status] ?? 'bg-ink-mute'}`}></span>
                        {STATUS_LABEL[d.status] ?? d.status}
                      </div>
                    </td>
                    <td className="text-right py-3 px-3.5 border-b border-border-subtle" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openNdaModal(d.id)}
                        className="text-[9px] font-medium tracking-[0.1em] uppercase text-accent hover:underline whitespace-nowrap">
                        Ver Teaser →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
        </div>
      </div>
    </div>
  );
}
