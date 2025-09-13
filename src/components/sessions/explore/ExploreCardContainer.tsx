import React, {useRef, useCallback, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {EffectCards, Navigation} from "swiper/modules";
import type {Swiper as SwiperType} from "swiper";

// Import Swiper styles
import "swiper/swiper-bundle.css";

import ExploreCard from "./ExploreCard";
import type {Card as CardType} from "../../../types/entities";

interface ExploreCardContainerProps {
  cards: CardType[];
  initialCardIndex: number;
  cardRatings: Record<string, "dont_know" | "doubt" | "know">;
  onRating: (cardId: string, rating: "dont_know" | "doubt" | "know") => void;
  onCardChange?: (index: number) => void;
}

const ExploreCardContainer: React.FC<ExploreCardContainerProps> = ({cards, initialCardIndex, cardRatings, onRating, onCardChange}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // TypeScript-compliant callback to store swiper instance
  const setSwiperRef = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
  }, []);

  // Set initial position only once
  React.useEffect(() => {
    if (swiperRef.current && initialCardIndex > 0) {
      swiperRef.current.slideTo(initialCardIndex, 0); // 0 = no animation
    }
  }, [initialCardIndex]); // Run when swiper is ready or initial index changes

  const handleRating = (cardId: string, rating: "dont_know" | "doubt" | "know") => {
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

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const newIndex = swiper.activeIndex;

      // Notify parent of card change
      onCardChange?.(newIndex);

      // Reset flip state when changing cards - optimized for performance
      setFlippedCards((prev) => {
        if (prev.has(newIndex)) {
          const newSet = new Set(prev);
          newSet.delete(newIndex);
          return newSet;
        }
        return prev;
      });
    },
    [onCardChange]
  );

  if (cards.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="w-full max-w-sm h-full bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400 mb-2">No cards available</h3>
            <p className="text-neutral-500 dark:text-neutral-400">Add some cards to start exploring!</p>
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
          // Performance optimizations for mobile
          speed={300}
          resistance={true}
          resistanceRatio={0.85}
          touchRatio={1}
          touchAngle={45}
          simulateTouch={true}
          allowTouchMove={true}
          // Desktop navigation
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
            disabledClass: "swiper-button-disabled-custom",
          }}
          className="w-full h-full rounded-2xl swiper-cards-container"
          initialSlide={initialCardIndex}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={card.id} className="rounded-2xl">
              <ExploreCard card={card} currentRating={cardRatings[card.id]} onRating={(rating) => handleRating(card.id, rating)} onFlip={handleCardFlip} showBack={flippedCards.has(index)} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons - Hidden on Mobile, Visible on Tablet+ */}
        <button
          className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 
                         hidden md:flex items-center justify-center w-12 h-12 rounded-full 
                         bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm
                         shadow-lg hover:shadow-xl transition-all duration-200
                         border border-neutral-200 dark:border-neutral-700
                         hover:bg-white dark:hover:bg-neutral-800 hover:scale-105
                         text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10
                         hidden md:flex items-center justify-center w-12 h-12 rounded-full 
                         bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm
                         shadow-lg hover:shadow-xl transition-all duration-200
                         border border-neutral-200 dark:border-neutral-700
                         hover:bg-white dark:hover:bg-neutral-800 hover:scale-105
                         text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Progress indicator - will be updated by parent's currentSession */}
        <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
          <div className="flex space-x-1">
            {cards.map((card, index) => {
              const hasRating = !!cardRatings[card.id];
              return <div key={index} className={`h-2 w-2 rounded-full transition-colors ${hasRating ? "bg-success-500" : "bg-neutral-300 dark:bg-neutral-600"}`} />;
            })}
          </div>
        </div>

        {/* Navigation instructions - responsive */}
        <div className="absolute -bottom-24 left-0 right-0 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            <span className="md:hidden">Tap card to flip • Swipe to navigate • Rate your knowledge</span>
            <span className="hidden md:inline">Tap card to flip • Click arrows or swipe to navigate • Rate your knowledge</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExploreCardContainer;
