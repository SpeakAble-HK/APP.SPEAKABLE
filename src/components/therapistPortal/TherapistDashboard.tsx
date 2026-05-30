
import { useSTDashboard } from '@/hooks/useSTDashboard';

const TherapistDashboard: React.FC = () => {
  const { students, loading: studentsLoading } = useSTDashboard();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { data, loading, error } = useTherapistAnalytics(selectedUser || '');
  const [showReport, setShowReport] = useState(false);

  // Set default selected user when students load
  React.useEffect(() => {
    if (!selectedUser && students.length > 0) {
      setSelectedUser(students[0].student_id);
    }
  }, [students, selectedUser]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Therapist Portal Dashboard</h1>
      <div className="mb-4">
        <label className="font-medium">
          Select User:{' '}
          <select
            className="ml-2 border rounded px-2 py-1"
            value={selectedUser || ''}
            onChange={e => setSelectedUser(e.target.value)}
            disabled={studentsLoading || students.length === 0}
          >
            {students.map(u => (
              <option key={u.student_id} value={u.student_id}>{u.nickname || u.student_id}</option>
            ))}
          </select>
        </label>
      </div>
      {(studentsLoading || !selectedUser) && <div>Loading students...</div>}
      {selectedUser && loading && <div>Loading analytics...</div>}
      {selectedUser && error && <div className="text-red-600">Error: {error}</div>}
      {selectedUser && !loading && !error && data && (
        <>
          <h2 className="text-lg font-semibold mt-4">User: {data.name}</h2>
          <p>Sessions: {data.sessions} | Overall Accuracy: {(data.accuracy * 100).toFixed(1)}%</p>
          <h3 className="font-semibold mt-4">Phoneme Performance</h3>
          <table className="border border-gray-300 w-full text-sm mt-2">
            <thead>
              <tr className="bg-gray-100"><th className="p-2">Phoneme</th><th className="p-2">Accuracy</th><th className="p-2">Errors</th></tr>
            </thead>
            <tbody>
              {data.phonemeStats.map(p => (
                <tr key={p.phoneme} className="text-center border-t">
                  <td className="p-2">{p.phoneme}</td>
                  <td className="p-2">{(p.accuracy * 100).toFixed(1)}%</td>
                  <td className="p-2">{p.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="font-semibold mt-4">Error Types</h3>
          <ul className="list-disc ml-6">
            {Object.entries(data.errorTypes).map(([type, count]) => (
              <li key={type}>{type}: {count}</li>
            ))}
          </ul>
          <h3 className="font-semibold mt-4">Progress Over Time</h3>
          <ul className="list-disc ml-6">
            {data.progress.map(p => (
              <li key={p.date}>{p.date}: {(p.accuracy * 100).toFixed(1)}%</li>
            ))}
          </ul>
          <button
            onClick={() => setShowReport(true)}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate Progress Report
          </button>
          {showReport && (
            <ProgressReportGenerator
              analytics={data}
              onClose={() => setShowReport(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TherapistDashboard;
