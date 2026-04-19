import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
};

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-[440px]' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            className={`bg-paper border border-border-strong w-full relative shadow-2xl overflow-hidden rounded-xl flex flex-col max-h-[90vh] sm:max-h-[85vh] ${maxWidth}`}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-strong shrink-0">
              <h2 className="font-serif text-[18px] font-semibold text-ink">{title}</h2>
              <button 
                onClick={onClose}
                className="text-ink-mute hover:text-ink transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
