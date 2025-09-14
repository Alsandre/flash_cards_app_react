import React from "react";
import {Button} from "../../../ui";

/**
 * StudyFlipButton - Card flip interaction button
 * @level 1 (Primitive Component)
 * @coupling None - pure button component
 */

interface StudyFlipButtonProps {
  onFlip: () => void;
  disabled?: boolean;
  className?: string;
}

export const StudyFlipButton: React.FC<StudyFlipButtonProps> = ({onFlip, disabled = false, className = ""}) => {
  return (
    <div className={`max-w-sm mx-auto mt-6 flex items-center justify-center ${className}`}>
      <Button variant="secondary" onClick={onFlip} className="m-auto bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 px-8 py-3 text-blue-700 dark:text-blue-300" disabled={disabled}>
        Tap to Flip
      </Button>
    </div>
  );
};
