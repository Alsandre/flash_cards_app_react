import React, {useState} from "react";
import type {Card as CardType} from "../../../../types/entities";
import {StudyContent, StudyHint, StudyNote, StudyAnswer, StudyFlipButton, StudyRatingButtons} from "../ui";

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
  onNoteUpdate?: (note: string) => void;
  onFlip?: () => void;
  showBack: boolean;
  disabled?: boolean;
}

const StudyCard: React.FC<StudyCardProps> = ({card, mode, currentRating, onRating, onAnswerSubmit, onNoteUpdate, onFlip, showBack, disabled = false}) => {
  const [answerInput, setAnswerInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
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

    // Save note if provided
    if (noteInput.trim() && onNoteUpdate) {
      onNoteUpdate(noteInput.trim());
    }

    onRating(rating);

    // TODO: Move to next card automatically after rating
    // This will require parent component to handle card advancement
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
        <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-800 ${canFlip() ? "cursor-pointer" : ""}`}>
          <div className="w-full h-full flex flex-col items-center justify-between p-2">
            {/* Content Group */}
            <div className="w-full flex flex-col items-center justify-center">
              <StudyContent content={card.front} />
              <StudyHint hint={card.hint} />
            </div>

            {/* Input Group */}
            <div className="mt-8 w-full">
              <StudyNote value={noteInput} onChange={setNoteInput} disabled={disabled} />

              {!showBack && <StudyAnswer mode="input" value={answerInput} onChange={setAnswerInput} onSubmit={handleAnswerSubmit} showSubmit={mode !== "flow"} hasSubmitted={hasSubmittedAnswer} disabled={disabled} placeholder="Your answer" />}

              {requireAnswerToFlip && !hasSubmittedAnswer && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">Answer required to continue</p>}

              {canFlip() && <StudyFlipButton onFlip={handleCardClick} disabled={disabled} />}

              {!canFlip() && (
                <div className="max-w-sm mx-auto mt-6 flex items-center justify-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l .777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <span>Complete answer to continue</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Side - Answer with Rating Buttons */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="w-full h-full flex flex-col items-center justify-between p-2">
            {/* Content Group */}
            <div className="w-full flex flex-col items-center justify-center">
              <StudyContent content={card.back} />
              <StudyHint hint={card.hint} />
            </div>

            {/* Input Group */}
            <div className="mt-8 w-full">
              <StudyNote value={noteInput} onChange={setNoteInput} disabled={disabled} />

              <StudyAnswer mode="display" value={answerInput || "No answer provided"} />

              <StudyRatingButtons onRating={(rating) => handleRating(rating, {stopPropagation: () => {}} as React.MouseEvent)} currentRating={currentRating} disabled={disabled} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCard;
