import React, {useRef, useCallback, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {EffectCards, Navigation} from "swiper/modules";
import type {Swiper as SwiperType} from "swiper";

// Import Swiper styles
import "swiper/swiper-bundle.css";

import StudyCard from "./StudyCard";
import type {Card as CardType} from "../../types/entities";

interface StudyCardContainerProps {
  cards: CardType[];
  initialCardIndex: number;
  cardRatings: Record<string, "dont_know" | "doubt" | "know">;
  onRating: (cardId: string, rating: "dont_know" | "doubt" | "know") => void;
  onCardChange?: (index: number) => void;
}

const StudyCardContainer: React.FC<StudyCardContainerProps> = ({cards, initialCardIndex, cardRatings, onRating, onCardChange}) => {
  console.log("🎴 StudyCardContainer: Component rendering", {
    cardsLength: cards.length,
    initialCardIndex,
    ratingsCount: Object.keys(cardRatings).length,
    timestamp: new Date().toISOString().split("T")[1],
  });

  const swiperRef = useRef<SwiperType | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // TypeScript-compliant callback to store swiper instance
  const setSwiperRef = useCallback((swiper: SwiperType) => {
    console.log("🎴 StudyCardContainer: Swiper instance set");
    swiperRef.current = swiper;
  }, []);

  // Set initial position only once
  React.useEffect(() => {
    if (swiperRef.current && initialCardIndex > 0) {
      console.log("🎴 StudyCardContainer: Setting initial position to", initialCardIndex);
      swiperRef.current.slideTo(initialCardIndex, 0); // 0 = no animation
    }
  }, [initialCardIndex]); // Run when swiper is ready or initial index changes

  const handleRating = (cardId: string, rating: "dont_know" | "doubt" | "know") => {
    console.log("⭐ StudyCardContainer: Rating triggered", {
      rating,
      cardId,
    });

    onRating(cardId, rating);
  };

  const handleCardFlip = () => {
    // Get current active slide index from swiper
    const activeIndex = swiperRef.current?.activeIndex ?? 0;
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activeIndex)) {
        newSet.delete(activeIndex);
      } else {
        newSet.add(activeIndex);
      }
      return newSet;
    });
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    console.log("🎴 StudyCardContainer: Slide change detected", {
      to: newIndex,
      via: "swipe",
    });

    // Always notify parent of card change
    onCardChange?.(newIndex);

    // Reset flip state when changing cards via swipe
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      newSet.delete(newIndex);
      console.log("🔄 StudyCardContainer: Reset flip state for card", newIndex);
      return newSet;
    });
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

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md h-[600px] relative mx-auto overflow-hidden">
        <Swiper
          onSwiper={setSwiperRef}
          onSlideChange={handleSlideChange}
          effect="cards"
          grabCursor={true}
          modules={[EffectCards, Navigation]}
          cardsEffect={{
            perSlideOffset: 8,
            perSlideRotate: 2,
            rotate: true,
            slideShadows: true,
          }}
          className="w-full h-full rounded-2xl"
          initialSlide={initialCardIndex}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={card.id} className="rounded-2xl">
              <StudyCard card={card} currentRating={cardRatings[card.id]} onRating={(rating) => handleRating(card.id, rating)} onFlip={handleCardFlip} showBack={flippedCards.has(index)} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Progress indicator - will be updated by parent's currentSession */}
        <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
          <div className="flex space-x-1">
            {cards.map((card, index) => {
              const hasRating = !!cardRatings[card.id];
              return <div key={index} className={`h-2 w-2 rounded-full transition-colors ${hasRating ? "bg-success-500" : "bg-neutral-300 dark:bg-neutral-600"}`} />;
            })}
          </div>
        </div>

        {/* Navigation instructions */}
        <div className="absolute -bottom-24 left-0 right-0 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Tap card to flip • Swipe to navigate • Rate your knowledge</p>
        </div>
      </div>
    </div>
  );
};

export default StudyCardContainer;
