// Statistics page - progress tracking and analytics
import React, {useEffect, useState, useMemo} from "react";
import {useGroups, useAllCards, useIsLoading, useError, useLoadGroups, useLoadCards} from "../store/appStore";
import {Card, LoadingSpinner} from "../components/ui";
import {SessionRepository} from "../repositories/sessionRepository";
import type {StudySession, CardRating} from "../types/entities";

interface SessionStats {
  totalSessions: number;
  totalCardsStudied: number;
  averageSessionLength: number;
  completionRate: number;
  ratingDistribution: {
    dont_know: number;
    doubt: number;
    know: number;
  };
}

interface GroupStats {
  groupId: string;
  groupName: string;
  totalCards: number;
  studiedCards: number;
  averageRating: number;
  lastStudied?: Date;
  sessionsCompleted: number;
}

export const Stats: React.FC = () => {
  const groups = useGroups();
  const allCards = useAllCards();
  const isLoading = useIsLoading();
  const error = useError();
  const loadGroups = useLoadGroups();
  const loadCards = useLoadCards();

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [ratings, setRatings] = useState<CardRating[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setStatsLoading(true);

        if (groups.length === 0) {
          await loadGroups();
        }

        // Load cards for all groups
        for (const group of groups) {
          if (!allCards[group.id]) {
            await loadCards(group.id);
          }
        }

        // Load session data
        const sessionRepo = new SessionRepository();
        const allSessions = await sessionRepo.findAll();
        const allRatings = await sessionRepo.getAllRatings();

        setSessions(allSessions);
        setRatings(allRatings);
      } catch (error) {
        console.error("Failed to load stats data:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadData();
  }, [groups.length, loadGroups, loadCards]);

  // Calculate overall session statistics
  const sessionStats: SessionStats = useMemo(() => {
    const completedSessions = sessions.filter((s) => s.isCompleted);
    const totalCards = ratings.length;

    const ratingCounts = ratings.reduce(
      (acc, rating) => {
        acc[rating.rating]++;
        return acc;
      },
      {dont_know: 0, doubt: 0, know: 0}
    );

    return {
      totalSessions: completedSessions.length,
      totalCardsStudied: totalCards,
      averageSessionLength: completedSessions.length > 0 ? Math.round(totalCards / completedSessions.length) : 0,
      completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0,
      ratingDistribution: ratingCounts,
    };
  }, [sessions, ratings]);

  // Calculate per-group statistics
  const groupStats: GroupStats[] = useMemo(() => {
    return groups.map((group) => {
      const groupCards = allCards[group.id] || [];
      const groupSessions = sessions.filter((s) => s.groupId === group.id && s.isCompleted);
      const groupRatings = ratings.filter((r) => {
        const card = groupCards.find((c) => c.id === r.cardId);
        return card && card.groupId === group.id;
      });

      const studiedCardIds = new Set(groupRatings.map((r) => r.cardId));
      const lastSession = groupSessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];

      const averageRating =
        groupRatings.length > 0
          ? groupRatings.reduce((sum, r) => {
              const score = r.rating === "know" ? 3 : r.rating === "doubt" ? 2 : 1;
              return sum + score;
            }, 0) / groupRatings.length
          : 0;

      return {
        groupId: group.id,
        groupName: group.name,
        totalCards: groupCards.length,
        studiedCards: studiedCardIds.size,
        averageRating: Math.round(averageRating * 10) / 10,
        lastStudied: lastSession?.startedAt,
        sessionsCompleted: groupSessions.length,
      };
    });
  }, [groups, allCards, sessions, ratings]);

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3 text-neutral-500 dark:text-neutral-400">
          <LoadingSpinner size="md" />
          <span>Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Statistics</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Track your learning progress and study session analytics</p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <div className="flex items-start space-x-3">
            <svg className="h-5 w-5 text-error-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
          </div>
        </Card>
      )}

      {/* Overall Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Sessions</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{sessionStats.totalSessions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-500 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Cards Studied</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{sessionStats.totalCardsStudied}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-500 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Avg Session Length</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{sessionStats.averageSessionLength}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info-500 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Completion Rate</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{sessionStats.completionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">Knowledge Distribution</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-error-600 dark:text-error-400">{sessionStats.ratingDistribution.dont_know}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Don't Know</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">{sessionStats.ratingDistribution.doubt}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Doubt</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600 dark:text-success-400">{sessionStats.ratingDistribution.know}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Know</div>
          </div>
        </div>
      </Card>

      {/* Group Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">Group Performance</h3>
        {groupStats.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">No study data available yet. Start studying to see group statistics!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Avg Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Last Studied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {groupStats.map((stat) => (
                  <tr key={stat.groupId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{stat.groupName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {stat.studiedCards}/{stat.totalCards}
                        </div>
                        <div className="ml-2 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div className="bg-primary-500 h-2 rounded-full" style={{width: `${stat.totalCards > 0 ? (stat.studiedCards / stat.totalCards) * 100 : 0}%`}} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.averageRating >= 2.5 ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200" : stat.averageRating >= 2 ? "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200" : "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200"}`}>
                        {stat.averageRating > 0 ? stat.averageRating.toFixed(1) : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">{stat.sessionsCompleted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{stat.lastStudied ? new Date(stat.lastStudied).toLocaleDateString() : "Never"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
