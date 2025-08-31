import React, {useEffect, useState, useMemo, useRef} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useGesture} from "@use-gesture/react";
import {useGroups, useAllCards, useCurrentSession, useStartStudySession, useUpdateSessionProgress, useRateCard, useCompleteSession, useLoadCards, useIsLoading, useError, useClearError} from "../store/appStore";
import {Button, Card, LoadingSpinner} from "../components/ui";
import {StudyErrorBoundary} from "../components/study/StudyErrorBoundary";
import type {Card as CardType} from "../types/entities";

export const StudySession: React.FC = () => {
  const {groupId} = useParams<{groupId: string}>();
  const navigate = useNavigate();

  const groups = useGroups();
  const allCards = useAllCards();
  const currentSession = useCurrentSession();

  const cards = useMemo(() => {
    return groupId ? allCards[groupId] || [] : [];
  }, [allCards, groupId]);
  const isLoading = useIsLoading();
  const error = useError();

  const startStudySession = useStartStudySession();
  const updateSessionProgress = useUpdateSessionProgress();
  const rateCard = useRateCard();
  const completeSession = useCompleteSession();
  const loadCards = useLoadCards();
  const clearError = useClearError();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [sessionCards, setSessionCards] = useState<CardType[]>([]);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const group = groups.find((g) => g.id === groupId);

  useEffect(() => {
    if (groupId && !currentSession) {
      startStudySession(groupId);
    }
    if (groupId) {
      loadCards(groupId);
    }
  }, [groupId, startStudySession, loadCards, currentSession]);

  useEffect(() => {
    if (cards.length > 0 && group) {
      // Get cards for study session (limited by studyCardCount)
      const studyCards = cards.slice(0, group.studyCardCount);
      setSessionCards(studyCards);
    }
  }, [cards, group]);

  useEffect(() => {
    if (currentSession) {
      setCurrentCardIndex(currentSession.currentCardIndex);
    }
  }, [currentSession]);

  const handleCardFlip = () => {
    setShowBack(!showBack);
  };

  const handleRating = async (rating: "dont_know" | "doubt" | "know") => {
    if (!currentSession || sessionCards.length === 0) return;

    const currentCard = sessionCards[currentCardIndex];
    if (!currentCard) return;

    try {
      // Rate the card
      await rateCard(currentCard.id, rating);

      // Move to next card or complete session
      const nextIndex = currentCardIndex + 1;

      if (nextIndex >= sessionCards.length) {
        // Session complete
        await completeSession();
        navigate(`/groups/${groupId}`, {
          state: {message: "Study session completed!"},
        });
      } else {
        // Move to next card
        await updateSessionProgress(nextIndex);
        setCurrentCardIndex(nextIndex);
        setShowBack(false);
      }
    } catch (error) {
      console.error("Failed to rate card:", error);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1;
      setCurrentCardIndex(prevIndex);
      setShowBack(false);
      if (currentSession) {
        updateSessionProgress(prevIndex);
      }
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < sessionCards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      setShowBack(false);
      if (currentSession) {
        updateSessionProgress(nextIndex);
      }
    }
  };

  const handleEndSession = async () => {
    const confirmed = window.confirm("Are you sure you want to end this study session?");
    if (confirmed && currentSession) {
      try {
        await completeSession();
        navigate(`/groups/${groupId}`);
      } catch (error) {
        console.error("Failed to end session:", error);
      }
    }
  };

  // Gesture handlers for swipe navigation
  const bind = useGesture(
    {
      onDrag: ({offset: [ox], direction: [dx], velocity: [vx], active, cancel, movement: [mx]}) => {
        // Prevent vertical scrolling during horizontal swipe
        if (Math.abs(mx) > 10) {
          cancel();
        }

        // Update visual feedback during drag with easing
        if (active) {
          // Add resistance when swiping beyond bounds
          let adjustedOffset = ox;
          if ((ox > 0 && currentCardIndex === 0) || (ox < 0 && currentCardIndex === sessionCards.length - 1)) {
            adjustedOffset = ox * 0.3; // Reduce movement when at bounds
          }
          setSwipeOffset(adjustedOffset);
        } else {
          // Handle swipe completion
          const threshold = 80; // Minimum swipe distance
          const velocityThreshold = 0.4; // Minimum swipe velocity

          if (Math.abs(ox) > threshold || Math.abs(vx) > velocityThreshold) {
            if (dx > 0 && currentCardIndex > 0) {
              // Swipe right - previous card
              handlePreviousCard();
            } else if (dx < 0 && currentCardIndex < sessionCards.length - 1) {
              // Swipe left - next card
              handleNextCard();
            }
          }

          // Reset visual feedback with smooth animation
          setSwipeOffset(0);
        }
      },
      onClick: () => {
        // Handle tap to flip card (only if not swiping)
        if (Math.abs(swipeOffset) < 5) {
          handleCardFlip();
        }
      },
    },
    {
      drag: {
        axis: "x", // Only allow horizontal dragging
        bounds: {left: -250, right: 250}, // Increased drag distance
        rubberband: 0.3, // Add resistance at bounds
        filterTaps: true, // Better tap detection
      },
    }
  );

  if (!groupId) {
    return (
      <Card className="mx-auto max-w-md text-center py-12">
        <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">Invalid Group ID</h3>
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">The group ID provided is not valid.</p>
        <Button asChild>
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3 text-neutral-500 dark:text-neutral-400">
          <LoadingSpinner size="md" />
          <span>Starting study session...</span>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <Card className="mx-auto max-w-md text-center py-12">
        <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">Group not found</h3>
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">The requested group could not be found.</p>
        <Button asChild>
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </Card>
    );
  }

  if (sessionCards.length === 0) {
    return (
      <Card className="mx-auto max-w-md text-center py-12">
        <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No cards available</h3>
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">This group doesn't have any cards to study yet.</p>
        <Button asChild>
          <Link to={`/groups/${groupId}`}>Back to Group</Link>
        </Button>
      </Card>
    );
  }

  const currentCard = sessionCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / sessionCards.length) * 100;

  const handleErrorReset = () => {
    // Reset local state and navigate back to group
    setCurrentCardIndex(0);
    setShowBack(false);
    setSwipeOffset(0);
    navigate(`/groups/${groupId}`);
  };

  return (
    <StudyErrorBoundary onReset={handleErrorReset}>
      <div className="mx-auto max-w-4xl px-1 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Studying: {group.name}</h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Focus on each card and rate your knowledge honestly</p>
            </div>
            <Button variant="ghost" onClick={handleEndSession} className="text-error-600 hover:text-error-700">
              End Session
            </Button>
          </div>

          {/* Progress Bar */}
          <Card className="mt-6 p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <span>
                Card {currentCardIndex + 1} of {sessionCards.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div className="h-full bg-primary-500 transition-all duration-500 ease-out" style={{width: `${progress}%`}} />
            </div>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-error-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError} className="text-error-600 hover:text-error-700">
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        {/* Flashcard */}
        <div className="mb-8 relative overflow-hidden">
          <div
            ref={cardRef}
            {...bind()}
            className="touch-pan-y"
            style={{
              transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.1}deg) scale(${1 - Math.abs(swipeOffset) * 0.0005})`,
              transition: swipeOffset === 0 ? "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
              opacity: 1 - Math.abs(swipeOffset) * 0.003,
            }}
          >
            <Card variant="flashcard" className="group min-h-80 cursor-pointer p-8 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] sm:min-h-96 select-none shadow-lg">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">{showBack ? "Back" : "Front"}</div>

                <div className="flex-1 flex items-center justify-center">
                  <p className="text-card-lg font-medium leading-relaxed text-neutral-900 dark:text-neutral-100 sm:text-3xl">{showBack ? currentCard.back : currentCard.front}</p>
                </div>

                {currentCard.hint && !showBack && (
                  <div className="mt-6 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Hint</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{currentCard.hint}</p>
                  </div>
                )}

                {!showBack && (
                  <div className="mt-6 flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <span>Tap to flip • Swipe to navigate</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Swipe background overlay */}
          {Math.abs(swipeOffset) > 10 && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-150"
              style={{
                background: swipeOffset > 0 ? `linear-gradient(to right, rgba(59, 130, 246, ${Math.min(Math.abs(swipeOffset) / 200, 0.2)}), transparent 50%)` : `linear-gradient(to left, rgba(59, 130, 246, ${Math.min(Math.abs(swipeOffset) / 200, 0.2)}), transparent 50%)`,
              }}
            />
          )}

          {/* Swipe indicators */}
          {Math.abs(swipeOffset) > 20 && (
            <>
              {swipeOffset > 0 && currentCardIndex > 0 && (
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-primary-600 dark:text-primary-400 animate-pulse"
                  style={{
                    opacity: Math.min(swipeOffset / 100, 1),
                    transform: `translateY(-50%) scale(${1 + swipeOffset / 500})`,
                  }}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Previous</span>
                </div>
              )}
              {swipeOffset < 0 && currentCardIndex < sessionCards.length - 1 && (
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-primary-600 dark:text-primary-400 animate-pulse"
                  style={{
                    opacity: Math.min(Math.abs(swipeOffset) / 100, 1),
                    transform: `translateY(-50%) scale(${1 + Math.abs(swipeOffset) / 500})`,
                  }}
                >
                  <span className="text-sm font-medium">Next</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <Button variant="ghost" onClick={handlePreviousCard} disabled={currentCardIndex === 0} className="flex items-center space-x-1 min-h-[44px] px-3 sm:space-x-2 sm:px-4">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base">Previous</span>
          </Button>

          <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex space-x-1">
              {sessionCards.map((_, index) => (
                <div key={index} className={`h-2 w-2 rounded-full transition-colors ${index === currentCardIndex ? "bg-primary-500" : index < currentCardIndex ? "bg-success-500" : "bg-neutral-300 dark:bg-neutral-600"}`} />
              ))}
            </div>
          </div>

          <Button variant="ghost" onClick={handleNextCard} disabled={currentCardIndex === sessionCards.length - 1} className="flex items-center space-x-1 min-h-[44px] px-3 sm:space-x-2 sm:px-4">
            <span className="text-sm sm:text-base">Next</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        {/* Rating Buttons */}
        {showBack && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <Button onClick={() => handleRating("dont_know")} className="bg-error-500 hover:bg-error-600 active:bg-error-700 py-3 text-base font-medium min-h-[56px] sm:py-4">
              <div className="flex flex-col items-center space-y-1 sm:space-y-1.5">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm sm:text-base">Don't Know</span>
              </div>
            </Button>

            <Button onClick={() => handleRating("doubt")} className="bg-warning-500 hover:bg-warning-600 active:bg-warning-700 py-3 text-base font-medium min-h-[56px] sm:py-4">
              <div className="flex flex-col items-center space-y-1 sm:space-y-1.5">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm sm:text-base">Doubt</span>
              </div>
            </Button>

            <Button onClick={() => handleRating("know")} className="bg-success-500 hover:bg-success-600 active:bg-success-700 py-3 text-base font-medium min-h-[56px] sm:py-4">
              <div className="flex flex-col items-center space-y-1 sm:space-y-1.5">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base">I Know</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </StudyErrorBoundary>
  );
};
