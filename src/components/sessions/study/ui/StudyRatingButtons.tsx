import React from "react";

/**
 * StudyRatingButtons - Rating button grid component
 * @level 1 (Primitive Component)
 * @coupling None - pure rating interaction
 */

type StudyRating = "easy" | "medium" | "hard";

interface StudyRatingButtonsProps {
  onRating: (rating: StudyRating) => void;
  currentRating?: StudyRating;
  disabled?: boolean;
  className?: string;
}

export const StudyRatingButtons: React.FC<StudyRatingButtonsProps> = ({onRating, currentRating, disabled = false, className = ""}) => {
  const handleRating = (rating: StudyRating, e: React.MouseEvent) => {
    e.stopPropagation();
    onRating(rating);
  };

  return (
    <div className={`max-w-sm mx-auto grid grid-cols-3 gap-3 mt-6 ${className}`}>
      <button
        onClick={(e) => handleRating("hard", e)}
        disabled={disabled}
        className={`w-full backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-3 px-2
                  transition-all duration-200 hover:scale-105 border-2 disabled:opacity-50 disabled:hover:scale-100 ${currentRating === "hard" ? "bg-error-500/40 border-error-500 text-error-800 dark:text-error-200" : "bg-error-500/20 border-error-400/30 text-error-700 dark:text-error-300 hover:bg-error-500/40"}`}
      >
        <span className="text-sm font-medium">Hard</span>
      </button>

      <button
        onClick={(e) => handleRating("medium", e)}
        disabled={disabled}
        className={`w-full backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-3 px-2
                  transition-all duration-200 hover:scale-105 border-2 disabled:opacity-50 disabled:hover:scale-100 ${currentRating === "medium" ? "bg-warning-500/40 border-warning-500 text-warning-800 dark:text-warning-200" : "bg-warning-500/20 border-warning-400/30 text-warning-700 dark:text-warning-300 hover:bg-warning-500/40"}`}
      >
        <span className="text-sm font-medium">Medium</span>
      </button>

      <button
        onClick={(e) => handleRating("easy", e)}
        disabled={disabled}
        className={`w-full backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-3 px-2
                  transition-all duration-200 hover:scale-105 border-2 disabled:opacity-50 disabled:hover:scale-100 ${currentRating === "easy" ? "bg-success-500/40 border-success-500 text-success-800 dark:text-success-200" : "bg-success-500/20 border-success-400/30 text-success-700 dark:text-success-300 hover:bg-success-500/40"}`}
      >
        <span className="text-sm font-medium">Easy</span>
      </button>
    </div>
  );
};
