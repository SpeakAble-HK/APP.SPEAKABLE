import React from 'react';
// @ts-ignore
import jsPDF from 'jspdf';


import React from 'react';

const progressData = [
  { name: '陳小明', module: 'Syali 練習', progress: 80 },
  { name: '李小華', module: '雙唇音練習', progress: 60 },
  { name: '黃嘉欣', module: '聲調練習', progress: 95 },
];

const AnalyticsDashboard: React.FC = () => {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6366f1', marginBottom: 12 }}>📈 數據分析</h2>
      <p style={{ color: '#6b7280', marginBottom: 8 }}>查看學生練習進度、適應引擎分析及成效。</p>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px #e5e7eb' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>學生練習進度</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8 }}>學生</th>
              <th style={{ padding: 8 }}>模組</th>
              <th style={{ padding: 8 }}>完成度</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 8 }}>{d.name}</td>
                <td style={{ padding: 8 }}>{d.module}</td>
                <td style={{ padding: 8 }}>
                  <div style={{ width: 120, background: '#f3f4f6', borderRadius: 8, display: 'inline-block', marginRight: 8 }}>
                    <div style={{ width: `${d.progress}%`, background: '#a855f7', height: 12, borderRadius: 8 }} />
                  </div>
                  <span>{d.progress}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>適應引擎分析（簡報）</h3>
        <ul style={{ color: '#6366f1', fontWeight: 500 }}>
          <li>大部分學生在「聲調練習」表現優異</li>
          <li>「雙唇音練習」需加強，建議增加練習次數</li>
        </ul>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '24px 0 8px' }}>報告模板匯出</h3>
        <ExportTemplates />
      </div>
    </section>
  );
};


const templateContent = {
  '學校平台': `【學校平台專用報告】\n學生練習進度：\n- 陳小明：Syali 練習 80%\n- 李小華：雙唇音練習 60%\n- 黃嘉欣：聲調練習 95%\n\n分析摘要：\n- 大部分學生在「聲調練習」表現優異\n- 「雙唇音練習」需加強，建議增加練習次數\n` ,
  '教育局': `【教育局專用報告】\n學生學習模組及成效：\n- 陳小明：Syali 練習 80%\n- 李小華：雙唇音練習 60%\n- 黃嘉欣：聲調練習 95%\n\n總結：\n- 學生普遍適應新練習模式\n- 建議持續追蹤個別進度\n`,
  '醫管局兒科醫生': `【醫管局兒科醫生專用報告】\n個案摘要：\n- 陳小明：語音進步明顯，建議繼續現有訓練\n- 李小華：需加強雙唇音練習，建議家長協助\n- 黃嘉欣：聲調掌握良好，無需特別跟進\n\n臨床建議：\n- 定期覆診，按需要調整訓練內容\n`
};

const ExportTemplates: React.FC = () => {
  const [msg, setMsg] = React.useState('');
  const handleExport = (target: string) => {
    const content = templateContent[target] || '暫無內容';
    const doc = new jsPDF({ encoding: 'UTF-8' });
    // 標誌（以 emoji/文字模擬）
    let logo = '';
    if (target === '學校平台') logo = '🏫';
    if (target === '教育局') logo = '🏢';
    if (target === '醫管局兒科醫生') logo = '🏥';
    // 標題
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`${logo} ${target} 報告`, 15, 22);
    // 分隔線
    doc.setDrawColor(160);
    doc.line(15, 26, 195, 26);
    // 內容
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    const lines = doc.splitTextToSize(content, 180);
    let y = 34;
    lines.forEach(line => {
      doc.text(line, 15, y);
      y += 9;
    });
    doc.save(`${target}_報告.pdf`);
    setMsg(`已匯出「${target}」專用 PDF 報告`);
    setTimeout(() => setMsg(''), 2500);
  };
  return (
    <div>
      <button onClick={() => handleExport('學校平台')} style={{ marginRight: 12 }}>匯出至學校平台</button>
      <button onClick={() => handleExport('教育局')} style={{ marginRight: 12 }}>匯出至教育局</button>
      <button onClick={() => handleExport('醫管局兒科醫生')}>匯出至醫管局兒科醫生</button>
      {msg && <div style={{ color: '#22c55e', fontWeight: 600, marginTop: 8 }}>{msg}</div>}
    </div>
  );
};

export default AnalyticsDashboard;
