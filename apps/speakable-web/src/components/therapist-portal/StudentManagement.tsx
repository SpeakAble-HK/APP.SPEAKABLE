import React from 'react';


import React, { useState } from 'react';

type Student = {
  id: number;
  name: string;
  group: string;
  age: number;
};

const initialStudents: Student[] = [
  { id: 1, name: '陳小明', group: 'A', age: 7 },
  { id: 2, name: '李小華', group: 'A', age: 8 },
  { id: 3, name: '黃嘉欣', group: 'B', age: 7 },
];

const groups = ['A', 'B', 'C'];

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', group: 'A', age: 7 });

  const handleEdit = (id: number) => {
    const s = students.find(stu => stu.id === id);
    if (s) {
      setEditingId(id);
      setForm({ name: s.name, group: s.group, age: s.age });
    }
  };

  const handleSave = () => {
    setStudents(students.map(s =>
      s.id === editingId ? { ...s, ...form } : s
    ));
    setEditingId(null);
    setForm({ name: '', group: 'A', age: 7 });
  };

  const handleAdd = () => {
    setStudents([
      ...students,
      { id: Date.now(), ...form }
    ]);
    setForm({ name: '', group: 'A', age: 7 });
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6366f1', marginBottom: 12 }}>👦 學生管理</h2>
      <p style={{ color: '#6b7280', marginBottom: 8 }}>管理學生名單、分組及基本資料。</p>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px #e5e7eb' }}>
        <table style={{ width: '100%', marginBottom: 16, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8 }}>姓名</th>
              <th style={{ padding: 8 }}>分組</th>
              <th style={{ padding: 8 }}>年齡</th>
              <th style={{ padding: 8 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: 80 }} />
                  ) : s.name}
                </td>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                      {groups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  ) : s.group}
                </td>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <input type="number" value={form.age} min={3} max={18} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} style={{ width: 50 }} />
                  ) : s.age}
                </td>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <>
                      <button onClick={handleSave} style={{ marginRight: 8 }}>儲存</button>
                      <button onClick={() => setEditingId(null)}>取消</button>
                    </>
                  ) : (
                    <button onClick={() => handleEdit(s.id)}>編輯</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>新增學生</h3>
          <input placeholder="姓名" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ marginRight: 8, width: 80 }} />
          <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} style={{ marginRight: 8 }}>
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input type="number" min={3} max={18} value={form.age} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} style={{ marginRight: 8, width: 50 }} />
          <button onClick={handleAdd}>新增</button>
        </div>
      </div>
    </section>
  );
};

export default StudentManagement;
