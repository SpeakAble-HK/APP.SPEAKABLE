// Helper to generate therapist-aligned report text/HTML from analytics data
import { UserAnalytics } from './useTherapistAnalytics';
import { RUBRIC_DOMAINS, RUBRIC_ELEMENTS } from '@/data/narrativeAssessment';
import type { SavedNarrativeAssessment } from '../../hooks/useNarrativeAssessment';

function narrativeSection(assessment?: SavedNarrativeAssessment): string {
  if (!assessment) return '';
  const r = assessment.result;
  const domainRows = RUBRIC_DOMAINS.map((d) => {
    const dr = r.domainResults.find((x) => x.domain === d.id);
    return `<tr><td>${d.label}</td><td>${(dr?.percent ?? 0).toFixed(0)}%</td><td>${Math.round(d.weight * 100)}%</td></tr>`;
  }).join('');
  const elementRows = RUBRIC_ELEMENTS.filter((e) => typeof assessment.scores[e.id] === 'number')
    .map((e) => `<tr><td>${e.label} (${e.labelZh})</td><td>${assessment.scores[e.id]}/4</td></tr>`)
    .join('');
  return `
    <h3>5. Narrative Assessment Profile 敘事評估檔案</h3>
    <p><em>Framework: MISL / NSS macrostructure + microstructure with Cantonese intelligibility markers.</em></p>
    <p><strong>Total Narrative Proficiency:</strong> ${r.totalProficiency.toFixed(0)}/100 — <strong>${r.band} (${r.bandZh})</strong></p>
    <table border="1" cellpadding="4" style="border-collapse:collapse;">
      <tr><th>Domain</th><th>Score</th><th>Weight</th></tr>
      ${domainRows}
    </table>
    <h4>Element Detail</h4>
    <table border="1" cellpadding="4" style="border-collapse:collapse;">
      <tr><th>Element</th><th>Score (0–4)</th></tr>
      ${elementRows}
    </table>
    ${assessment.notes ? `<p><strong>Narrative notes:</strong> ${assessment.notes}</p>` : ''}
  `;
}

export function generateReport(analytics: UserAnalytics, therapistName: string, dateRange: string, comments: string, assessment?: SavedNarrativeAssessment) {
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
    ${narrativeSection(assessment)}
    <p style="margin-top:2em;">Signature: ____________________</p>
  `;
}
