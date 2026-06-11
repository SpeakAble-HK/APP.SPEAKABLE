import React from 'react';
import { Info, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';

interface PhoneticItem {
  name: string;
  phonetic: string;
  example: string;
  accuracy: number;
  percentile: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

interface PhoneticAnalysisProps {
  title?: string;
  items?: PhoneticItem[];
}

const DEFAULT_ITEMS: PhoneticItem[] = [
  {
    name: '初聲',
    phonetic: '/n/ → /l/',
    example: '你 → 里',
    accuracy: 28,
    percentile: 92,
    status: 'poor',
  },
  {
    name: '初聲',
    phonetic: '/ng/ → 零聲母',
    example: '嗯 → 恩',
    accuracy: 24,
    percentile: 80,
    status: 'fair',
  },
  {
    name: '韻尾',
    phonetic: '/u/ /ɔ:/',
    example: '烏 → 烏',
    accuracy: 15,
    percentile: 65,
    status: 'fair',
  },
  {
    name: '韻尾',
    phonetic: '/m/ → /n/',
    example: '新 → 新',
    accuracy: 12,
    percentile: 45,
    status: 'poor',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent':
      return 'bg-green-500';
    case 'good':
      return 'bg-blue-500';
    case 'fair':
      return 'bg-amber-500';
    case 'poor':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'excellent':
      return '優秀';
    case 'good':
      return '良好';
    case 'fair':
      return '一般';
    case 'poor':
      return '需改進';
    default:
      return '未知';
  }
};

export const PhoneticAnalysis: React.FC<PhoneticAnalysisProps> = ({
  title = '語音分析總覽',
  items = DEFAULT_ITEMS,
}) => {
  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold text-foreground">
              {title}
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">語音分析基於最近的評估數據</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            查看詳細
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="pb-4 border-b border-border last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {item.name}
                    </span>
                    <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      {item.phonetic}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    例子: {item.example}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{item.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">{item.percentile}nd</p>
                </div>
              </div>
              <Progress
                value={item.accuracy}
                className="h-2"
                indicatorClassName={getStatusColor(item.status)}
              />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-3">準確度範圍:</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>優秀 (80-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>良好 (60-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>一般 (40-59%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>需改進 (&lt;40%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
