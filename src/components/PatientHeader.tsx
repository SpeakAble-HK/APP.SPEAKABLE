import React from 'react';
import { ChevronLeft, Download, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';

interface PatientHeaderProps {
  patientName: string;
  chineseName: string;
  age: number;
  gender: 'M' | 'F';
  caseNumber: string;
  school: string;
  mainLanguage: string;
  secondaryLanguage: string;
  therapist: string;
  nextAppointment?: string;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patientName,
  chineseName,
  age,
  gender,
  caseNumber,
  school,
  mainLanguage,
  secondaryLanguage,
  therapist,
  nextAppointment,
}) => {
  return (
    <div className="bg-white border-b border-border">
      <div className="px-6 py-4">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">
                {chineseName.charAt(0)}
              </span>
            </div>

            {/* Patient Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {patientName} {chineseName}
                </h2>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  現有個案
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  {gender} | {age}.2 (出生日: 2019-02-18) | 個案編號: {caseNumber}
                </p>
                <p>就讀學校: {school} (K2) | 主要語言: {mainLanguage}</p>
                <p>治療師: {therapist}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              匯出報告
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-t border-border pt-4">
          <button className="pb-2 border-b-2 border-primary text-primary font-medium text-sm">
            總覽
          </button>
          <button className="pb-2 text-muted-foreground hover:text-foreground text-sm">
            語音分析
          </button>
          <button className="pb-2 text-muted-foreground hover:text-foreground text-sm">
            語言評估
          </button>
          <button className="pb-2 text-muted-foreground hover:text-foreground text-sm">
            治療記錄
          </button>
          <button className="pb-2 text-muted-foreground hover:text-foreground text-sm">
            進度比較
          </button>
          <button className="pb-2 text-muted-foreground hover:text-foreground text-sm">
            家長筆記
          </button>
        </div>
      </div>
    </div>
  );
};
