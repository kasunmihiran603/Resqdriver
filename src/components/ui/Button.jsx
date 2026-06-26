import React from "react";
import { motion } from "framer-motion";

export const Button = React.forwardRef(({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  ...props
}, ref) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-95 touch-manipulation";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:bg-primary/95",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
    ghost: "hover:bg-accent hover:text-accent-foreground bg-transparent",
    link: "text-primary underline-offset-4 hover:underline bg-transparent"
  };

  const sizes = {
    sm: "h-9 px-3 text-xs md:text-sm",
    md: "h-11 px-5 py-2 text-sm md:text-base",
    lg: "h-12 px-8 py-3 text-base md:text-lg"
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseStyle} ${currentVariant} ${currentSize} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : children}
    </motion.button>
  );
});

Button.displayName = "Button";
