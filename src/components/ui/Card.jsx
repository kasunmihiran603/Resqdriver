import React from "react";
import { motion } from "framer-motion";

export const Card = ({ children, className = "", hoverable = false, onClick, ...props }) => {
  const Component = onClick ? motion.div : "div";
  const clickProps = onClick ? {
    whileHover: { y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" },
    whileTap: { scale: 0.98 },
    onClick,
    style: { cursor: "pointer" }
  } : {};

  return (
    <Component
      className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-200 ${
        hoverable && !onClick ? "hover:-translate-y-1 hover:shadow-md" : ""
      } ${className}`}
      {...clickProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 border-b border-border/40 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-semibold leading-none tracking-tight text-foreground ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`flex items-center p-6 pt-0 border-t border-border/40 mt-6 ${className}`}>
    {children}
  </div>
);
