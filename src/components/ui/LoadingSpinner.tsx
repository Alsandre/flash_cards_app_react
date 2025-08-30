import React from "react";
import {cn} from "../../utils/cn";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const spinnerSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({size = "md", className}) => {
  return <div className={cn("border-2 border-current border-t-transparent rounded-full animate-spin", spinnerSizes[size], className)} role="status" aria-label="Loading" />;
};
