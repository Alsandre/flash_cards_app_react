import React from "react";
import {cn} from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-button",
  secondary: "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-900 shadow-button dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-100",
  ghost: "hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 dark:hover:bg-neutral-800 dark:text-neutral-300",
  danger: "bg-error-500 hover:bg-error-600 active:bg-error-700 text-white shadow-button",
};

const buttonSizes = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-4 py-3 text-base min-h-[44px]",
  lg: "px-6 py-4 text-lg min-h-[52px]",
};

export const Button: React.FC<ButtonProps> = ({variant = "primary", size = "md", isLoading = false, asChild = false, disabled, className, children, ...props}) => {
  const baseClasses = cn("inline-flex items-center justify-center rounded-button font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed", buttonVariants[variant], buttonSizes[size], className);

  if (asChild) {
    const child = children as React.ReactElement<{className?: string}>;
    return React.cloneElement(child, {
      className: cn(baseClasses, child.props.className),
    });
  }

  return (
    <button className={baseClasses} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
