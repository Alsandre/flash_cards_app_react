import React, {useEffect, useState, useMemo, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {selectAllGroups, selectGroupsLoading, selectGroupsError} from "../store/selectors/groupSelectors";
import {selectAllCards} from "../store/selectors/cardSelectors";
import {selectTheme} from "../store/selectors/uiSelectors";
import {selectIsStudySessionActive, selectStudyProgress, selectSessionRatings} from "../store/selectors/sessionSelectors";
import {loadGroups} from "../store/slices/groupSlice";
import {loadCards} from "../store/slices/cardSlice";
import {uiActions} from "../store/slices/uiSlice";
import {sessionActions} from "../store/slices/sessionSlice";
import {Button, Card, LoadingSpinner} from "../components/ui";
import {StudyCardContainer, StudyModal} from "../components/sessions/study";

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
  const {groupId, mode} = useParams<{groupId: string; mode: string}>();
  const navigate = useNavigate();

  // Get mode from URL params, fallback to 'flow' if invalid
  const currentMode = (mode as StudyMode) || "flow";

  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectAllGroups);
  const allCards = useAppSelector(selectAllCards);
  const theme = useAppSelector(selectTheme);
  const isLoading = useAppSelector(selectGroupsLoading);
  const error = useAppSelector(selectGroupsError);

  // Redux session selectors
  const isSessionActive = useAppSelector(selectIsStudySessionActive);
  const studyProgress = useAppSelector(selectStudyProgress);
  const sessionRatings = useAppSelector(selectSessionRatings);

  const cards = useMemo(() => {
    return groupId ? allCards.filter((card) => card.groupId === groupId) : [];
  }, [allCards, groupId]);

  const sessionCards = useMemo(() => {
    // Get cards for study session based on current cards
    return cards.slice(0, 20); // Limit study sessions to 20 cards for now
  }, [cards]);

  const [showEndSessionModal, setShowEndSessionModal] = useState(false);

  // Remove unused local state - now managed by Redux
  // const [sessionCards, setSessionCards] = useState<CardType[]>([]);
  // const [cardRatings, setCardRatings] = useState<Record<string, "dont_know" | "doubt" | "know">>({});

  const group = groups.find((g) => g.id === groupId);

  useEffect(() => {
    if (groupId && groups.length === 0) {
      dispatch(loadGroups());
    }
    if (groupId && allCards.length === 0) {
      dispatch(loadCards());
    }
  }, [groupId, groups.length, allCards.length, dispatch]);

  // Initialize study session when cards are available
  useEffect(() => {
    if (groupId && sessionCards.length > 0 && !isSessionActive) {
      const cardIds = sessionCards.map((card) => card.id);
      dispatch(sessionActions.startStudySession({cardIds}));
    }
  }, [groupId, sessionCards, isSessionActive, dispatch]);

  // This effect is removed - sessionCards are now managed by Redux

  const handleRating = useCallback(
    (cardId: string, rating: "easy" | "medium" | "hard") => {
      // Save rating to Redux session state
      dispatch(sessionActions.rateCard({cardId, rating}));

      // Advance to next card automatically
      dispatch(sessionActions.nextCard());
    },
    [dispatch]
  );

  const handleAnswerSubmit = useCallback(
    (cardId: string, answer: string) => {
      // Save answer to Redux session state
      dispatch(sessionActions.submitAnswer({cardId, answer}));

      // Flip the card to show the answer
      dispatch(sessionActions.flipCard());
    },
    [dispatch]
  );

  const handleNoteUpdate = useCallback((cardId: string, note: string) => {
    // TODO: Handle note updates - could be saved to card or session notes
    // This could be enhanced to save to card.userNote
  }, []);

  const toggleTheme = () => {
    dispatch(uiActions.setTheme(theme === "light" ? "dark" : "light"));
  };

  const handleCardChange = useCallback((index: number) => {
    // Card navigation is now handled by Redux session actions
    // This callback is mainly for any additional side effects
  }, []);

  const handleEndSession = async () => {
    if (!isSessionActive) return;

    try {
      dispatch(sessionActions.endStudySession());
      navigate(`/study/${groupId}`); // Return to study mode selection
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

  const progress = isSessionActive ? studyProgress.progressPercentage : 0;
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
            <Button variant="ghost" size="sm" onClick={openEndSessionModal} className="text-error-600 hover:text-error-700">
              End Session
            </Button>
          </div>
        </div>

        {/* Progress Bar - Compact for immersive experience */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            <span>
              Card {studyProgress.currentIndex + 1} of {studyProgress.totalCards}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  /* TODO: Implement error clearing */
                }}
                className="text-error-600 hover:text-error-700"
              >
                Dismiss
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Study Card Container - Full focus */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {sessionCards.length > 0 && isSessionActive && (
            <StudyCardContainer
              cards={sessionCards}
              mode={currentMode}
              initialCardIndex={studyProgress.currentIndex}
              cardRatings={sessionRatings} // Using Redux session ratings
              onRating={handleRating}
              onAnswerSubmit={handleAnswerSubmit}
              onNoteUpdate={handleNoteUpdate}
              onCardChange={handleCardChange}
            />
          )}
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      <StudyModal isOpen={showEndSessionModal} onClose={() => setShowEndSessionModal(false)} title="End Study Session" confirmText="End Session" confirmVariant="danger" onConfirm={handleEndSession}>
        <p className="text-neutral-600 dark:text-neutral-400">Are you sure you want to end this study session? Your progress will be saved and you'll return to mode selection.</p>
      </StudyModal>
    </div>
  );
};
