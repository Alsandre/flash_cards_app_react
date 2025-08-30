// Edit existing group page
import React, {useEffect} from "react";
import {useParams, Link} from "react-router-dom";
import {useGroups, useLoadGroups} from "../store/appStore";
import {GroupForm} from "../components/forms/GroupForm";

export const EditGroup: React.FC = () => {
  const {groupId} = useParams<{groupId: string}>();
  const groups = useGroups();
  const loadGroups = useLoadGroups();

  const group = groups.find((g) => g.id === groupId);

  useEffect(() => {
    if (groups.length === 0) {
      loadGroups();
    }
  }, [loadGroups, groups.length]);

  if (!groupId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Invalid group ID</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Group not found</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <GroupForm group={group} mode="edit" />;
};
