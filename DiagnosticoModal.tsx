import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { BuyerProfile } from '../types';

const TIPOS = ['Family Office','Fondo de Private Equity','Adquirente Estratégico','Inversor Individual Calificado'];
const INDUSTRIAS = ['SaaS / Tech','Agro','Salud','Manufactura','Logística','Retail','Servicios B2B','Energía'];
const REGIONES = ['CABA','Buenos Aires','Córdoba','Santa Fe','Mendoza','Interior del país','Cualquier región'];
const TICKETS = [
  { label:'USD 500K – 1M', min:500000, max:1000000 },
  { label:'USD 1M – 2M', min:1000000, max:2000000 },
  { label:'USD 2M – 5M', min:2000000, max:5000000 },
  { label:'USD 5M – 10M', min:5000000, max:10000000 },
  { label:'USD 10M+', min:10000000, max:50000000 },
];

export function BuyerWizard() {
  const { isBuyerWizardOpen, setBuyerWizardOpen, user, showToast, login } = useAppContext();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre:'', email:'', organizacion:'', tipoAdquirente:TIPOS[0],
    ticketIdx:2, industrias:[] as string[], regiones:[] as string[],
    estructura:'any' as BuyerProfile['structure'],
    pepDeclarado:false, fondosDeclarados:false,
  });

  const toggle = (field:'industrias'|'regiones', val:string) =>
    setForm(p => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter((x:string)=>x!==val) : [...p[field], val],
    }));

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ticket = TICKETS[form.ticketIdx];
      const profile: BuyerProfile = {
        ticketMin: ticket.min, ticketMax: ticket.max,
        industries: form.industrias, regions: form.regiones,
        structure: form.estructura,
        tipoAdquirente: form.tipoAdquirente,
        organizacion: form.organizacion,
      };

      if (user) {
        // Usuario ya logueado — actualizar perfil
        await updateDoc(doc(db,'users',user.uid), {
          role:'buyer', buyerProfile: profile, updatedAt: serverTimestamp(),
        });
        login({ ...user, role:'buyer', buyerProfile: profile });
        showToast('Perfil de comprador guardado');
      } else {
        // Sin login — guardar lead en leads_buyers
        await setDoc(doc(db,'leads_buyers', Date.now().toString()), {
          nombre: form.nombre, email: form.email,
          organizacion: form.organizacion, tipoAdquirente: form.tipoAdquirente,
          buyerProfile: profile, createdAt: serverTimestamp(),
        });
        showToast('Solicitud recibida — te contactamos en 24hs');
      }

      setBuyerWizardOpen(false);
      setTimeout(reset, 300);
    } catch {
      showToast('Error al guardar. Intentá de nuevo.');
    } finally { setSaving(false); }
  };

  const reset = () => {
    setStep(1);
    setForm({ nombre:'', email:'', organizacion:'', tipoAdquirente:TIPOS[0],
      ticketIdx:2, industrias:[], regiones:[], estructura:'any',
      pepDeclarado:false, fondosDeclarados:false });
  };
  const close = () => { setBuyerWizardOpen(false); setTimeout(reset,300); };

  const ic = 'w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent transition-colors';
  const lc = 'block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5';

  return (
    <Modal isOpen={isBuyerWizardOpen} onClose={close} title="Registro de Comprador" maxWidth="max-w-[580px]">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex gap-1.5 mb-2">
          {[1,2,3].map(s=>(
            <div key={s} className={`flex-1 h-1 transition-colors ${s<=step?'bg-accent':'bg-border-strong'}`}/>
          ))}
        </div>
        <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-ink-mute">
          {['Perfil','Tesis de Inversión','Cumplimiento KYC'].map((l,i)=>(
            <span key={l} className={i+1===step?'text-accent':''}>{l}</span>
          ))}
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={e=>{e.preventDefault();setStep(2);}} className="flex flex-col gap-4">
          <h3 className="font-serif text-[18px] font-medium text-ink mb-1">1. Tu perfil institucional</h3>
          <div className="grid grid-cols-2 gap-4">
            {!user && <>
              <div>
                <label className={lc}>Nombre completo</label>
                <input className={ic} required value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} placeholder="Juan García"/>
              </div>
              <div>
                <label className={lc}>Email corporativo</label>
                <input type="email" className={ic} required value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="juan@fondo.com"/>
              </div>
            </>}
            <div>
              <label className={lc}>Tipo de adquirente</label>
              <select className={ic} value={form.tipoAdquirente} onChange={e=>setForm(p=>({...p,tipoAdquirente:e.target.value}))}>
                {TIPOS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Institución / organización</label>
              <input className={ic} required={!user} value={form.organizacion} onChange={e=>setForm(p=>({...p,organizacion:e.target.value}))} placeholder="Fondo XYZ / Family Office"/>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="btn-primary">Siguiente →</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={e=>{e.preventDefault();setStep(3);}} className="flex flex-col gap-5">
          <h3 className="font-serif text-[18px] font-medium text-ink mb-1">2. Tesis de inversión</h3>

          <div>
            <label className={lc}>Ticket objetivo</label>
            <div className="flex flex-col gap-1.5">
              {TICKETS.map((t,i)=>(
                <button type="button" key={t.label} onClick={()=>setForm(p=>({...p,ticketIdx:i}))}
                  className={`text-left px-4 py-2.5 border text-[12px] transition-all ${form.ticketIdx===i?'border-accent bg-accent-light text-accent font-medium':'border-border-strong text-ink-soft hover:border-accent/50'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={lc}>Industrias de interés (seleccioná todas)</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIAS.map(ind=>(
                <button type="button" key={ind} onClick={()=>toggle('industrias',ind)}
                  className={`text-[10px] px-3 py-1.5 border transition-all ${form.industrias.includes(ind)?'border-accent bg-accent-light text-accent':'border-border-strong text-ink-soft hover:border-accent/50'}`}>
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={lc}>Estructura preferida</label>
            <div className="grid grid-cols-3 gap-2">
              {([['majority','Mayoría'],['minority','Minoría'],['any','Indiferente']] as const).map(([v,l])=>(
                <button type="button" key={v} onClick={()=>setForm(p=>({...p,estructura:v}))}
                  className={`py-2.5 border text-[11px] transition-all ${form.estructura===v?'border-accent bg-accent-light text-accent font-medium':'border-border-strong text-ink-soft'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button type="button" onClick={()=>setStep(1)} className="btn-ghost">← Atrás</button>
            <button type="submit" className="btn-primary">Siguiente →</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleFinish} className="flex flex-col gap-5">
          <h3 className="font-serif text-[18px] font-medium text-ink mb-1">3. Cumplimiento normativo KYC/AML</h3>
          <div className="bg-paper-deep border border-border-strong p-4 text-[11px] text-ink-mute font-mono leading-relaxed">
            Como Sujeto Obligado ante la UIF (Res. 30/2017), requerimos validación legal antes de proveer acceso al Data Room de cualquier deal.
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer bg-paper-deep p-4 border border-border-subtle">
              <input type="checkbox" required checked={form.fondosDeclarados} onChange={e=>setForm(p=>({...p,fondosDeclarados:e.target.checked}))} className="mt-0.5 accent-accent"/>
              <span className="text-[12px] text-ink-soft">Declaro bajo juramento la licitud del origen de los fondos a ser utilizados en cualquier transacción.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer bg-paper-deep p-4 border border-border-subtle">
              <input type="checkbox" required checked={form.pepDeclarado} onChange={e=>setForm(p=>({...p,pepDeclarado:e.target.checked}))} className="mt-0.5 accent-accent"/>
              <span className="text-[12px] text-ink-soft">Declaro mi condición de Persona Expuesta Políticamente (PEP) conforme a la normativa vigente de la UIF.</span>
            </label>
          </div>

          {/* Resumen */}
          <div className="border border-border-strong p-4 text-[12px] flex flex-col gap-1.5">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Resumen de tu perfil</div>
            <div className="flex justify-between"><span className="text-ink-mute">Tipo</span><span className="text-ink">{form.tipoAdquirente}</span></div>
            <div className="flex justify-between"><span className="text-ink-mute">Ticket</span><span className="text-ink">{TICKETS[form.ticketIdx].label}</span></div>
            {form.industrias.length > 0 && <div className="flex justify-between"><span className="text-ink-mute">Industrias</span><span className="text-ink text-right">{form.industrias.join(', ')}</span></div>}
            <div className="flex justify-between"><span className="text-ink-mute">Estructura</span><span className="text-ink">{{majority:'Mayoría',minority:'Minoría',any:'Indiferente'}[form.estructura]}</span></div>
          </div>

          <div className="flex justify-between pt-2">
            <button type="button" onClick={()=>setStep(2)} className="btn-ghost">← Atrás</button>
            <button type="submit" disabled={saving} className="btn-accent disabled:opacity-50">
              {saving ? 'Guardando...' : 'Completar registro →'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
