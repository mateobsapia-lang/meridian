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

          <div className="border border-border-strong bg-paper-deep p-6 h-64 overflow-y-auto text-[12px] text-ink-soft leading-relaxed font-serif relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <span className="text-8xl font-black rotate-[-30deg]">CONFIDENCIAL</span>
            </div>
            
            <div className="relative z-10 space-y-4">
              <h4 className="text-center font-bold text-ink text-[14px] mb-6">ACUERDO DE NO DIVULGACIÓN (NDA)</h4>
              
              <p>
                Entre <strong>MERIDIAN M&A LLC</strong> (en adelante, la "Parte Reveladora") y <strong>{user?.name?.toUpperCase() || 'EL RECEPTOR'}</strong>, titular de la cuenta de correo electrónico <strong>{user?.email}</strong> (en adelante, el "Receptor"), se celebra el presente Acuerdo de Confidencialidad a los {new Date().getDate()} días del mes de {new Date().toLocaleString('es-ES', { month: 'long' })} de {new Date().getFullYear()}.
              </p>
              
              <p>
                <strong>1. OBJETO.</strong> La Parte Reveladora compartirá con el Receptor información confidencial relacionada a la oportunidad de inversión identificada como <strong>Proyecto {deal?.id}</strong> en la industria de <strong>{deal?.industria}</strong> (en adelante "La Empresa"), con el único propósito de evaluar una posible transacción (el "Propósito").
              </p>
              
              <p>
                <strong>2. INFORMACIÓN CONFIDENCIAL.</strong> Se considera Información Confidencial a todos los datos financieros, operativos, comerciales, fiscales, laborales, tecnológicos y estratégicos de La Empresa, incluyendo su identidad, métricas de retención, EBITDA reportado de <strong>USD {(deal?.ebitda || 0) / 1000}K</strong> y Revenue de <strong>USD {(deal?.revenue || 0) / 1000}K</strong>, así como la existencia misma de las negociaciones informadas a través de la plataforma Meridian.
              </p>
              
              <p>
                <strong>3. OBLIGACIONES DEL RECEPTOR.</strong> El Receptor se obliga expresa e irrevocablemente a (a) mantener la Información Confidencial en la más estricta reserva; (b) no revelarla, transferirla, divulgarla ni publicarla por ningún medio; (c) no utilizar la información para competir directa o indirectamente contra La Empresa, ni para contactar a sus clientes, empleados o proveedores; y (d) no intentar circunvalar a Meridian M&A LLC en la presente transacción.
              </p>
              
              <p>
                <strong>4. PENALIDADES.</strong> En caso de incumplimiento comprobado, la Parte Reveladora se reserva el derecho de reclamar daños y perjuicios de acuerdo a la legislación vigente aplicable en la Ciudad Autónoma de Buenos Aires, República Argentina, además de la suspensión permanente de la cuenta del Receptor en la plataforma Meridian.
              </p>
              
              <p className="mt-8 pt-4 border-t border-border-subtle flex flex-col items-end">
                <span className="font-mono text-[9px] uppercase tracking-widest text-ink-mute mb-2">Firma Digital Registrada</span>
                <span className="font-serif italic text-ink text-[16px]">{user?.name}</span>
                <span className="font-mono text-[8px] text-ink-mute">ID: {user?.uid?.substring(0, 8)} · TIMESTAMP: {new Date().getTime()}</span>
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer bg-paper-deep border border-border-subtle p-4 mt-2">
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-0.5 accent-accent" />
            <span className="text-[12px] text-ink-soft">
              Declaro bajo juramento mi identidad y acepto las consecuencias legales vinculantes de este <strong>Acuerdo de Confidencialidad</strong>.
            </span>
          </label>

          <button onClick={handleSubmit} disabled={!accepted || submitting} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Registrando firma digital...' : 'Firmar Digitalmente y Solicitar Acceso'}
          </button>
        </div>
      )}
    </Modal>
  );
}
