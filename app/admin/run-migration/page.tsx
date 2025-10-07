"use client";

import { useState } from "react";

export default function RunMigration() {
  const [status, setStatus] = useState<string>('');
  const [steps, setSteps] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runMigration = async () => {
    setIsRunning(true);
    setStatus('Running migration...');
    setSteps([]);
    
    try {
      const response = await fetch('/api/admin/run-migration', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus(`✅ ${data.message}`);
        setSteps(data.steps || []);
      } else {
        setStatus(`❌ Error: ${data.error}`);
        if (data.details) {
          setSteps([data.details]);
        }
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Run Database Migration</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to create the loading_screens table in your database.
        </p>
        
        <button
          onClick={runMigration}
          disabled={isRunning}
          className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Migration...' : 'Run Migration'}
        </button>
        
        {status && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-semibold mb-2">{status}</p>
            {steps.length > 0 && (
              <div className="mt-2 space-y-1">
                {steps.map((step, index) => (
                  <p key={index} className="text-sm text-gray-700">{step}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What this does:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li>Drops the old loading_pages table</li>
            <li>Creates new loading_screens table with correct schema</li>
            <li>Adds all necessary columns and constraints</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>After migration:</strong> Go to Loading Screens page and refresh. The workbench should work!
          </p>
        </div>
      </div>
    </div>
  );
}

