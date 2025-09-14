import React from "react";
import {Input, Button} from "../../../ui";

/**
 * StudyAnswer - Answer input (front) or display (back) component
 * @level 1 (Primitive Component)
 * @coupling None - pure answer handling
 */

interface StudyAnswerInputProps {
  mode: "input";
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  showSubmit?: boolean;
  hasSubmitted?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

interface StudyAnswerDisplayProps {
  mode: "display";
  value?: string;
  className?: string;
}

type StudyAnswerProps = StudyAnswerInputProps | StudyAnswerDisplayProps;

export const StudyAnswer: React.FC<StudyAnswerProps> = (props) => {
  if (props.mode === "display") {
    if (!props.value) return null;

    return (
      <div className={`max-w-sm mx-auto mb-4 ${props.className || ""}`}>
        <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Your Answer:</p>
          <p className="text-sm text-blue-900 dark:text-blue-100">{props.value}</p>
        </div>
      </div>
    );
  }

  const {value, onChange, onSubmit, showSubmit = false, hasSubmitted = false, disabled = false, placeholder = "Your answer", className = ""} = props;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={`max-w-sm mx-auto mb-4 ${className}`}>
      <div className="flex space-x-2">
        <Input type="text" placeholder={placeholder} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} onKeyPress={handleKeyPress} disabled={hasSubmitted || disabled} className="text-center placeholder:italic bg-blue-50/30 dark:bg-blue-900/20" />
        {showSubmit && (
          <Button onClick={onSubmit} disabled={!value.trim() || hasSubmitted || disabled} size="sm">
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};
