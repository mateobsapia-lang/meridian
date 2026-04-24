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

const inputClass = 'w-full border border-border-strong bg-paper text-ink text-[13px] px-3 py-2.5 focus:outline-none focus:border-accent transition-colors';
const labelClass = 'block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute mb-1.5';

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
    setForm({
      nombreFantasia: '', cuit: '', industria: '', region: '', descripcion: '',
      revenue: '', ebitda: '', crecimiento: '', deuda: '', askingPrice: '',
      tipoSocietario: '', jurisdiccion: '', representante: '', telefono: '', email: '',
      h1: '', h2: '', h3: '',
    });
  };

  // Primero crea el deal en Firestore para tener un ID real antes del análisis IA
  const handleCreateDraftAndAnalyze = async () => {
    if (!user) { setSellerWizardOpen(false); setLoginModalOpen(true); return; }
    setIsSubmitting(true);
    try {
      const highlights = [form.h1, form.h2, form.h3].filter(Boolean);
      const id = await createDeal({
        status: 'under_review',
        ownerId: user.uid,
        nombreFantasia: form.nombreFantasia,
        cuit: form.cuit,
        industria: form.industria || INDUSTRIES[0],
        region: form.region || REGIONS[0],
        descripcion: form.descripcion,
        revenue: Number(form.revenue) * 1000,
        ebitda: Number(form.ebitda) * 1000,
        crecimiento: Number(form.crecimiento),
        deuda: Number(form.deuda) * 1000,
        askingPrice: Number(form.askingPrice) * 1000,
        tipoSocietario: form.tipoSocietario || TIPOS[0],
        jurisdiccion: form.jurisdiccion,
        representante: form.representante,
        telefono: form.telefono,
        email: form.email || user.email,
        highlights,
      } as Parameters<typeof createDeal>[0]);
      setDealId(id);
      setShowAI(true);
    } catch {
      showToast('Error al crear el deal. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIApprove = (data: { revenue?: number; ebitda?: number }) => {
    if (data.revenue) setForm(prev => ({ ...prev, revenue: String(Math.round(data.revenue! / 1000)) }));
    if (data.ebitda)  setForm(prev => ({ ...prev, ebitda:  String(Math.round(data.ebitda! / 1000)) }));
    setAiAnalyzed(true);
    setShowAI(false);
    setStep(6); // paso de confirmación / éxito
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
        industria: form.industria || INDUSTRIES[0],
        region: form.region || REGIONS[0],
        descripcion: form.descripcion,
        revenue: Number(form.revenue) * 1000,
        ebitda: Number(form.ebitda) * 1000,
        crecimiento: Number(form.crecimiento),
        deuda: Number(form.deuda) * 1000,
        askingPrice: Number(form.askingPrice) * 1000,
        tipoSocietario: form.tipoSocietario || TIPOS[0],
        jurisdiccion: form.jurisdiccion,
        representante: form.representante,
        telefono: form.telefono,
        email: form.email || user.email,
        highlights,
      } as Parameters<typeof createDeal>[0]);
      setDealId(id);
      setStep(6);
      showToast('Empresa enviada para revisión');
    } catch {
      showToast('Error al enviar. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const close = () => { setSellerWizardOpen(false); setTimeout(reset, 300); };

  const stepLabels = STEPS;

  return (
    <>
      <Modal isOpen={isSellerWizardOpen && !showAI} onClose={close} title="Listar mi Empresa" maxWidth="max-w-[580px]">
        {/* Progress */}
        {step <= 5 && (
          <div className="mb-8">
            <div className="flex gap-1.5 mb-3">
              {stepLabels.map((_, i) => (
                <div key={i} className={`flex-1 h-1 transition-colors ${i + 1 <= step ? 'bg-accent' : 'bg-border-strong'}`} />
              ))}
            </div>
            <div className="flex justify-between">
              {stepLabels.map((label, i) => (
                <span key={i} className={`font-mono text-[9px] uppercase tracking-widest ${i + 1 === step ? 'text-accent' : 'text-ink-mute'}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Paso 1 — Empresa */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Nombre Fantasía de la Empresa</label>
              <input name="nombreFantasia" value={form.nombreFantasia} onChange={handle}
                className={inputClass} placeholder="Ej: Soluciones del Sur" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Industria</label>
                <select name="industria" value={form.industria} onChange={handle} className={inputClass}>
                  <option value="">Seleccionar...</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Región</label>
                <select name="region" value={form.region} onChange={handle} className={inputClass}>
                  <option value="">Seleccionar...</option>
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Descripción del Negocio (teaser confidencial)</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handle}
                className={inputClass + ' resize-none'} rows={4}
                placeholder="Describí el modelo de negocio, clientes, ventajas competitivas..." />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Highlights (hasta 3)</label>
              {['h1', 'h2', 'h3'].map((h, i) => (
                <input key={h} name={h} value={form[h as keyof typeof form]} onChange={handle}
                  className={inputClass} placeholder={`Highlight ${i + 1} — ej: "94% ingresos recurrentes"`} />
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!form.nombreFantasia || !form.descripcion}
              className="btn-primary w-full mt-2 disabled:opacity-40">
              Siguiente →
            </button>
          </motion.div>
        )}

        {/* Paso 2 — Documentos / Análisis IA */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
            <div className="bg-accent-light border border-accent/20 p-5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-2">Análisis con IA</div>
              <p className="text-[13px] text-ink-soft leading-relaxed">
                Subí un balance o estado de resultados. Nuestra IA lo analiza, extrae los datos financieros
                y asigna un <strong>score de calidad 0-100</strong>. Score ≥ 80 → publicación automática.
              </p>
            </div>
            <div className={`border p-5 flex items-center gap-3 ${aiAnalyzed ? 'border-accent/40 bg-accent-light' : 'border-border-strong'}`}>
              <span className="text-2xl">{aiAnalyzed ? '✅' : '📄'}</span>
              <div>
                <div className="font-medium text-ink text-[13px]">
                  {aiAnalyzed ? 'Análisis completado' : 'Análisis de documentos pendiente'}
                </div>
                <div className="text-ink-mute text-[11px] font-mono">
                  {aiAnalyzed ? 'Los datos financieros fueron extraídos automáticamente' : 'Opcional pero acelera significativamente la aprobación'}
                </div>
              </div>
            </div>
            {!aiAnalyzed && (
              <button onClick={() => setShowAI(true)} className="btn-accent w-full">
                Analizar con IA →
              </button>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Atrás</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1">
                {aiAnalyzed ? 'Continuar →' : 'Saltar análisis →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Paso 3 — Financiero */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            <p className="text-[12px] text-ink-mute font-mono">Todos los valores en USD miles (ej: 2500 = USD 2.5M)</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'revenue', label: 'Revenue anual (USD miles)' },
                { name: 'ebitda', label: 'EBITDA (USD miles)' },
                { name: 'crecimiento', label: 'Crecimiento YoY (%)' },
                { name: 'deuda', label: 'Deuda total (USD miles)' },
                { name: 'askingPrice', label: 'Precio de venta deseado (USD miles)' },
              ].map(f => (
                <div key={f.name} className={f.name === 'askingPrice' ? 'col-span-2' : ''}>
                  <label className={labelClass}>{f.label}</label>
                  <input type="number" name={f.name} value={form[f.name as keyof typeof form]}
                    onChange={handle} className={inputClass} min="0" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(2)} className="btn-ghost flex-1">← Atrás</button>
              <button onClick={() => setStep(4)}
                disabled={!form.revenue || !form.ebitda || !form.askingPrice}
                className="btn-primary flex-1 disabled:opacity-40">
                Siguiente →
              </button>
            </div>
          </motion.div>
        )}

        {/* Paso 4 — Legal */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo Societario</label>
                <select name="tipoSocietario" value={form.tipoSocietario} onChange={handle} className={inputClass}>
                  <option value="">Seleccionar...</option>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>CUIT</label>
                <input name="cuit" value={form.cuit} onChange={handle} className={inputClass} placeholder="30-12345678-9" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Jurisdicción / Provincia de inscripción</label>
                <input name="jurisdiccion" value={form.jurisdiccion} onChange={handle}
                  className={inputClass} placeholder="CABA, Buenos Aires..." />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Representante legal / contacto</label>
                <input name="representante" value={form.representante} onChange={handle} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handle}
                  className={inputClass} placeholder="+54 11 ..." />
              </div>
              <div>
                <label className={labelClass}>Email de contacto</label>
                <input type="email" name="email" value={form.email} onChange={handle}
                  className={inputClass} placeholder="ceo@empresa.com" />
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(3)} className="btn-ghost flex-1">← Atrás</button>
              <button onClick={() => setStep(5)} className="btn-primary flex-1">Siguiente →</button>
            </div>
          </motion.div>
        )}

        {/* Paso 5 — Confirmar */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
            <div className="bg-paper-deep border border-border-strong p-6 flex flex-col gap-3 text-[13px]">
              <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Resumen del listing</div>
              {[
                ['Empresa', form.nombreFantasia],
                ['Industria', form.industria],
                ['Región', form.region],
                ['Revenue', `USD ${Number(form.revenue).toLocaleString()}K`],
                ['EBITDA', `USD ${Number(form.ebitda).toLocaleString()}K`],
                ['Asking Price', `USD ${Number(form.askingPrice).toLocaleString()}K`],
                ['Representante', form.representante],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-ink-mute">{k}</span>
                  <span className="font-medium text-ink">{v || '—'}</span>
                </div>
              ))}
            </div>
            <div className="bg-accent-light border border-accent/20 p-4 text-[12px] text-accent">
              Al enviar, tu empresa quedará en estado <strong>Revisión</strong>. El equipo de Meridian
              la revisará en 24-48hs hábiles. 5% de comisión solo al cierre.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="btn-ghost flex-1">← Atrás</button>
              <button onClick={handleFinish} disabled={isSubmitting} className="btn-primary flex-1 disabled:opacity-50">
                {isSubmitting ? 'Enviando...' : 'Enviar para Revisión →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Paso 6 — Éxito */}
        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center text-3xl">
              ✓
            </div>
            <div>
              <h3 className="font-serif text-[22px] font-bold text-ink mb-2">
                {aiAnalyzed ? 'Empresa procesada' : 'Empresa enviada para revisión'}
              </h3>
              <p className="text-ink-mute text-[14px] max-w-sm">
                {aiAnalyzed
                  ? 'El análisis IA determinó el score. Podés ver el estado en tu dashboard.'
                  : 'Revisaremos tu información en 24-48hs hábiles y te notificaremos por email.'}
              </p>
              {dealId && (
                <p className="font-mono text-[11px] text-accent mt-3">ID: {dealId}</p>
              )}
            </div>
            <button onClick={close} className="btn-primary">Ir a mi Dashboard →</button>
          </motion.div>
        )}
      </Modal>

      {/* Modal de análisis IA — separado para no anidar modales */}
      <AIAnalysisModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        onApprove={handleAIApprove}
        dealId={dealId}
      />
    </>
  );
}
