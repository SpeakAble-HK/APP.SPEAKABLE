import React, { useState } from 'react';
import { UserAnalytics } from './useTherapistAnalytics';
import { generateReport } from './reportTemplate';
import type { SavedNarrativeAssessment } from '../../hooks/useNarrativeAssessment';

interface Props {
  analytics: UserAnalytics;
  latestAssessment?: SavedNarrativeAssessment;
  onClose: () => void;
}

const ProgressReportGenerator: React.FC<Props> = ({ analytics, latestAssessment, onClose }) => {
  const [therapistName, setTherapistName] = useState('');
  const [dateRange, setDateRange] = useState('2026-05-01 to 2026-05-30');
  const [comments, setComments] = useState('');

  const reportHtml = generateReport(analytics, therapistName, dateRange, comments, latestAssessment);

  const handleExport = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write('<html><head><title>Progress Report</title></head><body>' + reportHtml + '</body></html>');
      win.document.close();
      win.print();
    }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #ccc', padding: 24, marginTop: 32 }}>
      <h2>Progress Report Preview</h2>
      <div style={{ marginBottom: 16 }}>
        <label>Therapist Name: <input value={therapistName} onChange={e => setTherapistName(e.target.value)} /></label>
        <br />
        <label>Date Range: <input value={dateRange} onChange={e => setDateRange(e.target.value)} /></label>
        <br />
        <label>Comments:<br />
          <textarea value={comments} onChange={e => setComments(e.target.value)} rows={3} style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ border: '1px solid #eee', padding: 16, marginBottom: 16 }}>
        <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
      </div>
      <button onClick={handleExport} style={{ marginRight: 12 }}>Export/Print</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ProgressReportGenerator;
