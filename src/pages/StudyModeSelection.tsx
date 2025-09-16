import React, {useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {selectAllGroups, selectGroupsLoading} from "../store/selectors/groupSelectors";
import {loadGroups} from "../store/slices/groupSlice";
import {Button, Card, LoadingSpinner} from "../components/ui";

/**
 * StudyModeSelection - Study session configuration and mode selection page
 * @level 4 (Page Component)
 * @coupling Justified: Route-level study session preparation
 */

type StudyMode = "flow" | "commit" | "validate" | "mastery";

const STUDY_MODE_CONFIG = {
  flow: {
    name: "Flow Mode",
    description: "Free-flowing review without constraints. Perfect for casual study and knowledge refresh.",
    features: ["Tap to flip cards", "Self-assessment rating", "No answer requirements", "Relaxed pace"],
    color: "bg-blue-500",
    difficulty: "Easy",
    recommendedFor: "Quick review, familiar topics",
  },
  commit: {
    name: "Commit Mode",
    description: "Answer commitment before reveal. Encourages active recall and deeper engagement.",
    features: ["Answer input required", "Compare your answer", "Self-assessment rating", "Active recall"],
    color: "bg-green-500",
    difficulty: "Medium",
    recommendedFor: "Active learning, concept reinforcement",
  },
  validate: {
    name: "Validate Mode",
    description: "Answer validation with feedback. System checks your answers for accuracy.",
    features: ["Answer validation", "Automatic feedback", "Smart hint system", "Progress tracking"],
    color: "bg-yellow-500",
    difficulty: "Hard",
    recommendedFor: "Knowledge testing, exam preparation",
  },
  mastery: {
    name: "Mastery Mode",
    description: "Precision timing and exact answers. Intensive training for expert-level knowledge.",
    features: ["Exact answer matching", "Timing-based scoring", "Mastery thresholds", "Performance analytics"],
    color: "bg-red-500",
    difficulty: "Expert",
    recommendedFor: "Advanced mastery, competitive preparation",
  },
} as const;

export const StudyModeSelection: React.FC = () => {
  const {groupId} = useParams<{groupId: string}>();
  const navigate = useNavigate();
  const groups = useAppSelector(selectAllGroups);
  const isLoading = useAppSelector(selectGroupsLoading);
  const dispatch = useAppDispatch();

  const group = groups.find((g) => g.id === groupId);

  useEffect(() => {
    dispatch(loadGroups());
  }, [dispatch]);

  const handleModeSelect = (mode: StudyMode) => {
    // Only allow flow mode for now
    if (mode === "flow") {
      navigate(`/study/${groupId}/${mode}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  if (isLoading && !group) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3 text-neutral-500 dark:text-neutral-400">
          <LoadingSpinner size="md" />
          <span>Loading study options...</span>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <Card className="mx-auto max-w-md text-center py-12">
        <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">Group not found</h3>
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">The requested group could not be found.</p>
        <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
      </Card>
    );
  }

  if (group.cardCount === 0) {
    return (
      <Card className="mx-auto max-w-md text-center py-12">
        <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">No cards to study</h3>
        <p className="mb-4 text-neutral-500 dark:text-neutral-400">This group doesn't have any cards yet.</p>
        <div className="flex space-x-2 justify-center">
          <Button asChild>
            <Link to={`/groups/${groupId}/cards/new`}>Add Cards</Link>
          </Button>
          <Button variant="secondary" onClick={handleBackToDashboard}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Choose Your Study Mode</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Studying: <span className="font-semibold text-neutral-900 dark:text-neutral-100">{group.name}</span>
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">{group.cardCount} cards available</span>
          <span>Study session: {group.studyCardCount} cards</span>
        </div>
      </div>

      {/* Study Mode Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(STUDY_MODE_CONFIG).map(([mode, config]) => {
          const isDisabled = mode !== "flow";
          return (
            <Card key={mode} variant="interactive" className={`group transition-all duration-200 ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg"}`} onClick={() => handleModeSelect(mode as StudyMode)}>
              <div className="p-6">
                {/* Mode Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${config.color}`} />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{config.name}</h3>
                  </div>
                  <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">{config.difficulty}</div>
                </div>

                {/* Description */}
                <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-sm">{config.description}</p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {config.features.map((feature, index) => (
                      <li key={index} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended For */}
                <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Recommended for:</p>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{config.recommendedFor}</p>
                </div>

                {/* Start Button */}
                <Button className={`w-full transition-transform ${!isDisabled ? "group-hover:scale-[1.02]" : ""}`} disabled={isDisabled}>
                  {isDisabled ? "Upcoming" : `Start ${config.name}`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-3 pt-4">
        <Button variant="ghost" onClick={handleBackToDashboard}>
          Back to Dashboard
        </Button>
        <Button variant="secondary" asChild>
          <Link to={`/explore/${groupId}`}>Quick Explore Instead</Link>
        </Button>
      </div>
    </div>
  );
};
