import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';

export function BuyerWizard() {
  const { isBuyerWizardOpen, setBuyerWizardOpen, login } = useAppContext();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      name: name.split(' ')[0] || email.split('@')[0],
      initials: (name || email).charAt(0).toUpperCase(),
      email,
      role: 'buyer'
    });
    setBuyerWizardOpen(false);
    setStep(1);
  };

  const close = () => {
    setBuyerWizardOpen(false);
    setTimeout(() => setStep(1), 300);
  };

  return (
    <Modal 
      isOpen={isBuyerWizardOpen} 
      onClose={close} 
      title="Registro de Comprador"
      maxWidth="max-w-[600px]"
    >
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-accent' : 'bg-border-strong'}`} />
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col gap-5">
          <h3 className="font-serif text-[18px] font-medium text-ink">1. Perfil del Comprador</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre del Inversor" required value={name} onChange={(e: any) => setName(e.target.value)} />
            <Input label="Correo Electrónico Laboral" type="email" required value={email} onChange={(e: any) => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium tracking-[0.1em] uppercase text-ink-mute mb-2">Tipo de Adquirente</label>
              <select required className="w-full border border-border-strong bg-paper px-4 py-3 text-[13px] outline-none focus:border-ink">
                <option value="">Seleccione...</option>
                <option value="FamilyOffice">Family Office</option>
                <option value="PE">Fondo de Private Equity</option>
                <option value="Strategic">Adquirente Estratégico / Corporativo</option>
                <option value="Individual">Inversor Individual Calificado</option>
              </select>
            </div>
            <Input label="Nombre de la Institución/Organización" required />
          </div>
          <Input type="password" label="Contraseña" required minLength={8} />
          <div className="flex justify-end pt-4">
            <button type="submit" className="btn-primary">Siguiente →</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col gap-5">
          <h3 className="font-serif text-[18px] font-medium text-ink">2. Tesis de Inversión</h3>
          <div>
            <label className="block text-[10px] font-medium tracking-[0.1em] uppercase text-ink-mute mb-2">Industrias de Interés</label>
            <div className="grid grid-cols-3 gap-2">
              {['SaaS / Tech', 'Agro', 'Cuidado de Salud', 'Manufactura', 'Logística', 'Retail', 'Servicios B2B', 'Energía'].map(ind => (
                <label key={ind} className="flex items-center gap-2 cursor-pointer text-[11px] border border-border-subtle p-2 hover:bg-paper-mid">
                  <input type="checkbox" className="accent-accent" />
                  <span>{ind}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Ticket Mínimo (USD)" placeholder="200000" />
            <Input type="number" label="Ticket Máximo (USD)" placeholder="5000000" />
          </div>
          <div className="flex justify-between pt-4">
            <button type="button" onClick={prevStep} className="btn-ghost">← Volver</button>
            <button type="submit" className="btn-primary">Siguiente →</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleFinish} className="flex flex-col gap-5">
          <h3 className="font-serif text-[18px] font-medium text-ink">3. Cumplimiento Normativo (KYC/AML)</h3>
          <p className="text-[12px] text-ink-soft leading-relaxed border border-border-strong bg-paper-deep p-4 font-mono text-xs">
            Como Sujeto Obligado ante la Unidad de Información Financiera (UIF) según Res. 30/2017, requerimos validación legal antes de proveer acceso al Data Room.
          </p>
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer text-[12px] text-ink-soft bg-paper-deep p-3 border border-border-subtle">
              <input type="checkbox" required className="mt-0.5 accent-accent" />
              <span>Declaro bajo juramento sobre la licitud del origen de los fondos a ser utilizados.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer text-[12px] text-ink-soft bg-paper-deep p-3 border border-border-subtle">
              <input type="checkbox" required className="mt-0.5 accent-accent" />
              <span>Declaro mi condición de Persona Expuesta Políticamente (PEP) de acuerdo a la normativa vigente.</span>
            </label>
          </div>
          <div>
            <label className="block text-[10px] font-medium tracking-[0.1em] uppercase text-ink-mute mb-2">Adjuntar Identificación Oficial (Opcional por ahora)</label>
            <input type="file" className="text-[12px] text-ink-soft" />
          </div>
          <div className="flex justify-between pt-4">
            <button type="button" onClick={prevStep} className="btn-ghost">← Volver</button>
            <button type="submit" className="btn-accent">Finalizar Registro e Ingresar</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-[10px] font-medium tracking-[0.1em] uppercase text-ink-mute mb-2">{label}</label>
      <input className="w-full border border-border-strong bg-paper px-4 py-3 text-[13px] outline-none focus:border-ink transition-colors" {...props} />
    </div>
  );
}
