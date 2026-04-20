import { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { createNDARequest, hasSignedNDA, getDeal, createNotification } from '../lib/firestore';
import type { Deal } from '../types';

export function NDAModal() {
  const { isNdaModalOpen, setNdaModalOpen, selectedDealId, user, showToast } = useAppContext();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedDealId || !isNdaModalOpen) return;
    getDeal(selectedDealId).then(setDeal);
    if (user) hasSignedNDA(selectedDealId, user.uid).then(setAlreadySigned);
  }, [selectedDealId, isNdaModalOpen, user]);

  const handleSubmit = async () => {
    if (!user || !selectedDealId || !deal) return;
    setSubmitting(true);
    try {
      await createNDARequest(selectedDealId, user.uid, user.name, user.email);
      // Notify seller
      await createNotification(
        deal.ownerId,
        'nda_request',
        'Nueva Solicitud de NDA',
        `${user.name} solicitó acceso NDA para ${deal.nombreFantasia}`,
        selectedDealId
      );
      setStep('success');
    } catch {
      showToast('Error al enviar solicitud. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const onClose = () => { setNdaModalOpen(false); setStep('form'); setAccepted(false); };

  return (
    <Modal isOpen={isNdaModalOpen} onClose={onClose} title="Acuerdo de Confidencialidad (NDA)">
      {alreadySigned ? (
        <div className="flex flex-col items-center py-8 gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center text-2xl">✓</div>
          <h3 className="font-serif text-[22px] font-bold text-ink">NDA ya firmado</h3>
          <p className="text-ink-mute text-[14px]">Ya tenés acceso a la información confidencial de este deal.</p>
          <button onClick={onClose} className="btn-primary">Ver Deal</button>
        </div>
      ) : step === 'success' ? (
        <div className="flex flex-col items-center py-8 gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center text-2xl">✓</div>
          <h3 className="font-serif text-[22px] font-bold text-ink">Solicitud Enviada</h3>
          <p className="text-ink-mute text-[14px] max-w-sm">Tu solicitud de NDA fue enviada. El equipo de Meridian verificará tu perfil y te notificará en 24–48hs.</p>
          <button onClick={onClose} className="btn-primary mt-2">Entendido</button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-1">Acuerdo de No Divulgación</div>
            <h3 className="font-serif text-[20px] font-bold text-ink">
              {deal ? `${deal.id} · ${deal.industria}` : 'Cargando...'}
            </h3>
          </div>

          <div className="border border-border-strong bg-paper-deep p-5 h-48 overflow-y-auto text-[12px] text-ink-soft leading-relaxed font-serif">
            <p className="mb-3"><strong>Acuerdo de Confidencialidad</strong></p>
            <p className="mb-3">El firmante (en adelante "el Receptor") se compromete a mantener estricta confidencialidad respecto de toda información relacionada con la empresa objeto de análisis, sus operaciones, finanzas, clientes, proveedores, estrategias y cualquier otro dato no público al que tenga acceso como resultado del presente proceso de due diligence.</p>
            <p className="mb-3">El Receptor se obliga a: (i) no divulgar, comunicar ni transferir a terceros la Información Confidencial; (ii) utilizar la información exclusivamente para evaluar una posible transacción; (iii) no utilizar la información para competir directa o indirectamente con la empresa.</p>
            <p className="mb-3">El incumplimiento de este acuerdo dará lugar a las acciones legales correspondientes según la legislación argentina aplicable. Este acuerdo tiene una vigencia de 24 meses a partir de la fecha de firma.</p>
            <p>Al aceptar este acuerdo, el Receptor confirma haber leído, comprendido y aceptado todas las condiciones aquí establecidas.</p>
          </div>

          <div className="bg-paper-deep border border-border-subtle p-4 text-[12px] text-ink-soft">
            <div><strong>Firmante:</strong> {user?.name}</div>
            <div><strong>Email:</strong> {user?.email}</div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-0.5 accent-accent" />
            <span className="text-[12px] text-ink-soft">Leí y acepto el Acuerdo de Confidencialidad. Entiendo que el incumplimiento tiene consecuencias legales.</span>
          </label>

          <button onClick={handleSubmit} disabled={!accepted || submitting} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Enviando...' : 'Firmar y Solicitar Acceso'}
          </button>
        </div>
      )}
    </Modal>
  );
}
