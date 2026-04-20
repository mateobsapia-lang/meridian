import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { motion } from 'motion/react';

export function LeadCaptureModal() {
  const { isLeadModalOpen, setLeadModalOpen, showToast } = useAppContext();
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('https://formsubmit.co/ajax/mateobsapia@gmail.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `MERIDIAN: Solicitud de Análisis DCF - ${company}`,
          _template: 'box',
          "🏢 Empresa / Proyecto": company,
          "✉️ Correo Corporativo": email,
          "🎯 Origen": 'Calculadora de Valuación (Lead Magnet)'
        })
      });
    } catch (error) {
      console.log('Error de red al enviar lead', error);
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    showToast('Solicitud enviada a un analista.');
    
    // Close after short delay
    setTimeout(() => {
      setIsSuccess(false);
      setLeadModalOpen(false);
      setEmail('');
      setCompany('');
    }, 2000);
  };

  // Prevent returning null right away to allow AnimatePresence to run
  // The actual modal vis is controlled by Modal's AnimatePresence.
  // But we have a bug if we use `if(!isLeadModalOpen) return null`, so we remove it.

  return (
    <Modal 
      isOpen={isLeadModalOpen} 
      onClose={() => setLeadModalOpen(false)} 
      title="Análisis Financiero Privado"
    >
      {!isSuccess ? (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[13px] text-ink-soft leading-relaxed">
              Complete los datos para que uno de nuestros <strong className="text-ink">Analistas de M&A</strong> asigne un modelo Descontado de Flujo de Efectivo (DCF) y múltiplos transaccionales ajustados a su empresa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.1em] text-ink-mute mb-2">Correo Corporativo</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-paper-deep border border-border-strong text-ink text-[14px] p-3 outline-none focus:border-accent transition-colors"
                placeholder="ej: ceo@empresa.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.1em] text-ink-mute mb-2">Razón Social / Proyecto</label>
              <input 
                type="text" 
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-paper-deep border border-border-strong text-ink text-[14px] p-3 outline-none focus:border-accent transition-colors"
                placeholder="ej: Tech Solutions S.A."
              />
            </div>

            <motion.button 
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              type="submit" 
              disabled={isSubmitting}
              className="mt-2 btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Encriptando Solicitud...' : 'Solicitar Reporte de Valuación Privado'}
            </motion.button>
            <div className="text-[10px] text-center text-ink-mute font-mono">
              Proceso 100% confidencial auditado por M&A Partners.
            </div>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-ink">
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center font-serif text-[32px] font-medium mb-6 animate-pulse">
            ✓
          </div>
          <h3 className="font-serif text-[24px] font-bold mb-2">Solicitud Recibida</h3>
          <p className="text-[13px] text-ink-soft">
            Un analista senior de Meridian le enviará el reporte a <strong>{email}</strong> en las próximas 24-48 horas.
          </p>
        </div>
      )}
    </Modal>
  );
}
