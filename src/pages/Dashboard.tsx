import React, {useEffect} from "react";
import {Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {loadGroups, deleteGroup} from "../store/slices/groupSlice";
import {groupActions} from "../store/slices/groupSlice";
import {loadCards} from "../store/slices/cardSlice";
import {selectAllGroups, selectGroupsLoading, selectGroupsError} from "../store/selectors/groupSelectors";
import {Button, Card, LoadingSpinner} from "../components/ui";
import {StarterPackService} from "../services/starterPackService";

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectAllGroups);
  const isLoading = useAppSelector(selectGroupsLoading);
  const error = useAppSelector(selectGroupsError);

  useEffect(() => {
    dispatch(loadGroups());
    dispatch(loadCards());
  }, [dispatch]);

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    // Prevent deletion of starter pack
    if (StarterPackService.isStarterPack(groupId)) {
      alert("This special collection cannot be deleted! It's always here for you ❤️");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${groupName}"? This will also delete all cards in this group.`);
    if (confirmed) {
      try {
        await dispatch(deleteGroup(groupId)).unwrap();
      } catch (error) {
        console.error("Failed to delete group:", error);
      }
    }
  };

  if (isLoading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3 text-neutral-500 dark:text-neutral-400">
          <LoadingSpinner size="md" />
          <span>Loading groups...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Study Groups</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Organize your flashcards into focused study groups</p>
        </div>
        <Button asChild>
          <Link to="/groups/new">+ New Group</Link>
        </Button>
      </div>
      {error && (
        <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-error-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => dispatch(groupActions.clearError())} className="text-error-600 hover:text-error-700">
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {groups.length === 0 ? (
        <Card className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No study groups yet</h3>
          <p className="mb-6 text-neutral-500 dark:text-neutral-400">Get started by creating your first flashcard group</p>
          <Button asChild>
            <Link to="/groups/new">Create Your First Group</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const isStarterPack = StarterPackService.isStarterPack(group.id);
            return (
              <Card key={group.id} variant="interactive" className={`group ${isStarterPack ? "ring-2 ring-pink-300 dark:ring-pink-600 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/60 dark:to-rose-900/60 shadow-lg shadow-pink-200/40 dark:shadow-pink-900/30 animate-pulse-subtle" : ""}`}>
                <div className="mb-4 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-lg font-semibold text-neutral-900 dark:text-neutral-100">{group.name}</h3>
                      {isStarterPack && <span className="text-pink-500">❤️</span>}
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isStarterPack ? "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"}`}>{group.cardCount} cards</span>
                      {isStarterPack && <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-900 dark:text-rose-200">Special ✨</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                      <Link to={`/groups/${group.id}/edit`} title="Edit group">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </Button>
                    {!isStarterPack && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteGroup(group.id, group.name)} className="h-8 w-8 p-0 text-error-500 hover:text-error-600" title="Delete group">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description */}
                {group.description && <p className="mb-4 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{group.description}</p>}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm" asChild className="flex-1">
                    <Link to={`/groups/${group.id}`}>Manage</Link>
                  </Button>
                  {group.cardCount > 0 && (
                    <>
                      <Button size="sm" asChild className="flex-1">
                        <Link to={`/study/${group.id}`}>Study</Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild className="flex-1">
                        <Link to={`/explore/${group.id}`}>Explore</Link>
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
