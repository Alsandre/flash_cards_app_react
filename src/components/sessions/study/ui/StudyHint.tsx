import React from "react";
import {Input} from "../../../ui";

/**
 * StudyHint - Displays or edits hint text
 * @level 1 (Primitive Component)
 * @coupling None - pure hint handling
 */

interface StudyHintProps {
  hint?: string;
  editable?: boolean;
  onHintChange?: (hint: string) => void;
  disabled?: boolean;
  className?: string;
}

export const StudyHint: React.FC<StudyHintProps> = ({hint, editable = false, onHintChange, disabled = false, className = ""}) => {
  if (!hint && !editable) return null;

  if (editable) {
    return (
      <div className={`mb-8 text-center w-full ${className}`}>
        <Input type="text" placeholder="Add your hint..." value={hint || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onHintChange?.(e.target.value)} disabled={disabled} className="text-sm text-center placeholder:italic bg-yellow-50/50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" />
      </div>
    );
  }

  return (
    <div className={`mb-8 text-center max-w-sm mx-auto ${className}`}>
      <p className="text-sm italic text-neutral-400 dark:text-neutral-500">{hint}</p>
    </div>
  );
};
