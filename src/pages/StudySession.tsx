import React, {useEffect, useState, useMemo, useCallback} from "react";
import {useParams, useNavigate, useSearchParams} from "react-router-dom";
import {useGroups, useAllCards, useCurrentSession, useStartExploreSession, useUpdateSessionProgress, useRateCard, useCompleteSession, useLoadCards, useIsLoading, useError, useClearError, useTheme, useSetTheme} from "../store/appStore";
import {Button, Card, LoadingSpinner} from "../components/ui";
import {StudyCardContainer, StudyModal} from "../components/sessions/study";
import type {Card as CardType} from "../types/entities";

/**
 * StudySession - Immersive multi-mode study session page
 * @level 4 (Page Component)
 * @coupling Justified: Route-level session management and mode coordination
 */

type StudyMode = "flow" | "commit" | "validate" | "mastery";

const STUDY_MODE_CONFIG = {
  flow: {
    name: "Flow Mode",
    description: "Free-flowing review without constraints",
    color: "bg-blue-500",
  },
  commit: {
    name: "Commit Mode",
    description: "Answer commitment before reveal",
    color: "bg-green-500",
  },
  validate: {
    name: "Validate Mode",
    description: "Answer validation required",
    color: "bg-yellow-500",
  },
  mastery: {
    name: "Mastery Mode",
    description: "Precise timing and exact answers",
    color: "bg-red-500",
  },
} as const;

export const StudySession: React.FC = () => {
  const {groupId} = useParams<{groupId: string}>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get mode from URL params, default to 'flow'
  const currentMode = (searchParams.get("mode") as StudyMode) || "flow";

  const groups = useGroups();
  const allCards = useAllCards();
  const currentSession = useCurrentSession();
  const theme = useTheme();
  const setTheme = useSetTheme();

  const cards = useMemo(() => {
    const result = groupId ? allCards[groupId] || [] : [];
    return result;
  }, [allCards, groupId]);

  const isLoading = useIsLoading();
  const error = useError();

  const startExploreSession = useStartExploreSession();
  const updateSessionProgress = useUpdateSessionProgress();
  const rateCard = useRateCard();
  const completeSession = useCompleteSession();
  const loadCards = useLoadCards();
  const clearError = useClearError();

  const [sessionCards, setSessionCards] = useState<CardType[]>([]);
  const [cardRatings, setCardRatings] = useState<Record<string, "dont_know" | "doubt" | "know">>({});
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);

  const group = groups.find((g) => g.id === groupId);

  useEffect(() => {
    if (groupId && !currentSession) {
      startExploreSession(groupId);
    }

    // Only load cards if we don't have any for this group
    if (groupId && cards.length === 0) {
      loadCards(groupId);
    }
  }, [groupId, startExploreSession, loadCards, currentSession, cards.length]);

  useEffect(() => {
    if (cards.length > 0 && group) {
      // Get cards for study session (limited by studyCardCount)
      const studyCards = cards.slice(0, group.studyCardCount);

      // Only update if the cards actually changed
      const hasChanged = sessionCards.length !== studyCards.length || (sessionCards.length > 0 && studyCards.length > 0 && (sessionCards[0]?.id !== studyCards[0]?.id || sessionCards[sessionCards.length - 1]?.id !== studyCards[studyCards.length - 1]?.id));

      if (hasChanged) {
        setSessionCards(studyCards);
      }
    }
  }, [cards, group]);

  const handleModeChange = useCallback(
    (newMode: StudyMode) => {
      setSearchParams({mode: newMode});
      setShowModeSelector(false);
    },
    [setSearchParams]
  );

  const handleRating = async (cardId: string, rating: "dont_know" | "doubt" | "know") => {
    try {
      // Update local rating state immediately for UI feedback
      setCardRatings((prev) => ({
        ...prev,
        [cardId]: rating,
      }));

      // Save rating to backend - for now using the same rating system
      await rateCard(cardId, rating);
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

  const handleAnswerSubmit = useCallback((cardId: string, answer: string) => {
    console.log(`Answer submitted for card ${cardId}:`, answer);
    // TODO: Handle answer submission based on mode
    // For now, just log it
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleCardChange = useCallback(
    (index: number) => {
      if (currentSession) {
        updateSessionProgress(index);
      }
    },
    [currentSession, updateSessionProgress]
  );

  const handleEndSession = async () => {
    if (!currentSession) return;

    try {
      await completeSession();
      navigate("/"); // Return to dashboard, not group detail
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  };

  const openEndSessionModal = () => {
    setShowEndSessionModal(true);
  };

  // Early returns for error states
  if (!groupId) {
    return (
      <Card className="mx-auto max-w-md text-center py-12">
        <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">Invalid Group ID</h3>
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">The group ID provided is not valid.</p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
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
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </Card>
    );
  }

  if (sessionCards.length === 0) {
    return (
      <Card className="mx-auto max-w-md text-center py-12">
        <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No cards available</h3>
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">This group doesn't have any cards to study yet.</p>
        <Button onClick={() => navigate(`/groups/${groupId}`)}>Back to Group</Button>
      </Card>
    );
  }

  const progress = currentSession ? ((currentSession.currentCardIndex + 1) / sessionCards.length) * 100 : 0;
  const modeConfig = STUDY_MODE_CONFIG[currentMode];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      {/* Standalone Header - No navigation, immersive focus */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {group.name} - {modeConfig.name}
            </h1>
            <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${modeConfig.color}`}>{currentMode.toUpperCase()}</div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
              {theme === "light" ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowModeSelector(!showModeSelector)} className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
              Change Mode
            </Button>
            <Button variant="ghost" size="sm" onClick={openEndSessionModal} className="text-error-600 hover:text-error-700">
              End Session
            </Button>
          </div>
        </div>

        {/* Mode Selector Dropdown */}
        {showModeSelector && (
          <div className="max-w-4xl mx-auto mt-3 relative">
            <Card className="absolute top-0 right-0 z-10 p-4 min-w-80">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Select Study Mode</h3>
              <div className="space-y-2">
                {Object.entries(STUDY_MODE_CONFIG).map(([mode, config]) => (
                  <button key={mode} onClick={() => handleModeChange(mode as StudyMode)} className={`w-full text-left p-3 rounded-lg border transition-colors ${currentMode === mode ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">{config.name}</div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">{config.description}</div>
                      </div>
                      {currentMode === mode && (
                        <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Progress Bar - Compact for immersive experience */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            <span>
              Card {(currentSession?.currentCardIndex ?? 0) + 1} of {sessionCards.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div className="h-full bg-primary-500 transition-all duration-500 ease-out" style={{width: `${progress}%`}} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
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
        </div>
      )}

      {/* Study Card Container - Full focus */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">{sessionCards.length > 0 && <StudyCardContainer cards={sessionCards} mode={currentMode} initialCardIndex={currentSession?.currentCardIndex ?? 0} cardRatings={cardRatings} onRating={handleRating} onAnswerSubmit={handleAnswerSubmit} onCardChange={handleCardChange} />}</div>
      </div>

      {/* End Session Confirmation Modal */}
      <StudyModal isOpen={showEndSessionModal} onClose={() => setShowEndSessionModal(false)} title="End Study Session" confirmText="End Session" confirmVariant="danger" onConfirm={handleEndSession}>
        <p className="text-neutral-600 dark:text-neutral-400">Are you sure you want to end this study session? Your progress will be saved.</p>
      </StudyModal>
    </div>
  );
};
