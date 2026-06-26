import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnOutsideClick = true
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      window.removeEventListener("resize", checkMobile);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const drawerVariants = {
    hidden: isMobile ? { y: "100%" } : { x: "100%" },
    visible: isMobile ? { y: 0 } : { x: 0 }
  };

  const transition = { type: "spring", damping: 25, stiffness: 220 };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeOnOutsideClick ? onClose : undefined}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transition}
            className={`fixed bg-card text-card-foreground shadow-2xl flex flex-col z-10 border-border ${
              isMobile
                ? "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl border-t"
                : "top-0 right-0 bottom-0 w-[480px] max-w-[90vw] border-l"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
              <div>
                {title && <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 text-sm md:text-base">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
