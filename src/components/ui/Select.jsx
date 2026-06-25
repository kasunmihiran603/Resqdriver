import React from "react";

export const Select = React.forwardRef(({
  className = "",
  error = false,
  label = "",
  helperText = "",
  id,
  children,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-foreground/90">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={`flex h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all cursor-pointer ${
            error ? "border-destructive focus-visible:ring-destructive" : "border-input"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {helperText && (
        <p className={`text-xs ${error ? "text-destructive font-medium" : "text-muted-foreground"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";
