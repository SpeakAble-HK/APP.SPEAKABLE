
import React from 'react';

import StudentManagement from './StudentManagement';
import SchoolManagement from './SchoolManagement';
import ModuleAssignment from './ModuleAssignment';
import AnalyticsDashboard from './AnalyticsDashboard';
import ReportExport from './ReportExport';
import TherapistCalibration from './TherapistCalibration';


const TherapistDashboard: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7', marginBottom: 24 }}>👩‍⚕️ 言語治療師平台</h1>
      <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: 32 }}>
        管理學生、分配學習模組、查看練習數據及匯出報告。
      </p>
      <div style={{ background: '#f3f4f6', borderRadius: 16, padding: 24, color: '#333', marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>功能總覽</h2>
        <ul style={{ fontSize: '1.05rem', lineHeight: 2 }}>
          <li>👦 學生管理（新增、編輯、分組）</li>
          <li>📚 分配學習模組（課堂/家課）</li>
          <li>📈 學生練習數據及適應引擎分析</li>
          <li>📤 匯出學習及使用報告</li>
        </ul>
        <p style={{ color: '#a855f7', marginTop: 16 }}>（所有介面及內容均為廣東話）</p>
      </div>
      <TherapistCalibration />
      <SchoolManagement />
      <StudentManagement />
      <ModuleAssignment />
      <AnalyticsDashboard />
      <ReportExport />
    </div>
  );
};

export default TherapistDashboard;
