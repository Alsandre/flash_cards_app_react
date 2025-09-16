import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAppDispatch} from "../../store/hooks";
import {createGroup, updateGroup, groupActions} from "../../store/slices/groupSlice";
import {Button, Card, Input, Textarea} from "../ui";
import type {Group} from "../../types/group-schema";

interface GroupFormProps {
  group?: Group;
  mode: "create" | "edit";
}

export const GroupForm: React.FC<GroupFormProps> = ({group, mode}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: group?.name || "",
    description: group?.description || "",
    studyCardCount: group?.studyCardCount || 10,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Group name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Group name must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (formData.studyCardCount < 1) {
      newErrors.studyCardCount = "Study card count must be at least 1";
    } else if (formData.studyCardCount > 100) {
      newErrors.studyCardCount = "Study card count must be 100 or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    dispatch(groupActions.clearError());

    try {
      if (mode === "create") {
        await dispatch(
          createGroup({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
          })
        ).unwrap();
        navigate("/");
      } else if (group) {
        await dispatch(
          updateGroup({
            id: group.id,
            updates: {
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
            },
          })
        ).unwrap();
        navigate(`/groups/${group.id}`);
      }
    } catch (error) {
      console.error(`Failed to ${mode} group:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mode === "create") {
      navigate("/");
    } else if (group) {
      navigate(`/groups/${group.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-1 sm:px-0">
      <Card className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{mode === "create" ? "Create New Group" : "Edit Group"}</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{mode === "create" ? "Create a new flashcard group to organize your study materials" : "Update your group settings and preferences"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <Input label="Group Name" type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter group name" error={errors.name} disabled={isSubmitting} required />

          {/* Description */}
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Optional description for this group" error={errors.description} disabled={isSubmitting} />

          {/* Study Card Count */}
          <Input label="Cards per Study Session" type="number" value={formData.studyCardCount.toString()} onChange={(e) => setFormData({...formData, studyCardCount: parseInt(e.target.value) || 1})} min="1" max="100" error={errors.studyCardCount} helperText="Number of cards to show in each study session (1-100)" disabled={isSubmitting} required />

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSubmitting} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting} className="flex-1">
              {mode === "create" ? "Create Group" : "Update Group"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
