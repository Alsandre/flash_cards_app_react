import React from "react";
import {Input} from "../../../ui";

/**
 * StudyNote - Note input field component
 * @level 1 (Primitive Component)
 * @coupling None - pure input handling
 */

interface StudyNoteProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const StudyNote: React.FC<StudyNoteProps> = ({value, onChange, disabled = false, placeholder = "Place your note here", className = ""}) => {
  return (
    <div className={`max-w-sm mx-auto mb-4 ${className}`}>
      <Input type="text" placeholder={placeholder} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} disabled={disabled} maxLength={80} className="w-full text-center placeholder:italic bg-neutral-50/50 dark:bg-neutral-800/50" />
    </div>
  );
};
