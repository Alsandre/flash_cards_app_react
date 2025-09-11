import React from "react";
import type {Card as CardType} from "../../types/entities";

interface StudyCardProps {
  card: CardType;
  currentRating?: "dont_know" | "doubt" | "know";
  onRating: (rating: "dont_know" | "doubt" | "know") => void;
  onFlip?: () => void;
  showBack: boolean;
}

const StudyCard: React.FC<StudyCardProps> = ({card, currentRating, onRating, onFlip, showBack}) => {
  const handleCardClick = () => {
    if (!showBack) {
      onFlip?.();
    }
  };

  const handleRating = (rating: "dont_know" | "doubt" | "know", e: React.MouseEvent) => {
    e.stopPropagation();
    onRating(rating);
  };

  return (
    <div className="relative w-full h-full perspective-1000">
      <div
        className={`
          relative w-full h-full transform-style-preserve-3d transition-transform duration-600
          ${showBack ? "rotate-y-180" : ""}
        `}
      >
        {/* Front Side - Question */}
        <div className="absolute inset-0 w-full h-full backface-hidden cursor-pointer rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-800" onClick={handleCardClick}>
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            {/* Front/Back indicator */}
            <div className="mb-4 inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">Front</div>

            {/* Question content */}
            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-2xl font-medium leading-relaxed text-neutral-900 dark:text-neutral-100 sm:text-3xl">{card.front}</p>
            </div>

            {/* Hint section */}
            {card.hint && (
              <div className="mt-6 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Hint</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{card.hint}</p>
              </div>
            )}

            {/* Interaction hint */}
            <div className="mt-6 flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>Tap to reveal answer</span>
            </div>

            {/* Subtle flip indicator */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-primary-500/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Back Side - Answer with Rating Buttons */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col p-8">
            {/* Back indicator */}
            <div className="mb-4 inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400 self-center">Back</div>

            {/* Answer content */}
            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-2xl font-medium leading-relaxed text-neutral-900 dark:text-neutral-100 sm:text-3xl">{card.back}</p>
            </div>

            {/* Rating Buttons */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 mt-8">
              <button
                onClick={(e) => handleRating("dont_know", e)}
                className={`w-full backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-4 px-3
                         transition-all duration-200 hover:scale-105 border-2 ${currentRating === "dont_know" ? "bg-error-500/40 border-error-500 text-error-800 dark:text-error-200" : "bg-error-500/20 border-error-400/30 text-error-700 dark:text-error-300 hover:bg-error-500/40"}`}
              >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-medium">Don't Know</span>
              </button>

              <button
                onClick={(e) => handleRating("doubt", e)}
                className={`w-full backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-4 px-3
                         transition-all duration-200 hover:scale-105 border-2 ${currentRating === "doubt" ? "bg-warning-500/40 border-warning-500 text-warning-800 dark:text-warning-200" : "bg-warning-500/20 border-warning-400/30 text-warning-700 dark:text-warning-300 hover:bg-warning-500/40"}`}
              >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Doubt</span>
              </button>

              <button
                onClick={(e) => handleRating("know", e)}
                className={`w-full backdrop-blur-sm rounded-xl flex flex-col items-center justify-center py-4 px-3
                         transition-all duration-200 hover:scale-105 border-2 ${currentRating === "know" ? "bg-success-500/40 border-success-500 text-success-800 dark:text-success-200" : "bg-success-500/20 border-success-400/30 text-success-700 dark:text-success-300 hover:bg-success-500/40"}`}
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
