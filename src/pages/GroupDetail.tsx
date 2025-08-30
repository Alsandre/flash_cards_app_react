// Group detail page - manage cards within a group
import React, {useEffect, useMemo} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {useAppStore} from "../store/appStore";

export const GroupDetail: React.FC = () => {
  const {groupId} = useParams<{groupId: string}>();
  const navigate = useNavigate();

  // Use simple selectors to prevent re-renders
  const groups = useAppStore((state) => state.groups);
  const allCards = useAppStore((state) => state.cards);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);

  // Derive cards for this group
  const cards = useMemo(() => {
    return groupId ? allCards[groupId] || [] : [];
  }, [allCards, groupId]);

  // Memoized actions
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
      <div className="text-center py-12">
        <p className="text-red-600">Invalid group ID</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Group not found</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          {group.description && <p className="text-gray-600 mt-1">{group.description}</p>}
          <p className="text-sm text-gray-500 mt-1">
            {group.cardCount} cards • Study {group.studyCardCount} cards per session
          </p>
        </div>

        <div className="flex space-x-2">
          <Link to={`/groups/${groupId}/cards/new`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
            + Add Card
          </Link>
          {group.cardCount > 0 && (
            <Link to={`/study/${groupId}`} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
              Start Study
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={actions.clearError} className="text-red-500 hover:text-red-700 text-sm underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Cards List */}
      {cards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No cards in this group yet</p>
          <Link to={`/groups/${groupId}/cards/new`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Add Your First Card
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Front</p>
                      <p className="text-gray-900">{card.front}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Back</p>
                      <p className="text-gray-900">{card.back}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    {card.lastRating && <span className={`px-2 py-1 rounded ${card.lastRating === "know" ? "bg-green-100 text-green-700" : card.lastRating === "doubt" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{card.lastRating.replace("_", " ")}</span>}
                    <span>Created {new Date(card.createdAt).toLocaleDateString()}</span>
                    {card.lastReviewedAt && <span>Last reviewed {new Date(card.lastReviewedAt).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Link to={`/groups/${groupId}/cards/${card.id}/edit`} className="text-gray-500 hover:text-gray-700 p-1" title="Edit card">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button onClick={() => handleDeleteCard(card.id, card.front)} className="text-red-500 hover:text-red-700 p-1" title="Delete card">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Group Actions */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center">
          <div>
            <Link to={`/groups/${groupId}/edit`} className="text-gray-600 hover:text-gray-800 underline">
              Edit Group Settings
            </Link>
          </div>
          <button onClick={handleDeleteGroup} className="text-red-600 hover:text-red-800 text-sm underline">
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
};
