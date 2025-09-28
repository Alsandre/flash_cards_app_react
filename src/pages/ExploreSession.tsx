import React, {useEffect, useState, useMemo, useCallback} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {selectAllGroups, selectGroupsLoading, selectGroupsError} from "../store/selectors/groupSelectors";
import {selectAllCards} from "../store/selectors/cardSelectors";
import {selectIsExploreSessionActive, selectExploreProgress} from "../store/selectors/sessionSelectors";
import {loadGroups, groupActions} from "../store/slices/groupSlice";
import {loadCards} from "../store/slices/cardSlice";
import {sessionActions} from "../store/slices/sessionSlice";
import {Button, Card, LoadingSpinner} from "../components/ui";
import {ExploreErrorBoundary, ExploreCardContainer} from "../components/sessions/explore";

export const ExploreSession: React.FC = () => {
  const {groupId} = useParams<{groupId: string}>();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectAllGroups);
  const allCards = useAppSelector(selectAllCards);
  const isLoading = useAppSelector(selectGroupsLoading);
  const error = useAppSelector(selectGroupsError);

  // Redux session selectors
  const isSessionActive = useAppSelector(selectIsExploreSessionActive);
  const exploreProgress = useAppSelector(selectExploreProgress);

  const cards = useMemo(() => {
    return groupId ? allCards.filter((card) => card.groupId === groupId) : [];
  }, [allCards, groupId]);

  const sessionCards = useMemo(() => {
    // Get cards for explore session based on group's studyCardCount
    const group = groups.find((g) => g.id === groupId);
    return group ? cards.slice(0, group.studyCardCount) : [];
  }, [cards, groups, groupId]);

  const [cardRatings, setCardRatings] = useState<Record<string, "easy" | "medium" | "hard">>({});

  const group = groups.find((g) => g.id === groupId);

  useEffect(() => {
    if (groupId && groups.length === 0) {
      dispatch(loadGroups());
    }
    if (groupId && allCards.length === 0) {
      dispatch(loadCards());
    }
  }, [groupId, groups.length, allCards.length, dispatch]);

  // Initialize explore session when cards are available
  useEffect(() => {
    if (groupId && sessionCards.length > 0 && !isSessionActive) {
      const cardIds = sessionCards.map((card) => card.id);
      dispatch(sessionActions.startExploreSession({cardIds}));
    }
  }, [groupId, sessionCards, isSessionActive, dispatch]);

  // This effect is removed - sessionCards are now managed by Redux

  const handleRating = useCallback((cardId: string, rating: "easy" | "medium" | "hard") => {
    // Update local rating state for UI feedback (explore sessions don't advance automatically)
    setCardRatings((prev) => ({
      ...prev,
      [cardId]: rating,
    }));

    // TODO: In future, could save rating to database or session storage
  }, []);

  const handleCardChange = useCallback(
    (index: number) => {
      // Navigate to specific card in explore session
      if (isSessionActive) {
        dispatch(sessionActions.navigateToCard(index));
      }
    },
    [isSessionActive, dispatch]
  );

  const handleEndSession = async () => {
    const confirmed = window.confirm("Are you sure you want to end this explore session?");
    if (confirmed && isSessionActive) {
      try {
        dispatch(sessionActions.endExploreSession());
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
          <span>Starting explore session...</span>
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
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">This group doesn't have any cards to explore yet.</p>
        <Button asChild>
          <Link to={`/groups/${groupId}`}>Back to Group</Link>
        </Button>
      </Card>
    );
  }

  const progress = isSessionActive && exploreProgress.totalCards > 0 ? Math.round(((exploreProgress.currentIndex + 1) / exploreProgress.totalCards) * 100) : 0;

  const handleErrorReset = () => {
    // Reset local state and navigate back to group
    setCardRatings({});
    navigate(`/groups/${groupId}`);
  };

  return (
    <ExploreErrorBoundary onReset={handleErrorReset}>
      <div className="mx-auto max-w-4xl px-1 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Exploring: {group.name}</h1>
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
                Card {exploreProgress.currentIndex + 1} of {exploreProgress.totalCards}
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
              <Button variant="ghost" size="sm" onClick={() => dispatch(groupActions.clearError())} className="text-error-600 hover:text-error-700">
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        {/* Explore Card Container */}
        <div className="mb-8">{sessionCards.length > 0 && isSessionActive && <ExploreCardContainer cards={sessionCards} initialCardIndex={exploreProgress.currentIndex} cardRatings={cardRatings} onRating={handleRating} onCardChange={handleCardChange} />}</div>
      </div>
    </ExploreErrorBoundary>
  );
};
