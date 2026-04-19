import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { useAppContext } from '../AppContext';
import { motion } from 'motion/react';

export function ContactModal() {
  const { isContactModalOpen, setContactModalOpen, showToast } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const nombre = formData.get('nombre') as string;
    const email = formData.get('email') as string;
    const mensaje = formData.get('mensaje') as string;
    
    try {
      await fetch('https://formsubmit.co/ajax/mateobsapia@gmail.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Contacto Meridian: ${nombre}`,
          Nombre: nombre,
          Email: email,
          Mensaje: mensaje
        })
      });
    } catch (error) {
      console.error(error);
    }

    setIsSubmitting(false);
    setContactModalOpen(false);
    showToast("Mensaje enviado correctamente. Nos pondremos en contacto a la brevedad.");
  };

  return (
    <Modal 
      isOpen={isContactModalOpen} 
      onClose={() => setContactModalOpen(false)} 
      title="Contacto"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[10px] font-medium tracking-[0.1em] uppercase text-ink-mute mb-2">Nombre Completo</label>
          <input 
            type="text" 
            name="nombre"
            required 
            className="w-full border border-border-strong bg-paper px-4 py-3 text-[13px] outline-none focus:border-ink transition-colors" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium tracking-[0.1em] uppercase text-ink-mute mb-2">Correo electrónico</label>
          <input 
            type="email" 
            name="email"
            required 
            className="w-full border border-border-strong bg-paper px-4 py-3 text-[13px] outline-none focus:border-ink transition-colors" 
            placeholder="ejemplo@empresa.com"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium tracking-[0.1em] uppercase text-ink-mute mb-2">Mensaje</label>
          <textarea 
            name="mensaje"
            required 
            rows={4}
            className="w-full border border-border-strong bg-paper px-4 py-3 text-[13px] outline-none focus:border-ink transition-colors resize-none" 
          />
        </div>

        <motion.button 
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          type="submit" 
          disabled={isSubmitting} 
          className="btn-primary mt-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
        </motion.button>
      </form>
    </Modal>
  );
}
