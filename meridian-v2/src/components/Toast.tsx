import { useAppContext } from '../AppContext';
import { AnimatePresence, motion } from 'motion/react';

export function Toast() {
  const { toastMessage } = useAppContext();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 bg-ink text-paper px-6 py-4 rounded-sm shadow-2xl flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
          <span className="font-mono text-[11px] tracking-wide">{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
