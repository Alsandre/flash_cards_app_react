import React from "react";
import {cn} from "../../utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({label, error, helperText, className, id, ...props}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "block w-full rounded-input border px-3 py-3 text-base placeholder-neutral-400 transition-colors duration-200 resize-y",
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
