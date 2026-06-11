// Helper to generate therapist-aligned report text/HTML from analytics data
import { UserAnalytics } from './useTherapistAnalytics';

export function generateReport(analytics: UserAnalytics, therapistName: string, dateRange: string, comments: string) {
  return `
    <h2>Speech Therapy Progress Report</h2>
    <p><strong>Client:</strong> ${analytics.name} <br/>
    <strong>Date:</strong> ${dateRange} <br/>
    <strong>Therapist:</strong> ${therapistName}</p>
    <h3>1. Summary of Progress</h3>
    <ul>
      <li>Overall accuracy: ${(analytics.accuracy * 100).toFixed(1)}%</li>
      <li>Sessions completed: ${analytics.sessions}</li>
    </ul>
    <h3>2. Detailed Analytics</h3>
    <table border="1" cellpadding="4" style="border-collapse:collapse;">
      <tr><th>Phoneme</th><th>Accuracy</th><th>Errors</th></tr>
      ${analytics.phonemeStats.map(p => `<tr><td>${p.phoneme}</td><td>${(p.accuracy*100).toFixed(1)}%</td><td>${p.errors}</td></tr>`).join('')}
    </table>
    <h4>Error Types</h4>
    <ul>
      ${Object.entries(analytics.errorTypes).map(([type, count]) => `<li>${type}: ${count}</li>`).join('')}
    </ul>
    <h3>3. Progress Over Time</h3>
    <ul>
      ${analytics.progress.map(p => `<li>${p.date}: ${(p.accuracy*100).toFixed(1)}%</li>`).join('')}
    </ul>
    <h3>4. Therapist Comments</h3>
    <p>${comments || '(none)'}</p>
    <p style="margin-top:2em;">Signature: ____________________</p>
  `;
}
