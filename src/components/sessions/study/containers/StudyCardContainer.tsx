import React, {useState} from "react";
import StudyCard, {type StudyMode} from "../cards/StudyCard";
import type {Card as CardType} from "../../../../types/entities";

/**
 * StudyCardContainer - Study session single-card container with interaction-driven progression
 * @level 2 (Feature Component)
 * @coupling Justified: Optimized for study session UX flows
 */

interface StudyCardContainerProps {
  cards: CardType[];
  mode: StudyMode;
  initialCardIndex: number;
  cardRatings: Record<string, "dont_know" | "doubt" | "know">;
  onRating: (cardId: string, rating: "dont_know" | "doubt" | "know") => void;
  onAnswerSubmit?: (cardId: string, answer: string) => void;
  onNoteUpdate?: (cardId: string, note: string) => void;
  onCardChange?: (index: number) => void;
}

const StudyCardContainer: React.FC<StudyCardContainerProps> = ({cards, mode, initialCardIndex, cardRatings, onRating, onAnswerSubmit, onNoteUpdate, onCardChange}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(initialCardIndex);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Get current card - single source of truth
  const currentCard = cards[currentCardIndex];

  // Set initial position only once
  React.useEffect(() => {
    setCurrentCardIndex(initialCardIndex);
  }, [initialCardIndex]);

  const handleRating = (cardId: string, rating: "dont_know" | "doubt" | "know") => {
    onRating(cardId, rating);

    // Progress to next card after rating - clean transition
    setTimeout(() => {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
        setCardFlipped(false); // New card always starts unflipped
        onCardChange?.(currentCardIndex + 1);
      }
    }, 300);
  };

  const handleAnswerSubmit = (answer: string) => {
    if (currentCard && onAnswerSubmit) {
      onAnswerSubmit(currentCard.id, answer);
    }
  };

  const handleNoteUpdate = (note: string) => {
    if (currentCard && onNoteUpdate) {
      onNoteUpdate(currentCard.id, note);
    }
  };

  const handleCardFlip = () => {
    setCardFlipped((prev) => !prev);
  };

  if (cards.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="w-full max-w-sm h-full bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400 mb-2">No cards available</h3>
            <p className="text-neutral-500 dark:text-neutral-400">Add some cards to start studying!</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="w-full max-w-sm h-full bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Session Complete!</h3>
            <p className="text-neutral-500 dark:text-neutral-400">Great job studying!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md h-[600px] relative mx-auto overflow-hidden">
        {/* Single StudyCard - Clean and Simple */}
        <StudyCard key={currentCard.id} card={currentCard} mode={mode} currentRating={cardRatings[currentCard.id]} onRating={(rating) => handleRating(currentCard.id, rating)} onAnswerSubmit={handleAnswerSubmit} onNoteUpdate={handleNoteUpdate} onFlip={handleCardFlip} showBack={cardFlipped} />

        {/* Progress indicator */}
        <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
          <div className="flex space-x-1">
            {cards.map((card, index) => {
              const hasRating = !!cardRatings[card.id];
              const isActive = index === currentCardIndex;
              return <div key={index} className={`h-2 w-2 rounded-full transition-colors ${isActive ? "bg-primary-500" : hasRating ? "bg-success-500" : "bg-neutral-300 dark:bg-neutral-600"}`} />;
            })}
          </div>
        </div>

        {/* Study-specific instructions */}
        <div className="absolute -bottom-24 left-0 right-0 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            Card {currentCardIndex + 1} of {cards.length} • {mode === "flow" ? "Tap to flip • Rate knowledge" : "Answer required • Flip • Rate knowledge"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyCardContainer;
