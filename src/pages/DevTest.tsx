// Development test page - accessible via /dev-test
import React, {useState} from "react";
import {testDatabaseSetup} from "../services/databaseTest";
import {StoreTest} from "../components/StoreTest";

export const DevTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const runDatabaseTest = async () => {
    setIsLoading(true);
    setTestResult("");

    try {
      await testDatabaseSetup();
      setTestResult("✅ Database test completed successfully! Check console for details.");
    } catch (error) {
      setTestResult(`❌ Database test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Development Tests</h1>
      <p className="text-gray-600 dark:text-gray-400">This page is for testing database and store functionality during development.</p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Database Setup Verification</h2>

        <button onClick={runDatabaseTest} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md font-medium transition-colors">
          {isLoading ? "Running Tests..." : "Test Database Setup"}
        </button>

        {testResult && (
          <div className="mt-4 p-4 rounded-md bg-gray-100 dark:bg-gray-700">
            <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{testResult}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>This test will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Verify Dexie.js database connection</li>
            <li>Test Group CRUD operations</li>
            <li>Test Card CRUD operations</li>
            <li>Verify repository pattern implementation</li>
            <li>Test database indexes and relationships</li>
          </ul>
        </div>
      </div>

      <StoreTest />
    </div>
  );
};
