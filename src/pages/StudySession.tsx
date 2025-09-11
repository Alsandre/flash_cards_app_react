import React, {useEffect, useState, useMemo, useCallback} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useGroups, useAllCards, useCurrentSession, useStartStudySession, useUpdateSessionProgress, useRateCard, useCompleteSession, useLoadCards, useIsLoading, useError, useClearError} from "../store/appStore";
import {Button, Card, LoadingSpinner} from "../components/ui";
import {StudyErrorBoundary} from "../components/study/StudyErrorBoundary";
import StudyCardContainer from "../components/study/StudyCardContainer";
import type {Card as CardType} from "../types/entities";

export const StudySession: React.FC = () => {
  console.log("🔄 StudySession: Component rendering");
  const {groupId} = useParams<{groupId: string}>();
  const navigate = useNavigate();

  const groups = useGroups();
  const allCards = useAllCards();
  const currentSession = useCurrentSession();

  const cards = useMemo(() => {
    const result = groupId ? allCards[groupId] || [] : [];
    console.log("🎯 StudySession: Cards memoized", {
      groupId,
      cardsLength: result.length,
      timestamp: new Date().toISOString().split("T")[1],
    });
    return result;
  }, [allCards, groupId]);
  const isLoading = useIsLoading();
  const error = useError();

  const startStudySession = useStartStudySession();
  const updateSessionProgress = useUpdateSessionProgress();
  const rateCard = useRateCard();
  const completeSession = useCompleteSession();
  const loadCards = useLoadCards();
  const clearError = useClearError();

  const [sessionCards, setSessionCards] = useState<CardType[]>([]);
  const [cardRatings, setCardRatings] = useState<Record<string, "dont_know" | "doubt" | "know">>({});

  const group = groups.find((g) => g.id === groupId);

  // Debug logging for state changes
  console.log("🔍 StudySession: State snapshot", {
    groupId,
    sessionCardsLength: sessionCards.length,
    groupExists: !!group,
    currentSessionExists: !!currentSession,
    isLoading,
    error,
    ratingsCount: Object.keys(cardRatings).length,
    timestamp: new Date().toISOString().split("T")[1],
  });

  useEffect(() => {
    console.log("🚀 StudySession: Session setup effect triggered", {
      groupId,
      hasCurrentSession: !!currentSession,
      willStartSession: !!(groupId && !currentSession),
      willLoadCards: !!(groupId && cards.length === 0),
    });

    if (groupId && !currentSession) {
      console.log("📝 StudySession: Starting study session for group", groupId);
      startStudySession(groupId);
    }

    // Only load cards if we don't have any for this group
    if (groupId && cards.length === 0) {
      console.log("📚 StudySession: Loading cards for group", groupId);
      loadCards(groupId);
    } else if (groupId && cards.length > 0) {
      console.log("⏭️ StudySession: Cards already loaded, skipping load");
    }
  }, [groupId, startStudySession, loadCards, currentSession, cards.length]);

  useEffect(() => {
    console.log("📋 StudySession: Cards setup effect triggered", {
      cardsLength: cards.length,
      hasGroup: !!group,
      studyCardCount: group?.studyCardCount,
      currentSessionCardsLength: sessionCards.length,
    });

    if (cards.length > 0 && group) {
      // Get cards for study session (limited by studyCardCount)
      const studyCards = cards.slice(0, group.studyCardCount);

      // Only update if the cards actually changed (check length and first/last card IDs)
      const hasChanged = sessionCards.length !== studyCards.length || (sessionCards.length > 0 && studyCards.length > 0 && (sessionCards[0]?.id !== studyCards[0]?.id || sessionCards[sessionCards.length - 1]?.id !== studyCards[studyCards.length - 1]?.id));

      if (hasChanged) {
        console.log("✅ StudySession: Setting session cards", {
          totalCards: cards.length,
          studyCardsCount: studyCards.length,
          studyCardLimit: group.studyCardCount,
        });
        setSessionCards(studyCards);
      } else {
        console.log("⏭️ StudySession: Session cards unchanged, skipping update");
      }
    }
  }, [cards, group]);

  const handleRating = async (cardId: string, rating: "dont_know" | "doubt" | "know") => {
    console.log("⭐ StudySession: Rating card", cardId, "as", rating);

    try {
      // Update local rating state immediately for UI feedback
      setCardRatings((prev) => ({
        ...prev,
        [cardId]: rating,
      }));

      // Save rating to backend
      await rateCard(cardId, rating);
      console.log("✅ StudySession: Rating saved successfully");
    } catch (error) {
      console.error("❌ StudySession: Failed to rate card:", error);
      // Revert local state on error
      setCardRatings((prev) => {
        const newRatings = {...prev};
        delete newRatings[cardId];
        return newRatings;
      });
    }
  };

  const handleCardChange = useCallback(
    (index: number) => {
      console.log("🔄 StudySession: Card change to index", index);

      if (currentSession) {
        console.log("📊 StudySession: Updating session progress to", index);
        updateSessionProgress(index);
      }
    },
    [currentSession, updateSessionProgress]
  );

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

  const progress = currentSession ? ((currentSession.currentCardIndex + 1) / sessionCards.length) * 100 : 0;

  const handleErrorReset = () => {
    // Reset local state and navigate back to group
    setCardRatings({});
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
                Card {(currentSession?.currentCardIndex ?? 0) + 1} of {sessionCards.length}
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

        {/* Study Card Container */}
        <div className="mb-8">{sessionCards.length > 0 && <StudyCardContainer cards={sessionCards} initialCardIndex={currentSession?.currentCardIndex ?? 0} cardRatings={cardRatings} onRating={handleRating} onCardChange={handleCardChange} />}</div>
      </div>
    </StudyErrorBoundary>
  );
};
