import { getAllSchemas } from '../lib/minigame-sdk/schema';

export default function MigrationGuide() {
  const schemas = getAllSchemas();

  return (
    <div className="migration-guide p-8">
      <h1 className="text-3xl font-bold mb-6">Database Migration Guide</h1>
      <p className="mb-4">
        Run these SQL statements in your Supabase SQL editor to create the required tables.
      </p>

      {schemas.map((schema, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Migration {index + 1}</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
            <code>{schema}</code>
          </pre>
        </div>
      ))}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2">Post-Migration Steps</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Run seed script for game_metadata table</li>
          <li>Configure RLS policies for all tables</li>
          <li>Set up Supabase Edge Functions for API endpoints</li>
          <li>Test telemetry pipeline end-to-end</li>
        </ol>
      </div>
    </div>
  );
}
