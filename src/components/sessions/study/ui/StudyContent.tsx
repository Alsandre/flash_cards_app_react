import React from "react";

/**
 * StudyContent - Displays question or answer content
 * @level 1 (Primitive Component)
 * @coupling None - pure display component
 */

interface StudyContentProps {
  content: string;
  className?: string;
}

export const StudyContent: React.FC<StudyContentProps> = ({content, className = ""}) => {
  return (
    <div className={`mt-12 mb-8 text-center ${className}`}>
      <p className="text-2xl font-medium leading-relaxed text-neutral-900 dark:text-neutral-100 sm:text-3xl text-center">{content}</p>
    </div>
  );
};
