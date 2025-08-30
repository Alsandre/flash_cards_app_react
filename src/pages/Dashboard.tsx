// Dashboard page - main entry point showing groups overview
import React, {useEffect} from "react";
import {Link} from "react-router-dom";
import {useGroups, useLoadGroups, useIsLoading, useError, useClearError} from "../store/appStore";

export const Dashboard: React.FC = () => {
  const groups = useGroups();
  const isLoading = useIsLoading();
  const error = useError();
  const loadGroups = useLoadGroups();
  const clearError = useClearError();

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  if (isLoading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
        <Link to="/groups/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
          + New Group
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 text-sm underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No study groups yet</p>
          <Link to="/groups/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Create Your First Group
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{group.name}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{group.cardCount} cards</span>
              </div>

              {group.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>}

              <div className="flex space-x-2">
                <Link to={`/groups/${group.id}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium text-center transition-colors">
                  Manage
                </Link>
                {group.cardCount > 0 && (
                  <Link to={`/study/${group.id}`} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium text-center transition-colors">
                    Study
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
