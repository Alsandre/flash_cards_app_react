import React from "react";
import {cn} from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({label, error, helperText, className, id, ...props}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "block w-full rounded-input border px-3 py-3 text-base placeholder-neutral-400 transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0",
          "border-neutral-300 bg-white text-neutral-900",
          "dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100",
          error && "border-error-500 focus:ring-error-500",
          "disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed",
          "dark:disabled:bg-neutral-900 dark:disabled:text-neutral-400",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-error-600 dark:text-error-400">{error}</p>}
      {helperText && !error && <p className="text-sm text-neutral-500 dark:text-neutral-400">{helperText}</p>}
    </div>
  );
};
