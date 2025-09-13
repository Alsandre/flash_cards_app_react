import React, {useEffect, useMemo} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {useAppStore} from "../store/appStore";
import {Button, Card, LoadingSpinner} from "../components/ui";

export const GroupDetail: React.FC = () => {
  const {groupId} = useParams<{groupId: string}>();
  const navigate = useNavigate();

  // Use simple selectors to prevent re-renders
  const groups = useAppStore((state) => state.groups);
  const allCards = useAppStore((state) => state.cards);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);

  const cards = useMemo(() => {
    return groupId ? allCards[groupId] || [] : [];
  }, [allCards, groupId]);

  const actions = useMemo(
    () => ({
      loadGroups: useAppStore.getState().loadGroups,
      loadCards: useAppStore.getState().loadCards,
      deleteGroup: useAppStore.getState().deleteGroup,
      deleteCard: useAppStore.getState().deleteCard,
      clearError: useAppStore.getState().clearError,
    }),
    []
  );

  const group = useMemo(() => groups.find((g) => g.id === groupId), [groups, groupId]);

  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;

      try {
        const store = useAppStore.getState();

        // Load groups if not loaded
        if (groups.length === 0) {
          await store.loadGroups();
        }

        // Load cards for this group
        await store.loadCards(groupId);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };

    loadData();
  }, [groupId, groups.length]);

  const handleDeleteGroup = async () => {
    if (!groupId || !group) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${group.name}"? This will also delete all cards in this group.`);
    if (confirmed) {
      try {
        await actions.deleteGroup(groupId);
        navigate("/");
      } catch (error) {
        console.error("Failed to delete group:", error);
      }
    }
  };

  const handleDeleteCard = async (cardId: string, cardFront: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the card "${cardFront}"?`);
    if (confirmed) {
      try {
        await actions.deleteCard(cardId);
      } catch (error) {
        console.error("Failed to delete card:", error);
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
          <span>Loading group...</span>
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm">
        <Button variant="ghost" size="sm" asChild className="p-0 h-auto font-normal">
          <Link to="/" className="flex items-center space-x-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </nav>

      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{group.name}</h1>
          {group.description && <p className="mt-2 text-neutral-600 dark:text-neutral-400">{group.description}</p>}
          <div className="mt-3 flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">{group.cardCount} cards</span>
            <span>Study {group.studyCardCount} cards per session</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button asChild>
            <Link to={`/groups/${groupId}/cards/new`}>+ Add Card</Link>
          </Button>
          {group.cardCount > 0 && (
            <Button variant="secondary" asChild>
              <Link to={`/explore/${groupId}`}>Start Exploring</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-error-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={actions.clearError} className="text-error-600 hover:text-error-700">
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Cards List */}
      {cards.length === 0 ? (
        <Card className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No cards yet</h3>
          <p className="mb-6 text-neutral-500 dark:text-neutral-400">Get started by adding your first flashcard to this group</p>
          <Button asChild>
            <Link to={`/groups/${groupId}/cards/new`}>Add Your First Card</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id} variant="interactive" className="group">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">Front</p>
                      <p className="text-neutral-900 dark:text-neutral-100">{card.front}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">Back</p>
                      <p className="text-neutral-900 dark:text-neutral-100">{card.back}</p>
                    </div>
                  </div>

                  {card.hint && (
                    <div className="mt-4">
                      <p className="mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">Hint</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{card.hint}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {card.lastRating && (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${card.lastRating === "know" ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200" : card.lastRating === "doubt" ? "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200" : "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200"}`}>
                        {card.lastRating.replace("_", " ")}
                      </span>
                    )}
                    <span>Created {new Date(card.createdAt).toLocaleDateString()}</span>
                    {card.lastReviewedAt && <span>Last reviewed {new Date(card.lastReviewedAt).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="ml-4 flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                    <Link to={`/groups/${groupId}/cards/${card.id}/edit`} title="Edit card">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCard(card.id, card.front)} className="h-8 w-8 p-0 text-error-500 hover:text-error-600" title="Delete card">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Group Actions */}
      <Card className="border-t-0 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/groups/${groupId}/edit`} className="justify-start">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Edit Group Settings
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDeleteGroup} className="justify-start text-error-600 hover:text-error-700 sm:justify-center">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Group
          </Button>
        </div>
      </Card>
    </div>
  );
};
