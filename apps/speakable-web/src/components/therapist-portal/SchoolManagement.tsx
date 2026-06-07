import React, { useState } from 'react';

interface School {
  id: number;
  name: string;
  address: string;
  numClasses: number;
}

const initialSchools: School[] = [
  { id: 1, name: '聖心小學', address: '九龍塘', numClasses: 3 },
  { id: 2, name: '明愛學校', address: '沙田', numClasses: 2 },
];

const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [form, setForm] = useState({ name: '', address: '', numClasses: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    const s = schools.find(sch => sch.id === id);
    if (s) {
      setEditingId(id);
      setForm({ name: s.name, address: s.address, numClasses: s.numClasses });
    }
  };

  const handleSave = () => {
    setSchools(schools.map(s =>
      s.id === editingId ? { ...s, ...form } : s
    ));
    setEditingId(null);
    setForm({ name: '', address: '', numClasses: 1 });
  };

  const handleAdd = () => {
    setSchools([
      ...schools,
      { id: Date.now(), ...form }
    ]);
    setForm({ name: '', address: '', numClasses: 1 });
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6366f1', marginBottom: 12 }}>🏫 學校管理</h2>
      <p style={{ color: '#6b7280', marginBottom: 8 }}>管理您負責的學校及班級。</p>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px #e5e7eb' }}>
        <table style={{ width: '100%', marginBottom: 16, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8 }}>學校名稱</th>
              <th style={{ padding: 8 }}>地址</th>
              <th style={{ padding: 8 }}>班級數</th>
              <th style={{ padding: 8 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {schools.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: 100 }} />
                  ) : s.name}
                </td>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ width: 100 }} />
                  ) : s.address}
                </td>
                <td style={{ padding: 8 }}>
                  {editingId === s.id ? (
                    <input type="number" min={1} max={20} value={form.numClasses} onChange={e => setForm(f => ({ ...f, numClasses: Number(e.target.value) }))} style={{ width: 50 }} />
                  ) : s.numClasses}
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
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>新增學校</h3>
          <input placeholder="學校名稱" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ marginRight: 8, width: 100 }} />
          <input placeholder="地址" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ marginRight: 8, width: 100 }} />
          <input type="number" min={1} max={20} value={form.numClasses} onChange={e => setForm(f => ({ ...f, numClasses: Number(e.target.value) }))} style={{ marginRight: 8, width: 50 }} />
          <button onClick={handleAdd}>新增</button>
        </div>
      </div>
    </section>
  );
};

export default SchoolManagement;
