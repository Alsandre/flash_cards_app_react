import React from "react";
import {cn} from "../../utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "flashcard";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const cardVariants = {
  default: "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-card",
  interactive: "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer",
  flashcard: "bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 shadow-card-hover",
};

const cardPadding = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card: React.FC<CardProps> = ({variant = "default", padding = "md", className, children, ...props}) => {
  return (
    <div className={cn("rounded-card", cardVariants[variant], cardPadding[padding], className)} {...props}>
      {children}
    </div>
  );
};
