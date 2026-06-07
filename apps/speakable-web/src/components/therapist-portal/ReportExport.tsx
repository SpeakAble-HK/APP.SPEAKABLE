
import React, { useState } from 'react';
// import './ReportExport.css';

const students = [
  { id: 1, name: '陳小明' },
  { id: 2, name: '李小華' },
  { id: 3, name: '黃嘉欣' },
];
const formats = [
  { id: 'pdf', name: 'PDF' },
  { id: 'csv', name: 'CSV' },
];

const ReportExport: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<number>(students[0].id);
  const [selectedFormat, setSelectedFormat] = useState<string>(formats[0].id);
  const [message, setMessage] = useState('');

  const handleExport = () => {
    setMessage(`已匯出 ${students.find(s => s.id === selectedStudent)?.name} 的報告（${formats.find(f => f.id === selectedFormat)?.name} 格式）`);
    setTimeout(() => setMessage(''), 2500);
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6366f1', marginBottom: 12 }}>📤 報告匯出</h2>
      <p style={{ color: '#6b7280', marginBottom: 8 }}>匯出學生學習及使用數據報告。</p>
      <div className="report-export-container">
        <div className="report-export-controls">
          <label htmlFor="student-select" className="report-export-label">選擇學生：</label>
          <select
            id="student-select"
            value={selectedStudent}
            onChange={e => setSelectedStudent(Number(e.target.value))}
            className="report-export-select"
            aria-label="選擇學生"
          >
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label htmlFor="format-select" className="report-export-label">格式：</label>
          <select
            id="format-select"
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            className="report-export-select"
            aria-label="選擇格式"
          >
            {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button className="report-export-btn" onClick={handleExport}>匯出</button>
        </div>
        {message && <div className="report-export-message">{message}</div>}
      </div>
    </section>
  );
};

export default ReportExport;
