import React from "react";

export const Input = React.forwardRef(({
  className = "",
  type = "text",
  error = false,
  label = "",
  helperText = "",
  id,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-foreground/90">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        ref={ref}
        className={`flex h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
          error ? "border-destructive focus-visible:ring-destructive" : "border-input focus-visible:ring-ring"
        } ${className}`}
        {...props}
      />
      {helperText && (
        <p className={`text-xs ${error ? "text-destructive font-medium" : "text-muted-foreground"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export const Textarea = React.forwardRef(({
  className = "",
  error = false,
  label = "",
  helperText = "",
  id,
  rows = 3,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-foreground/90">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={`flex w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
          error ? "border-destructive focus-visible:ring-destructive" : "border-input"
        } ${className}`}
        {...props}
      />
      {helperText && (
        <p className={`text-xs ${error ? "text-destructive font-medium" : "text-muted-foreground"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";
