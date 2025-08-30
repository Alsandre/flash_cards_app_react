// Reusable form component for creating and editing cards
import React, {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useAppStore} from "../../store/appStore";
import type {Card} from "../../types/entities";

interface CardFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Card>;
}

interface CardFormData {
  front: string;
  back: string;
  hint?: string;
}

export const CardForm: React.FC<CardFormProps> = ({mode, initialData}) => {
  const navigate = useNavigate();
  const {groupId, cardId} = useParams<{groupId: string; cardId?: string}>();

  // Zustand store selectors
  const groups = useAppStore((state) => state.groups);
  const cards = useAppStore((state) => (groupId ? state.cards[groupId] || [] : []));
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const createCard = useAppStore((state) => state.createCard);
  const updateCard = useAppStore((state) => state.updateCard);
  const loadGroups = useAppStore((state) => state.loadGroups);
  const loadCards = useAppStore((state) => state.loadCards);
  const clearError = useAppStore((state) => state.clearError);

  // Form state
  const [formData, setFormData] = useState<CardFormData>({
    front: initialData?.front || "",
    back: initialData?.back || "",
    hint: initialData?.hint || "",
  });

  const [errors, setErrors] = useState<Partial<CardFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the current group and card
  const group = groups.find((g) => g.id === groupId);
  const card = mode === "edit" ? cards.find((c) => c.id === cardId) : null;

  // Load data on mount
  useEffect(() => {
    if (groups.length === 0) {
      loadGroups();
    }
    if (groupId && cards.length === 0) {
      loadCards(groupId);
    }
  }, [groupId, groups.length, cards.length, loadGroups, loadCards]);

  // Update form data when card is loaded (edit mode)
  useEffect(() => {
    if (mode === "edit" && card) {
      setFormData({
        front: card.front,
        back: card.back,
        hint: card.hint || "",
      });
    }
  }, [mode, card]);

  // Clear errors when error state changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CardFormData> = {};

    if (!formData.front.trim()) {
      newErrors.front = "Front side is required";
    } else if (formData.front.length > 500) {
      newErrors.front = "Front side must be less than 500 characters";
    }

    if (!formData.back.trim()) {
      newErrors.back = "Back side is required";
    } else if (formData.back.length > 1000) {
      newErrors.back = "Back side must be less than 1000 characters";
    }

    if (formData.hint && formData.hint.length > 200) {
      newErrors.hint = "Hint must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !groupId) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createCard({
          groupId,
          front: formData.front.trim(),
          back: formData.back.trim(),
          hint: formData.hint?.trim() || undefined,
        });
      } else if (mode === "edit" && cardId) {
        await updateCard(cardId, {
          front: formData.front.trim(),
          back: formData.back.trim(),
          hint: formData.hint?.trim() || undefined,
        });
      }

      // Navigate back to group detail page
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error(`Failed to ${mode} card:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/groups/${groupId}`);
  };

  // Loading state
  if (isLoading && (!group || (mode === "edit" && !card))) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Group not found
  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Group not found</p>
        <button onClick={() => navigate("/")} className="text-blue-500 hover:text-blue-700 underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Card not found (edit mode)
  if (mode === "edit" && !card) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Card not found</p>
        <button onClick={() => navigate(`/groups/${groupId}`)} className="text-blue-500 hover:text-blue-700 underline">
          Back to Group
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{mode === "create" ? "Add New Card" : "Edit Card"}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{mode === "create" ? `Adding card to "${group.name}"` : `Editing card in "${group.name}"`}</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button onClick={clearError} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm underline mt-1">
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Front Side */}
          <div>
            <label htmlFor="front" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Front Side *
            </label>
            <textarea
              id="front"
              value={formData.front}
              onChange={(e) => setFormData({...formData, front: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${errors.front ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
              placeholder="Enter the question or prompt"
              rows={3}
              disabled={isSubmitting}
            />
            {errors.front && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.front}</p>}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">What the user will see first (question, term, etc.)</p>
          </div>

          {/* Back Side */}
          <div>
            <label htmlFor="back" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Back Side *
            </label>
            <textarea
              id="back"
              value={formData.back}
              onChange={(e) => setFormData({...formData, back: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${errors.back ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
              placeholder="Enter the answer or definition"
              rows={4}
              disabled={isSubmitting}
            />
            {errors.back && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.back}</p>}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The answer or information revealed when flipped</p>
          </div>

          {/* Hint (Optional) */}
          <div>
            <label htmlFor="hint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hint (Optional)
            </label>
            <input
              type="text"
              id="hint"
              value={formData.hint}
              onChange={(e) => setFormData({...formData, hint: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${errors.hint ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
              placeholder="Optional hint to help remember"
              disabled={isSubmitting}
            />
            {errors.hint && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.hint}</p>}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A helpful clue (optional)</p>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {isSubmitting ? (mode === "create" ? "Adding..." : "Updating...") : mode === "create" ? "Add Card" : "Update Card"}
            </button>
            <button type="button" onClick={handleCancel} disabled={isSubmitting} className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
