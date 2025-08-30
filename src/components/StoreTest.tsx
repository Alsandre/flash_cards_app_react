// Test component for Zustand store integration
import React, {useEffect} from "react";
import {useAppStore, useGroups, useAllCards, useCurrentSession, useIsLoading, useError, useLoadGroups, useCreateGroup, useLoadCards, useCreateCard, useStartStudySession, useCompleteSession, useSetTheme, useClearError} from "../store/appStore";

export const StoreTest: React.FC = () => {
  // State selectors
  const groups = useGroups();
  const allCards = useAllCards();
  const currentSession = useCurrentSession();
  const isLoading = useIsLoading();
  const error = useError();

  // Individual action selectors
  const loadGroups = useLoadGroups();
  const createGroup = useCreateGroup();
  const loadCards = useLoadCards();
  const createCard = useCreateCard();
  const startStudySession = useStartStudySession();
  const completeSession = useCompleteSession();
  const setTheme = useSetTheme();
  const clearError = useClearError();

  // Test functions
  const testGroupOperations = async () => {
    try {
      clearError();

      // Load existing groups
      await loadGroups();

      // Create a test group
      await createGroup({
        name: "Zustand Test Group",
        description: "Testing Zustand store integration",
        studyCardCount: 5,
        cardCount: 0,
      });

      console.log("✅ Group operations test passed");
    } catch (error) {
      console.error("❌ Group operations test failed:", error);
    }
  };

  const testCardOperations = async () => {
    try {
      clearError();

      if (groups.length === 0) {
        console.log("⚠️ No groups available for card test");
        return;
      }

      const testGroup = groups[0];

      // Load cards for the group
      await loadCards(testGroup.id);

      // Create test cards
      await createCard({
        groupId: testGroup.id,
        front: "Zustand Test Card 1",
        back: "Store Integration Test",
        properties: {testCard: true},
      });

      await createCard({
        groupId: testGroup.id,
        front: "Zustand Test Card 2",
        back: "State Management Test",
        properties: {testCard: true},
      });

      console.log("✅ Card operations test passed");
    } catch (error) {
      console.error("❌ Card operations test failed:", error);
    }
  };

  const testStudySession = async () => {
    try {
      clearError();

      if (groups.length === 0) {
        console.log("⚠️ No groups available for study session test");
        return;
      }

      const testGroup = groups[0];
      const groupCards = cards[testGroup.id];

      if (!groupCards || groupCards.length === 0) {
        console.log("⚠️ No cards available for study session test");
        return;
      }

      // Start study session
      await startStudySession(testGroup.id);

      console.log("✅ Study session started");

      // Complete session after a brief delay
      setTimeout(async () => {
        try {
          await completeSession();
          console.log("✅ Study session completed");
        } catch (error) {
          console.error("❌ Failed to complete session:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("❌ Study session test failed:", error);
    }
  };

  const runAllTests = async () => {
    console.log("🧪 Starting Zustand store tests...");

    await testGroupOperations();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testCardOperations();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testStudySession();

    console.log("🎉 All Zustand store tests completed!");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Zustand Store Integration Test</h2>

      <div className="space-y-4">
        <button onClick={runAllTests} disabled={isLoading} className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-md font-medium transition-colors">
          {isLoading ? "Running Tests..." : "Test Zustand Store"}
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setTheme("dark")} className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm">
            Dark Theme
          </button>
          <button onClick={() => setTheme("light")} className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm">
            Light Theme
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm font-mono">{error}</p>
            <button onClick={clearError} className="text-red-500 hover:text-red-700 text-sm underline mt-1">
              Clear Error
            </button>
          </div>
        )}

        <div className="bg-gray-50 rounded-md p-3 text-sm">
          <h3 className="font-medium mb-2">Store State:</h3>
          <div className="space-y-1 font-mono text-xs">
            <div>Groups: {groups.length}</div>
            <div>Cards: {Object.keys(cards).length} groups with cards</div>
            <div>Current Session: {currentSession ? "Active" : "None"}</div>
            <div>Loading: {isLoading ? "Yes" : "No"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
