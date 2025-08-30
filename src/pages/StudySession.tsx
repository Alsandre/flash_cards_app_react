// Study session page - flashcard study interface
import React, {useEffect, useState} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useGroups, useAllCards, useCurrentSession, useStartStudySession, useUpdateSessionProgress, useRateCard, useCompleteSession, useLoadCards, useIsLoading, useError, useClearError} from "../store/appStore";

export const StudySession: React.FC = () => {
  const {groupId} = useParams<{groupId: string}>();
  const navigate = useNavigate();

  const groups = useGroups();
  const allCards = useAllCards();
  const cards = groupId ? allCards[groupId] || [] : [];
  const currentSession = useCurrentSession();
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
  const [sessionCards, setSessionCards] = useState<any[]>([]);

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
        <div className="text-gray-500">Starting study session...</div>
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

  if (sessionCards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No cards available for study</p>
        <Link to={`/groups/${groupId}`} className="text-blue-500 hover:text-blue-700 underline">
          Back to Group
        </Link>
      </div>
    );
  }

  const currentCard = sessionCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / sessionCards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Studying: {group.name}</h1>
          <button onClick={handleEndSession} className="text-gray-500 hover:text-gray-700 text-sm underline">
            End Session
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              Card {currentCardIndex + 1} of {sessionCards.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{width: `${progress}%`}} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 text-sm underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Flashcard */}
      <div className="mb-8">
        <div onClick={handleCardFlip} className="bg-white rounded-lg shadow-lg p-8 min-h-64 flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-4">{showBack ? "Back" : "Front"}</p>
            <p className="text-2xl text-gray-900">{showBack ? currentCard.back : currentCard.front}</p>
            {!showBack && <p className="text-sm text-gray-500 mt-4">Tap to reveal answer</p>}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mb-6">
        <button onClick={handlePreviousCard} disabled={currentCardIndex === 0} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <button onClick={handleNextCard} disabled={currentCardIndex === sessionCards.length - 1} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed">
          <span>Next</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Rating Buttons */}
      {showBack && (
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => handleRating("dont_know")} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Don't Know
          </button>
          <button onClick={() => handleRating("doubt")} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Doubt
          </button>
          <button onClick={() => handleRating("know")} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Know
          </button>
        </div>
      )}
    </div>
  );
};
