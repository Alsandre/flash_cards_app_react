// Simplified Group detail page to avoid infinite loops
import React from "react";
import {useParams, Link} from "react-router-dom";

export const GroupDetailSimple: React.FC = () => {
  const {groupId} = useParams<{groupId: string}>();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              ← Back
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Spanish Vocabulary</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Basic Spanish words and phrases for beginners</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">0 cards • Study 15 cards per session</p>
        </div>

        <div className="flex space-x-2">
          <Link to={`/groups/${groupId}/cards/new`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
            + Add Card
          </Link>
        </div>
      </div>

      {/* Cards List - Empty State */}
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">No cards in this group yet</p>
        <Link to={`/groups/${groupId}/cards/new`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
          Add Your First Card
        </Link>
      </div>

      {/* Group Actions */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center">
          <div>
            <Link to={`/groups/${groupId}/edit`} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 underline">
              Edit Group Settings
            </Link>
          </div>
          <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm underline">Delete Group</button>
        </div>
      </div>
    </div>
  );
};
