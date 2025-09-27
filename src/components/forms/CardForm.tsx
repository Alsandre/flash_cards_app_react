import React, {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {selectAllGroups, selectGroupsLoading, selectGroupsError} from "../../store/selectors/groupSelectors";
import {selectAllCards} from "../../store/selectors/cardSelectors";
import {loadGroups} from "../../store/slices/groupSlice";
import {createCard, updateCard} from "../../store/slices/cardSlice";
import {uiActions} from "../../store/slices/uiSlice";
import {Button, Card as UICard, Input, Textarea, LoadingSpinner} from "../ui";
import type {Card} from "../../types/card-schema";

interface CardFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Card>;
}

interface CardFormData {
  content: string;
  answer: string;
  hint?: string;
}

export const CardForm: React.FC<CardFormProps> = ({mode, initialData}) => {
  const navigate = useNavigate();
  const {groupId, cardId} = useParams<{groupId: string; cardId?: string}>();

  // Zustand store selectors
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectAllGroups);
  const allCards = useAppSelector(selectAllCards);
  const isLoading = useAppSelector(selectGroupsLoading);
  const error = useAppSelector(selectGroupsError);

  const cards = groupId ? allCards.filter((card) => card.groupId === groupId) : [];

  const [formData, setFormData] = useState<CardFormData>({
    content: initialData?.content || "",
    answer: initialData?.answer || "",
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
      dispatch(loadGroups());
    }
  }, [dispatch, groups.length]);

  useEffect(() => {
    if (mode === "edit" && card) {
      setFormData({
        content: card.content,
        answer: card.answer,
        hint: card.hint || "",
      });
    }
  }, [mode, card]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(uiActions.clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CardFormData> = {};

    if (!formData.content.trim()) {
      newErrors.content = "Content side is required";
    } else if (formData.content.length > 500) {
      newErrors.content = "Content side must be less than 500 characters";
    }

    if (!formData.answer.trim()) {
      newErrors.answer = "Answer side is required";
    } else if (formData.answer.length > 1000) {
      newErrors.answer = "Answer side must be less than 1000 characters";
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
        
        await dispatch(
          createCard({
            groupId,
            content: formData.content.trim(),
            answer: formData.answer.trim(),
            hint: formData.hint?.trim() || undefined,
          })
        ).unwrap();
        
      } else if (mode === "edit" && cardId) {
        
        await dispatch(
          updateCard({
            id: cardId,
            updates: {
              content: formData.content.trim(),
              answer: formData.answer.trim(),
              hint: formData.hint?.trim() || undefined,
            },
          })
        ).unwrap();
        
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
        <div className="flex items-center space-x-3 text-neutral-500 dark:text-neutral-400">
          <LoadingSpinner size="md" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Group not found
  if (!group) {
    return (
      <UICard className="mx-auto max-w-md text-center py-12">
        <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">Group not found</h3>
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">The requested group could not be found.</p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </UICard>
    );
  }

  // Card not found (edit mode)
  if (mode === "edit" && !card) {
    return (
      <UICard className="mx-auto max-w-md text-center py-12">
        <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">Card not found</h3>
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">The requested card could not be found.</p>
        <Button onClick={() => navigate(`/groups/${groupId}`)}>Back to Group</Button>
      </UICard>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-1 sm:px-0">
      <UICard className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{mode === "create" ? "Add New Card" : "Edit Card"}</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{mode === "create" ? `Adding card to "${group.name}"` : `Editing card in "${group.name}"`}</p>
        </div>

        {/* Error Message */}
        {error && (
          <UICard className="mb-6 border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-error-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => dispatch(uiActions.clearError())} className="text-error-600 hover:text-error-700">
                Dismiss
              </Button>
            </div>
          </UICard>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Front Side */}
          <Textarea label="Content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Enter the question or prompt" rows={3} error={errors.content} helperText="What the user will see first (question, term, etc.)" disabled={isSubmitting} required />

          {/* Back Side */}
          <Textarea label="Answer" value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} placeholder="Enter the answer or definition" rows={4} error={errors.answer} helperText="The answer or information revealed when flipped" disabled={isSubmitting} required />

          {/* Hint (Optional) */}
          <Input label="Hint (Optional)" type="text" value={formData.hint || ""} onChange={(e) => setFormData({...formData, hint: e.target.value})} placeholder="Optional hint to help remember" error={errors.hint} helperText="A helpful clue (optional)" disabled={isSubmitting} />

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSubmitting} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting} className="flex-1">
              {mode === "create" ? "Add Card" : "Update Card"}
            </Button>
          </div>
        </form>
      </UICard>
    </div>
  );
};
