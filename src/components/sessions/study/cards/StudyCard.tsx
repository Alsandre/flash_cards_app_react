import React, {useState} from "react";
import {Button, Input} from "../../../ui";
import type {Card as CardType} from "../../../../types/entities";

/**
 * StudyCard - Study-specific card component with answer input and mode-aware behavior
 * @level 2 (Feature Component)
 * @coupling None - pure props-based interaction
 */

export type StudyMode = "flow" | "commit" | "validate" | "mastery";

interface StudyCardProps {
  card: CardType;
  mode: StudyMode;
  currentRating?: "dont_know" | "doubt" | "know";
  onRating: (rating: "dont_know" | "doubt" | "know") => void;
  onAnswerSubmit?: (answer: string) => void;
  onFlip?: () => void;
  showBack: boolean;
  disabled?: boolean;
}

const StudyCard: React.FC<StudyCardProps> = ({card, mode, currentRating, onRating, onAnswerSubmit, onFlip, showBack, disabled = false}) => {
  const [answerInput, setAnswerInput] = useState("");
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);

  const handleCardClick = () => {
    if (disabled || showBack) return;

    // Mode-specific flip logic
    switch (mode) {
      case "flow":
        // FlowMode: Can flip freely
        onFlip?.();
        break;
      case "commit":
        // CommitMode: Can only flip if answer is provided
        if (hasSubmittedAnswer) {
          onFlip?.();
        }
        break;
      case "validate":
      case "mastery":
        // These modes handle flipping via validation logic
        break;
    }
  };

  const handleAnswerSubmit = () => {
    if (!answerInput.trim()) return;

    setHasSubmittedAnswer(true);
    onAnswerSubmit?.(answerInput.trim());
  };

  const handleRating = (rating: "dont_know" | "doubt" | "know", e: React.MouseEvent) => {
    e.stopPropagation();
    onRating(rating);
  };

  const canFlip = () => {
    switch (mode) {
      case "flow":
        return true;
      case "commit":
        return hasSubmittedAnswer;
      case "validate":
      case "mastery":
        return false; // These modes control flipping internally
      default:
        return true;
    }
  };

  const showAnswerInput = mode !== "flow";
  const requireAnswerToFlip = mode === "commit" || mode === "validate" || mode === "mastery";

  return (
    <div className="relative w-full h-full perspective-1000">
      <div
        className={`
          relative w-full h-full transform-style-preserve-3d transition-transform duration-600
          ${showBack ? "rotate-y-180" : ""}
        `}
      >
        {/* Front Side - Question */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-800 ${canFlip() ? "cursor-pointer" : ""}`} onClick={handleCardClick}>
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            {/* Mode indicator */}
            <div className="mb-4 inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</div>

            {/* Question content */}
            <div className="flex-1 flex items-center justify-center text-center mb-6">
              <p className="text-2xl font-medium leading-relaxed text-neutral-900 dark:text-neutral-100 sm:text-3xl">{card.front}</p>
            </div>

            {/* Hint section */}
            {card.hint && (
              <div className="mb-6 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50 w-full max-w-md">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Hint</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{card.hint}</p>
              </div>
            )}

            {/* Answer Input - Show for all modes except flow */}
            {showAnswerInput && !showBack && (
              <div className="w-full max-w-md mb-6">
                <div className="flex space-x-2">
                  <Input type="text" placeholder="Your answer..." value={answerInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnswerInput(e.target.value)} onKeyPress={(e: React.KeyboardEvent) => e.key === "Enter" && handleAnswerSubmit()} disabled={hasSubmittedAnswer || disabled} className="flex-1" />
                  <Button onClick={handleAnswerSubmit} disabled={!answerInput.trim() || hasSubmittedAnswer || disabled} size="sm">
                    Submit
                  </Button>
                </div>
                {requireAnswerToFlip && !hasSubmittedAnswer && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">Answer required to continue</p>}
              </div>
            )}

            {/* Interaction hint */}
            <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>{canFlip() ? "Tap to reveal answer" : "Complete answer to continue"}</span>
            </div>

            {/* Flip indicator */}
            {canFlip() && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-primary-500/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Back Side - Answer with Rating Buttons */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col p-8">
            {/* Back indicator */}
            <div className="mb-4 inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400 self-center">Answer</div>

            {/* Submitted answer display (for commit+ modes) */}
            {showAnswerInput && hasSubmittedAnswer && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Your Answer:</p>
                <p className="text-sm text-blue-900 dark:text-blue-100">{answerInput}</p>
              </div>
            )}

            {/* Correct answer */}
            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-2xl font-medium leading-relaxed text-neutral-900 dark:text-neutral-100 sm:text-3xl">{card.back}</p>
            </div>

            {/* Rating Buttons */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 mt-8">
              <button
                onClick={(e) => handleRating("dont_know", e)}
                disabled={disabled}
                className={`w-full backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-4 px-3
                         transition-all duration-200 hover:scale-105 border-2 disabled:opacity-50 disabled:hover:scale-100 ${currentRating === "dont_know" ? "bg-error-500/40 border-error-500 text-error-800 dark:text-error-200" : "bg-error-500/20 border-error-400/30 text-error-700 dark:text-error-300 hover:bg-error-500/40"}`}
              >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-medium">Don't Know</span>
              </button>

              <button
                onClick={(e) => handleRating("doubt", e)}
                disabled={disabled}
                className={`w-full backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-4 px-3
                         transition-all duration-200 hover:scale-105 border-2 disabled:opacity-50 disabled:hover:scale-100 ${currentRating === "doubt" ? "bg-warning-500/40 border-warning-500 text-warning-800 dark:text-warning-200" : "bg-warning-500/20 border-warning-400/30 text-warning-700 dark:text-warning-300 hover:bg-warning-500/40"}`}
              >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Doubt</span>
              </button>

              <button
                onClick={(e) => handleRating("know", e)}
                disabled={disabled}
                className={`w-full backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-4 px-3
                         transition-all duration-200 hover:scale-105 border-2 disabled:opacity-50 disabled:hover:scale-100 ${currentRating === "know" ? "bg-success-500/40 border-success-500 text-success-800 dark:text-success-200" : "bg-success-500/20 border-success-400/30 text-success-700 dark:text-success-300 hover:bg-success-500/40"}`}
              >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">I Know</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCard;
