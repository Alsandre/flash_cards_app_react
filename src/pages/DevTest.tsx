// Development test page - accessible via /dev-test
import React, {useState} from "react";
import {useAuth} from "../auth/AuthProvider";
import {getGroupRepo, getCardRepo} from "../services/repositoryService";

export const DevTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const runSupabaseTest = async () => {
    setIsLoading(true);
    setTestResult("");

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Test group operations
      const groupRepo = getGroupRepo();
      const groups = await groupRepo.findAll();
      
      // Test card operations
      const cardRepo = getCardRepo();
      const cards = await cardRepo.findAll();

      setTestResult(`✅ Supabase test completed successfully! Found ${groups.length} groups and ${cards.length} cards.`);
    } catch (error) {
      setTestResult(`❌ Supabase test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Development Tests</h1>
      <p className="text-gray-600 dark:text-gray-400">This page is for testing database and store functionality during development.</p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Supabase Connection Verification</h2>

        <button onClick={runSupabaseTest} disabled={isLoading || !user} className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md font-medium transition-colors">
          {isLoading ? "Running Tests..." : "Test Supabase Connection"}
        </button>

        {!user && (
          <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">Please log in to run Supabase tests</p>
        )}

        {testResult && (
          <div className="mt-4 p-4 rounded-md bg-gray-100 dark:bg-gray-700">
            <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{testResult}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>This test will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Verify Supabase database connection</li>
            <li>Test Group repository operations</li>
            <li>Test Card repository operations</li>
            <li>Verify authentication and user scoping</li>
            <li>Test cloud data access patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
