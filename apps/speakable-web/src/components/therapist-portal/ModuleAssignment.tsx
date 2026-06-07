
import React, { useState } from 'react';

// Temporary CSS-in-JS for demonstration; move to external CSS in production
const selectStyle: React.CSSProperties = { marginRight: 16 };

const students = [
  { id: 1, name: '陳小明' },
  { id: 2, name: '李小華' },
  { id: 3, name: '黃嘉欣' },
];
const modules = [
  { id: 'syali', name: 'Syali 練習' },
  { id: 'bilabial', name: '雙唇音練習' },
  { id: 'tone', name: '聲調練習' },
];

const ModuleAssignment: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<number>(students[0].id);
  const [selectedModule, setSelectedModule] = useState<string>(modules[0].id);
  const [assignments, setAssignments] = useState<{[key:number]: string}>({});

  const handleAssign = () => {
    setAssignments(a => ({ ...a, [selectedStudent]: selectedModule }));
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6366f1', marginBottom: 12 }}>📚 分配學習模組</h2>
      <p style={{ color: '#6b7280', marginBottom: 8 }}>為學生分配課堂或家課模組。</p>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px #e5e7eb' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ marginRight: 8 }}>選擇學生：</label>
          <select
            value={selectedStudent}
            onChange={e => setSelectedStudent(Number(e.target.value))}
            style={selectStyle}
            title="選擇學生"
          >
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label htmlFor="module-select" style={{ marginRight: 8 }}>選擇模組：</label>
          <select
            id="module-select"
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            style={selectStyle}
            title="選擇模組"
          >
            {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button onClick={handleAssign}>分配</button>
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>分配結果</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8 }}>學生</th>
              <th style={{ padding: 8 }}>已分配模組</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 8 }}>{s.name}</td>
                <td style={{ padding: 8 }}>{assignments[s.id] ? modules.find(m => m.id === assignments[s.id])?.name : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ModuleAssignment;
