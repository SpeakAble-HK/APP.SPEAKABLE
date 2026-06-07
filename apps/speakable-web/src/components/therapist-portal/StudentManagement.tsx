import React, { useState } from 'react';

// import './StudentManagement.css';

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
    <section className="sm-section">
      <h2 className="sm-title">👦 學生管理</h2>
      <p className="sm-desc">管理學生名單、分組及基本資料。</p>
      <div className="sm-card">
        <table className="sm-table">
          <thead>
            <tr className="sm-table-head-row">
              <th className="sm-table-th">姓名</th>
              <th className="sm-table-th">分組</th>
              <th className="sm-table-th">年齡</th>
              <th className="sm-table-th">操作</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="sm-table-row">
                <td className="sm-table-td">
                  {editingId === s.id ? (
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="sm-input sm-input-name" placeholder="姓名" aria-label="姓名" />
                  ) : s.name}
                </td>
                <td className="sm-table-td">
                  {editingId === s.id ? (
                    <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} className="sm-select" aria-label="分組">
                      {groups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  ) : s.group}
                </td>
                <td className="sm-table-td">
                  {editingId === s.id ? (
                    <input type="number" value={form.age} min={3} max={18} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} className="sm-input sm-input-age" placeholder="年齡" aria-label="年齡" />
                  ) : s.age}
                </td>
                <td className="sm-table-td">
                  {editingId === s.id ? (
                    <>
                      <button onClick={handleSave} className="sm-btn sm-btn-save">儲存</button>
                      <button onClick={() => setEditingId(null)} className="sm-btn">取消</button>
                    </>
                  ) : (
                    <button onClick={() => handleEdit(s.id)} className="sm-btn">編輯</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="sm-add-section">
          <h3 className="sm-add-title">新增學生</h3>
          <input placeholder="姓名" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="sm-input sm-input-name" />
          <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} className="sm-select" aria-label="分組">
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input type="number" min={3} max={18} value={form.age} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} className="sm-input sm-input-age" placeholder="年齡" />
          <button onClick={handleAdd} className="sm-btn sm-btn-add">新增</button>
        </div>
      </div>
    </section>
  );
};

export default StudentManagement;
