import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { motion } from 'motion/react';
import { createDeal } from '../lib/firestore';
import type { Deal } from '../types';

const INDUSTRIES = ['SaaS / Tech', 'Agro', 'Manufactura', 'Servicios', 'Retail', 'Salud', 'Construcción', 'Logística', 'Otro'];
const REGIONS = ['CABA', 'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Entre Ríos', 'Tucumán', 'Otro'];
const TIPOS = ['SRL', 'SA', 'SAS', 'Unipersonal', 'Otro'];

export function SellerWizard() {
  const { isSellerWizardOpen, setSellerWizardOpen, showToast, user, setLoginModalOpen } = useAppContext();
  const [step, setStep] = useState(1);
  const [dealId, setDealId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    nombreFantasia: '', cuit: '', industria: '', region: '', descripcion: '',
    revenue: '', ebitda: '', crecimiento: '', deuda: '', askingPrice: '',
    tipoSocietario: '', jurisdiccion: '', representante: '', telefono: '', email: '',
    h1: '', h2: '', h3: '',
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const reset = () => { setStep(1); setDealId(''); setForm({ nombreFantasia: '', cuit: '', industria: '', region: '', descripcion: '', revenue: '', ebitda: '', crecimiento: '', deuda: '', askingPrice: '', tipoSocietario: '', jurisdiccion: '', representante: '', telefono: '', email: '', h1: '', h2: '', h3: '' }); };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setSellerWizardOpen(false); setLoginModalOpen(true); return; }
    setIsSubmitting(true);
    try {
      const highlights = [form.h1, form.h2, form.h3].filter(Boolean);
      const id = await createDeal({
        status: 'under_review',
        ownerId: user.uid,
        nombreFantasia: form.nombreFantasia,
        cuit: form.cuit,
        industria: form.industria,
        region: form.region,
        descripcion: form.descripcion,
        revenue: Number(form.revenue) * 1000,
        ebitda: Number(form.ebitda) * 1000,
        crecimiento: Number(form.crecimiento),
        deuda: Number(form.deuda) * 1000,
        askingPrice: Number(form.askingPrice) * 1000,
        tipoSocietario: form.tipoSocietario,
        jurisdiccion: form.jurisdiccion,
        representante: form.representante,
        telefono: form.telefono,
        email: form.email,
        highlights,
      } as any);
      setDealId(id);
      setStep(5);
      showToast('Empresa enviada para revisión');
    } catch (err) {
      showToast('Error al enviar. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5";

  return (
    <Modal isOpen={isSellerWizardOpen} onClose={() => { setSellerWizardOpen(false); reset(); }} title="Listar mi Empresa">
      {/* Progress */}
      {step < 5 && (
        <div className="flex gap-1 mb-8">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-0.5 flex-1 transition-colors ${s <= step ? 'bg-accent' : 'bg-border-strong'}`} />
          ))}
        </div>
      )}

      {/* Step 1: Empresa */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
          <h3 className="font-serif text-[22px] font-bold text-ink">Información de la Empresa</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Nombre Fantasía *</label>
              <input name="nombreFantasia" value={form.nombreFantasia} onChange={handle} className={inputClass} placeholder="Ej: TechSolutions SRL" required />
            </div>
            <div>
              <label className={labelClass}>CUIT *</label>
              <input name="cuit" value={form.cuit} onChange={handle} className={inputClass} placeholder="20-12345678-9" required />
            </div>
            <div>
              <label className={labelClass}>Industria *</label>
              <select name="industria" value={form.industria} onChange={handle} className={inputClass} required>
                <option value="">Seleccionar...</option>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Región *</label>
              <select name="region" value={form.region} onChange={handle} className={inputClass} required>
                <option value="">Seleccionar...</option>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tipo Societario</label>
              <select name="tipoSocietario" value={form.tipoSocietario} onChange={handle} className={inputClass}>
                <option value="">Seleccionar...</option>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Descripción del negocio *</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handle} className={inputClass + " resize-none"} rows={3} placeholder="Descripción del negocio, propuesta de valor, mercado..." required />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Highlights (hasta 3)</label>
              <input name="h1" value={form.h1} onChange={handle} className={inputClass + " mb-2"} placeholder="Ej: 94% de ingresos recurrentes" />
              <input name="h2" value={form.h2} onChange={handle} className={inputClass + " mb-2"} placeholder="Ej: Equipo de 22 personas consolidado" />
              <input name="h3" value={form.h3} onChange={handle} className={inputClass} placeholder="Ej: Presencia en 3 países" />
            </div>
          </div>
          <button onClick={() => setStep(2)} className="btn-primary w-full mt-2" disabled={!form.nombreFantasia || !form.industria || !form.region}>
            Continuar →
          </button>
        </motion.div>
      )}

      {/* Step 2: Financieros */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
          <h3 className="font-serif text-[22px] font-bold text-ink">Información Financiera</h3>
          <p className="text-[12px] text-ink-mute">Todos los valores en USD miles (ej: si el revenue es USD 3.2M, escribí 3200)</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'revenue', label: 'Revenue LTM (USD miles) *', placeholder: '3200' },
              { name: 'ebitda', label: 'EBITDA LTM (USD miles) *', placeholder: '910' },
              { name: 'crecimiento', label: 'Crecimiento YoY (%)', placeholder: '35' },
              { name: 'deuda', label: 'Deuda Financiera (USD miles)', placeholder: '0' },
              { name: 'askingPrice', label: 'Precio de Venta Deseado (USD miles) *', placeholder: '7100' },
            ].map(f => (
              <div key={f.name} className={f.name === 'askingPrice' ? 'col-span-2' : ''}>
                <label className={labelClass}>{f.label}</label>
                <input type="number" name={f.name} value={(form as any)[f.name]} onChange={handle} className={inputClass} placeholder={f.placeholder} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Atrás</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1" disabled={!form.revenue || !form.ebitda || !form.askingPrice}>
              Continuar →
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Legal / Contacto */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
          <h3 className="font-serif text-[22px] font-bold text-ink">Datos Legales y Contacto</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Jurisdicción</label>
              <input name="jurisdiccion" value={form.jurisdiccion} onChange={handle} className={inputClass} placeholder="IGJ / Registro Córdoba..." />
            </div>
            <div>
              <label className={labelClass}>Representante Legal</label>
              <input name="representante" value={form.representante} onChange={handle} className={inputClass} placeholder="Nombre completo" />
            </div>
            <div>
              <label className={labelClass}>Teléfono de Contacto</label>
              <input name="telefono" value={form.telefono} onChange={handle} className={inputClass} placeholder="+54 11..." />
            </div>
            <div>
              <label className={labelClass}>Email de Contacto *</label>
              <input type="email" name="email" value={form.email} onChange={handle} className={inputClass} placeholder="contacto@empresa.com" required />
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setStep(2)} className="btn-ghost flex-1">← Atrás</button>
            <button onClick={() => setStep(4)} className="btn-primary flex-1">Revisar y Enviar →</button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Confirmación */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
          <h3 className="font-serif text-[22px] font-bold text-ink">Revisar y Enviar</h3>
          {!user && (
            <div className="bg-amber-50 border border-amber-300 p-4 text-[13px] text-amber-800">
              ⚠ Necesitás iniciar sesión para enviar. Al hacer click en "Enviar" serás redirigido al login.
            </div>
          )}
          <div className="border border-border-strong bg-paper-deep p-5 flex flex-col gap-3 text-[13px]">
            {[
              ['Empresa', form.nombreFantasia], ['CUIT', form.cuit],
              ['Industria', form.industria], ['Región', form.region],
              ['Revenue', `USD ${Number(form.revenue).toLocaleString()}K`],
              ['EBITDA', `USD ${Number(form.ebitda).toLocaleString()}K`],
              ['Asking Price', `USD ${Number(form.askingPrice).toLocaleString()}K`],
              ['Email', form.email],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between border-b border-border-subtle pb-2 last:border-none">
                <span className="text-ink-mute">{l}</span><span className="font-medium text-ink">{v || '—'}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-mute">Tu empresa será enviada a nuestro equipo de analistas para revisión. Recibirás respuesta en 2–5 días hábiles.</p>
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="btn-ghost flex-1">← Atrás</button>
            <button onClick={handleFinish} disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Enviando...' : 'Enviar para Revisión'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 5: Éxito */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center text-3xl">✓</div>
          <h3 className="font-serif text-[26px] font-bold text-ink">Empresa Enviada</h3>
          <p className="text-ink-mute text-[14px] max-w-sm">Tu empresa fue enviada exitosamente con ID <strong className="font-mono text-ink">{dealId}</strong>. Nuestros analistas la revisarán en 2–5 días hábiles.</p>
          <p className="text-[12px] text-ink-mute">Podés seguir el estado desde tu <strong>Dashboard</strong>.</p>
          <button onClick={() => { setSellerWizardOpen(false); reset(); }} className="btn-primary mt-2">Cerrar</button>
        </motion.div>
      )}
    </Modal>
  );
}
