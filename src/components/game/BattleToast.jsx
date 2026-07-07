import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * BattleToast - Notificações in-game para eventos de batalha tática.
 *
 * Props:
 * - toasts: array de { id, message, icon, color }
 *   - color: "blue" | "red" | "green" | "purple" | "yellow" | "orange"
 * - onDismiss: (id) => void
 * - duration: tempo em ms para auto-dismiss (default 3000)
 */

const COLOR_MAP = {
  blue: "bg-blue-400/10 border-blue-400/50 text-blue-300",
  red: "bg-red-400/10 border-red-400/50 text-red-300",
  green: "bg-green-400/10 border-green-400/50 text-green-300",
  purple: "bg-purple-400/10 border-purple-400/50 text-purple-300",
  yellow: "bg-yellow-400/10 border-yellow-400/50 text-yellow-300",
  orange: "bg-orange-400/10 border-orange-400/50 text-orange-300",
};

function BattleToast({ toasts = [], onDismiss, duration = 3000 }) {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-[90%] max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 3).map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            duration={duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss, duration }) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismissRef.current?.(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration]);

  const colorClass = COLOR_MAP[toast.color] || COLOR_MAP.orange;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-sm shadow-lg pointer-events-auto ${colorClass}`}
    >
      {toast.icon && <span className="shrink-0">{toast.icon}</span>}
      <span className="font-poppins font-medium text-sm">{toast.message}</span>
    </motion.div>
  );
}

export default BattleToast;
