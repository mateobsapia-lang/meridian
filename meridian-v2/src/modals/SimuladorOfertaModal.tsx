import { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { saveSimuladorLead, countMatchingDeals } from '../lib/firestore';

const INDUSTRIAS = ['SaaS / Tech','Agro','Manufactura','Servicios','Retail','Salud','Logística','Construcción'];
const REGIONES = ['CABA','Buenos Aires','Córdoba','Santa Fe','Mendoza','Entre Ríos','Interior'];
const TICKETS = [
  { label:'USD 500K – 1M', min:500000, max:1000000 },
  { label:'USD 1M – 2M', min:1000000, max:2000000 },
  { label:'USD 2M – 5M', min:2000000, max:5000000 },
  { label:'USD 5M – 10M', min:5000000, max:10000000 },
  { label:'USD 10M+', min:10000000, max:50000000 },
];

type Paso = 'criterios' | 'email' | 'resultado';

export function SimuladorOfertaModal() {
  const { isSimuladorOpen, setSimuladorOpen, showToast, setBuyerWizardOpen } = useAppContext();
  const [paso, setPaso] = useState<Paso>('criterios');
  const [indSel, setIndSel] = useState<string[]>([]);
  const [regSel, setRegSel] = useState<string[]>([]);
  const [ticketIdx, setTicketIdx] = useState(2);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(0);

  const ticket = TICKETS[ticketIdx];
  const toggle = (arr:string[], setArr:(a:string[])=>void, val:string) =>
    setArr(arr.includes(val) ? arr.filter(x=>x!==val) : [...arr,val]);

  const reset = () => { setPaso('criterios'); setIndSel([]); setRegSel([]); setTicketIdx(2); setEmail(''); setNombre(''); setMatches(0); };

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const count = await countMatchingDeals(indSel, ticket.min, ticket.max);
      setMatches(count);
      await saveSimuladorLead({
        email, nombre, industrias:indSel, regions:regSel,
        ticketMin:ticket.min, ticketMax:ticket.max, dealsMatch:count,
      });
      setPaso('resultado');
    } catch { showToast('Error. Intentá de nuevo.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isSimuladorOpen} onClose={()=>{ setSimuladorOpen(false); setTimeout(reset,300); }}
      title="Simulador de Oportunidades" maxWidth="max-w-[520px]">

      {paso === 'criterios' && (
        <div className="flex flex-col gap-5">
          <div className="bg-accent-light border border-accent/20 p-4 text-[12px] text-accent">
            🔍 Definí tu tesis de inversión y te mostramos cuántos deals activos matchean — y te avisamos cuando entre uno nuevo.
          </div>

          {/* Ticket */}
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-2">Ticket objetivo</label>
            <div className="grid grid-cols-1 gap-1.5">
              {TICKETS.map((t,i)=>(
                <button key={t.label} onClick={()=>setTicketIdx(i)}
                  className={`text-left px-4 py-2.5 border text-[12px] transition-all ${i===ticketIdx?'border-accent bg-accent-light text-accent font-medium':'border-border-strong text-ink-soft hover:border-accent/50'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Industrias */}
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-2">Industrias de interés <span className="text-ink-mute normal-case">(seleccioná todas)</span></label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIAS.map(ind=>(
                <button key={ind} onClick={()=>toggle(indSel,setIndSel,ind)}
                  className={`text-[10px] px-3 py-1.5 border transition-all ${indSel.includes(ind)?'border-accent bg-accent-light text-accent':'border-border-strong text-ink-soft hover:border-accent/50'}`}>
                  {ind}
                </button>
              ))}
            </div>
            {indSel.length === 0 && <p className="text-[10px] text-ink-mute mt-1">Sin selección = todas las industrias</p>}
          </div>

          {/* Regiones */}
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-2">Regiones <span className="text-ink-mute normal-case">(opcional)</span></label>
            <div className="flex flex-wrap gap-2">
              {REGIONES.map(r=>(
                <button key={r} onClick={()=>toggle(regSel,setRegSel,r)}
                  className={`text-[10px] px-3 py-1.5 border transition-all ${regSel.includes(r)?'border-accent bg-accent-light text-accent':'border-border-strong text-ink-soft hover:border-accent/50'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button onClick={()=>setPaso('email')} className="btn-primary w-full">Ver oportunidades →</button>
        </div>
      )}

      {paso === 'email' && (
        <div className="flex flex-col gap-5">
          <div className="bg-paper-deep border border-border-strong p-5">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Tu búsqueda</div>
            <div className="text-[13px] text-ink"><strong>Ticket:</strong> {ticket.label}</div>
            {indSel.length > 0 && <div className="text-[13px] text-ink-soft mt-1"><strong>Industrias:</strong> {indSel.join(', ')}</div>}
            {regSel.length > 0 && <div className="text-[13px] text-ink-soft mt-1"><strong>Regiones:</strong> {regSel.join(', ')}</div>}
          </div>
          <p className="text-[13px] text-ink-soft">Ingresá tu email para ver el resultado y recibir alertas cuando entre un nuevo deal que matchee.</p>
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent"
              placeholder="inversor@fondo.com"/>
          </div>
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5">Nombre (opcional)</label>
            <input type="text" value={nombre} onChange={e=>setNombre(e.target.value)}
              className="w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent"
              placeholder="Tu nombre"/>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setPaso('criterios')} className="btn-ghost flex-1">← Atrás</button>
            <button onClick={handleSubmit} disabled={!email || loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Buscando...
                </span>
              ) : 'Ver resultados →'}
            </button>
          </div>
        </div>
      )}

      {paso === 'resultado' && (
        <div className="flex flex-col gap-5">
          <div className={`p-8 text-center border ${matches > 0 ? 'bg-accent-light border-accent/30' : 'bg-paper-deep border-border-strong'}`}>
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Deals que matchean tu búsqueda</div>
            <div className={`font-serif text-[64px] font-bold ${matches > 0 ? 'text-accent' : 'text-ink-mute'}`}>{matches}</div>
            <div className="text-[13px] text-ink-soft mt-1">
              {matches > 0 ? 'oportunidades activas en el mercado' : 'deals activos con esos criterios ahora'}
            </div>
          </div>

          {matches > 0 ? (
            <div className="bg-ink text-white p-5 flex flex-col gap-3">
              <div className="font-serif text-[17px] font-bold">Accedé al mercado privado</div>
              <p className="text-[12px] text-white/60">Hay {matches} empresa{matches>1?'s':''} disponible{matches>1?'s':''} con tu ticket. Registrate como comprador para ver los teasers y solicitar NDA.</p>
              <button onClick={()=>{ setSimuladorOpen(false); setTimeout(reset,300); setBuyerWizardOpen(true); }}
                className="bg-accent text-white text-[10px] font-medium tracking-[0.15em] uppercase py-3 px-6 hover:bg-accent/90 transition-colors w-full">
                Registrarme como comprador →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="bg-amber-50 border border-amber-200 p-5">
                <div className="font-medium text-amber-800 mb-1">No hay deals con esos criterios ahora</div>
                <p className="text-[12px] text-amber-700">El mercado es dinámico. Te alertamos por email cuando entre un deal que matchee tu búsqueda.</p>
              </div>
              <button onClick={()=>{ setSimuladorOpen(false); setTimeout(reset,300); setBuyerWizardOpen(true); }}
                className="btn-primary w-full">
                Registrarme y recibir alertas →
              </button>
            </div>
          )}

          <p className="text-[10px] text-ink-mute text-center font-mono">Te notificaremos a {email} cuando entre un deal que matchee</p>
        </div>
      )}
    </Modal>
  );
}
