// Group creation and editing form component
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useCreateGroup, useUpdateGroup, useClearError} from "../../store/appStore";
import type {Group} from "../../types/entities";

interface GroupFormProps {
  group?: Group;
  mode: "create" | "edit";
}

export const GroupForm: React.FC<GroupFormProps> = ({group, mode}) => {
  const navigate = useNavigate();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const clearError = useClearError();

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
    clearError();

    try {
      if (mode === "create") {
        await createGroup({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          studyCardCount: formData.studyCardCount,
        });
        navigate("/");
      } else if (group) {
        await updateGroup(group.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          studyCardCount: formData.studyCardCount,
        });
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{mode === "create" ? "Create New Group" : "Edit Group"}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
              placeholder="Enter group name"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
              placeholder="Optional description for this group"
              disabled={isSubmitting}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
          </div>

          {/* Study Card Count */}
          <div>
            <label htmlFor="studyCardCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cards per Study Session *
            </label>
            <input
              type="number"
              id="studyCardCount"
              value={formData.studyCardCount}
              onChange={(e) => setFormData({...formData, studyCardCount: parseInt(e.target.value) || 1})}
              min="1"
              max="100"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${errors.studyCardCount ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
              disabled={isSubmitting}
            />
            {errors.studyCardCount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.studyCardCount}</p>}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Number of cards to show in each study session (1-100)</p>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {isSubmitting ? (mode === "create" ? "Creating..." : "Updating...") : mode === "create" ? "Create Group" : "Update Group"}
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
