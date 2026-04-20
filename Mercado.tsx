import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { motion } from 'motion/react';
import { createDeal } from '../lib/firestore';
import { AIAnalysisModal } from './AIAnalysisModal';

const INDUSTRIES = ['SaaS / Tech', 'Agro', 'Manufactura', 'Servicios', 'Retail', 'Salud', 'Construcción', 'Logística', 'Otro'];
const REGIONS = ['CABA', 'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Entre Ríos', 'Tucumán', 'Otro'];
const TIPOS = ['SRL', 'SA', 'SAS', 'Unipersonal', 'Otro'];

const STEPS = ['Empresa', 'Documentos', 'Financiero', 'Legal', 'Confirmar'];

export function SellerWizard() {
  const { isSellerWizardOpen, setSellerWizardOpen, showToast, user, setLoginModalOpen } = useAppContext();
  const [step, setStep] = useState(1);
  const [dealId, setDealId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  const [form, setForm] = useState({
    nombreFantasia: '', cuit: '', industria: '', region: '', descripcion: '',
    revenue: '', ebitda: '', crecimiento: '', deuda: '', askingPrice: '',
    tipoSocietario: '', jurisdiccion: '', representante: '', telefono: '', email: '',
    h1: '', h2: '', h3: '',
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const reset = () => {
    setStep(1); setDealId(''); setAiAnalyzed(false);
    setForm({ nombreFantasia: '', cuit: '', industria: '', region: '', descripcion: '', revenue: '', ebitda: '', crecimiento: '', deuda: '', askingPrice: '', tipoSocietario: '', jurisdiccion: '', representante: '', telefono: '', email: '', h1: '', h2: '', h3: '' });
  };

  const handleAIApprove = (data: { revenue?: number; ebitda?: number }) => {
    if (data.revenue) setForm(prev => ({ ...prev, revenue: String(Math.round(data.revenue! / 1000)) }));
    if (data.ebitda) setForm(prev => ({ ...prev, ebitda: String(Math.round(data.ebitda! / 1000)) }));
    setAiAnalyzed(true);
    setShowAI(false);
    setStep(3);
  };

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
        email: form.email || user.email,
        highlights,
      } as any);
      setDealId(id);
      setStep(6);
      showToast('Empresa enviada para revisión');
    } catch {
      showToast('Error al enviar. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5";

  return (
    <>
      <Modal isOpen={isSellerWizardOpen} onClose={() => { setSellerWizardOpen(false); reset(); }} title="Listar mi Empresa">
        {/* Progress */}
        {step < 6 && (
          <div className="mb-6">
            <div className="flex gap-1 mb-2">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-0.5 flex-1 transition-colors ${i + 1 <= step ? 'bg-accent' : 'bg-border-strong'}`} />
              ))}
            </div>
            <div className="font-mono text-[9px] text-ink-mute uppercase tracking-widest">{STEPS[step - 1]} · Paso {step} de {STEPS.length}</div>
          </div>
        )}

        {/* Step 1: Empresa */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            <h3 className="font-serif text-[22px] font-bold text-ink">Información de la Empresa</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Nombre Fantasía *</label>
                <input name="nombreFantasia" value={form.nombreFantasia} onChange={handle} className={inputClass} placeholder="Ej: TechSolutions SRL" required />
              </div>
              <div>
                <label className={labelClass}>CUIT *</label>
                <input name="cuit" value={form.cuit} onChange={handle} className={inputClass} placeholder="20-12345678-9" />
              </div>
              <div>
                <label className={labelClass}>Industria *</label>
                <select name="industria" value={form.industria} onChange={handle} className={inputClass}>
                  <option value="">Seleccionar...</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Región *</label>
                <select name="region" value={form.region} onChange={handle} className={inputClass}>
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
                <textarea name="descripcion" value={form.descripcion} onChange={handle} className={inputClass + " resize-none"} rows={3} placeholder="Descripción del negocio, propuesta de valor..." />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Highlights (hasta 3)</label>
                <input name="h1" value={form.h1} onChange={handle} className={inputClass + " mb-2"} placeholder="Ej: 94% de ingresos recurrentes" />
                <input name="h2" value={form.h2} onChange={handle} className={inputClass + " mb-2"} placeholder="Ej: Equipo consolidado de 22 personas" />
                <input name="h3" value={form.h3} onChange={handle} className={inputClass} placeholder="Ej: Presencia en 3 países" />
              </div>
            </div>
            <button onClick={() => setStep(2)} className="btn-primary w-full mt-2" disabled={!form.nombreFantasia || !form.industria || !form.region}>
              Continuar →
            </button>
          </motion.div>
        )}

        {/* Step 2: Documentos + IA */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
            <h3 className="font-serif text-[22px] font-bold text-ink">Documentación Financiera</h3>
            <p className="text-[13px] text-ink-soft">Subí tu balance o estado de resultados y nuestra IA extraerá los datos financieros automáticamente.</p>

            {aiAnalyzed ? (
              <div className="bg-accent-light border border-accent/30 p-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-medium text-accent text-[13px]">Documento analizado correctamente</div>
                  <div className="text-[11px] text-ink-mute">Los datos financieros fueron pre-cargados automáticamente</div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAI(true)} className="flex items-center gap-4 p-5 border-2 border-dashed border-accent/40 hover:border-accent hover:bg-accent-light transition-all text-left w-full">
                <span className="text-3xl">🤖</span>
                <div>
                  <div className="font-medium text-ink text-[14px]">Analizar con IA (recomendado)</div>
                  <div className="text-[12px] text-ink-mute mt-0.5">Subí un balance PDF o imagen · Extracción automática de métricas</div>
                </div>
              </button>
            )}

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border-strong" />
              <span className="text-[11px] text-ink-mute font-mono">o</span>
              <div className="flex-1 h-px bg-border-strong" />
            </div>

            <button onClick={() => setStep(3)} className="btn-ghost w-full">
              Cargar datos manualmente →
            </button>

            <button onClick={() => setStep(1)} className="text-[11px] font-mono text-ink-mute hover:text-ink text-center">← Atrás</button>
          </motion.div>
        )}

        {/* Step 3: Financiero */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
            <h3 className="font-serif text-[22px] font-bold text-ink">Información Financiera</h3>
            <p className="text-[12px] text-ink-mute">Valores en USD miles — si el revenue es USD 3.2M escribí 3200</p>
            {aiAnalyzed && <div className="bg-accent-light border border-accent/20 px-3 py-2 text-[11px] text-accent">✓ Pre-cargado por IA — revisá y ajustá si es necesario</div>}
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'revenue', label: 'Revenue LTM (USD miles) *', placeholder: '3200' },
                { name: 'ebitda', label: 'EBITDA LTM (USD miles) *', placeholder: '910' },
                { name: 'crecimiento', label: 'Crecimiento YoY (%)', placeholder: '35' },
                { name: 'deuda', label: 'Deuda Financiera (USD miles)', placeholder: '0' },
              ].map(f => (
                <div key={f.name}>
                  <label className={labelClass}>{f.label}</label>
                  <input type="number" name={f.name} value={(form as any)[f.name]} onChange={handle} className={inputClass} placeholder={f.placeholder} />
                </div>
              ))}
              <div className="col-span-2">
                <label className={labelClass}>Precio de Venta Deseado (USD miles) *</label>
                <input type="number" name="askingPrice" value={form.askingPrice} onChange={handle} className={inputClass} placeholder="7100" />
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(2)} className="btn-ghost flex-1">← Atrás</button>
              <button onClick={() => setStep(4)} className="btn-primary flex-1" disabled={!form.revenue || !form.ebitda || !form.askingPrice}>Continuar →</button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Legal */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
            <h3 className="font-serif text-[22px] font-bold text-ink">Datos Legales y Contacto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Jurisdicción de registro</label>
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
                <label className={labelClass}>Email de Contacto</label>
                <input type="email" name="email" value={form.email} onChange={handle} className={inputClass} placeholder={user?.email || 'contacto@empresa.com'} />
              </div>
            </div>
            <div className="bg-paper-deep border border-border-subtle p-4 text-[11px] text-ink-mute leading-relaxed">
              <strong className="text-ink-soft">Declaración jurada:</strong> Al enviar esta información, el representante declara que los datos proporcionados son verídicos y completos, y acepta los Términos y Condiciones de Meridian, incluyendo el pago de comisión al éxito al momento del cierre.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-ghost flex-1">← Atrás</button>
              <button onClick={() => setStep(5)} className="btn-primary flex-1">Revisar y Enviar →</button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Confirmar */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
            <h3 className="font-serif text-[22px] font-bold text-ink">Revisar y Enviar</h3>
            {!user && (
              <div className="bg-amber-50 border border-amber-300 p-4 text-[13px] text-amber-800">
                ⚠ Necesitás iniciar sesión para enviar.
              </div>
            )}
            <div className="border border-border-strong bg-paper-deep p-5 flex flex-col gap-2.5 text-[13px]">
              {[
                ['Empresa', form.nombreFantasia], ['CUIT', form.cuit],
                ['Industria', form.industria], ['Región', form.region],
                ['Revenue', `USD ${Number(form.revenue).toLocaleString()}K`],
                ['EBITDA', `USD ${Number(form.ebitda).toLocaleString()}K`],
                ['Asking Price', `USD ${Number(form.askingPrice).toLocaleString()}K`],
                ['Contacto', form.email || user?.email || '—'],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between border-b border-border-subtle pb-2 last:border-none">
                  <span className="text-ink-mute">{l}</span>
                  <span className="font-medium text-ink">{v || '—'}</span>
                </div>
              ))}
            </div>
            {aiAnalyzed && (
              <div className="flex items-center gap-2 text-[11px] text-accent font-mono">
                <span>✓</span> Documentación analizada y verificada por IA
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="btn-ghost flex-1">← Atrás</button>
              <button onClick={handleFinish} disabled={isSubmitting} className="btn-primary flex-1">
                {isSubmitting ? 'Enviando...' : 'Enviar para Revisión'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 6: Éxito */}
        {step === 6 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center text-3xl">✓</div>
            <h3 className="font-serif text-[26px] font-bold text-ink">Empresa Enviada</h3>
            <p className="text-ink-mute text-[14px] max-w-sm">
              Tu empresa fue enviada con ID <strong className="font-mono text-ink">{dealId}</strong>. Nuestro equipo la revisará en 2–5 días hábiles y recibirás una notificación.
            </p>
            {aiAnalyzed && <p className="text-[12px] text-accent">✓ Tu documentación fue pre-verificada por IA</p>}
            <button onClick={() => { setSellerWizardOpen(false); reset(); }} className="btn-primary mt-2">Cerrar</button>
          </motion.div>
        )}
      </Modal>

      <AIAnalysisModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        onApprove={handleAIApprove}
      />
    </>
  );
}
