import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />
  };

  const borderStyles = {
    success: "border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/20 dark:border-emerald-500/30",
    error: "border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/20 dark:border-rose-500/30",
    info: "border-sky-500/20 bg-sky-50/90 dark:bg-sky-950/20 dark:border-sky-500/30"
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 md:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md text-foreground pointer-events-auto ${borderStyles[toast.type]}`}
            >
              <div className="shrink-0 pt-0.5">{icons[toast.type]}</div>
              <div className="flex-1 text-sm font-medium pr-2 leading-relaxed">{toast.message}</div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 p-0.5 hover:bg-muted-foreground/10 rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
