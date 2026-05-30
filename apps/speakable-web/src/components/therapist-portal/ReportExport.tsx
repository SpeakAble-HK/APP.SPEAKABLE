import React from 'react';


import React, { useState } from 'react';

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
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px #e5e7eb' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ marginRight: 8 }}>選擇學生：</label>
          <select value={selectedStudent} onChange={e => setSelectedStudent(Number(e.target.value))} style={{ marginRight: 16 }}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label style={{ marginRight: 8 }}>格式：</label>
          <select value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)} style={{ marginRight: 16 }}>
            {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button onClick={handleExport}>匯出</button>
        </div>
        {message && <div style={{ color: '#22c55e', fontWeight: 600 }}>{message}</div>}
      </div>
    </section>
  );
};

export default ReportExport;
