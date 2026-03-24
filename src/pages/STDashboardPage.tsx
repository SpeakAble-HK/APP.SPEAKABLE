import { useState } from "react";
import { BarChart3, Star, Clock, CheckCircle2, TrendingUp } from "lucide-react";

// Mock data for the dashboard
const MOCK_WEEKLY = [
  { day: "週一", count: 2 },
  { day: "週二", count: 0 },
  { day: "週三", count: 3 },
  { day: "週四", count: 5 },
  { day: "週五", count: 4 },
  { day: "週六", count: 1 },
  { day: "週日", count: 0 },
];

const MOCK_STATS = {
  totalAccounts: 12,
  totalCompletions: 128,
  avgAccuracy: 76,
  avgUsageMinutes: 45,
  weeklyCompletions: 15,
};

export default function STDashboardPage() {
  const maxCount = Math.max(...MOCK_WEEKLY.map(d => d.count), 1);

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-xl font-extrabold text-foreground">治療師控制台</h1>
          <p className="text-sm text-muted-foreground">正在追蹤 {MOCK_STATS.totalAccounts} 個帳戶的進度</p>
        </div>

        {/* Top Row: Participation Chart + Total Badge */}
        <div className="grid grid-cols-5 gap-3">
          {/* Weekly Participation */}
          <div className="col-span-3 bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-foreground">參與程度</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">每週概覽</span>
            </div>
            <div className="flex items-end justify-between gap-1 h-24">
              {MOCK_WEEKLY.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-1">
                  <div
                    className="w-full max-w-[24px] rounded-md bg-primary/70 transition-all"
                    style={{ height: `${Math.max((d.count / maxCount) * 80, 4)}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Completions Badge */}
          <div className="col-span-2 bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Star className="h-7 w-7 text-primary" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">{MOCK_STATS.totalCompletions}</span>
            <span className="text-[10px] text-muted-foreground">掌握詞彙量</span>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Accuracy */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-muted-foreground">平均準確率</span>
            </div>
            <span className="text-2xl font-extrabold text-foreground">{MOCK_STATS.avgAccuracy}%</span>
          </div>

          {/* Usage Time */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold text-muted-foreground">平均使用時間</span>
            </div>
            <span className="text-2xl font-extrabold text-foreground">{MOCK_STATS.avgUsageMinutes} 分鐘</span>
          </div>

          {/* Completions this week */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-xs font-bold text-muted-foreground">本週完成數</span>
            </div>
            <span className="text-2xl font-extrabold text-foreground">{MOCK_STATS.weeklyCompletions}</span>
          </div>

          {/* Total Accounts */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-destructive" />
              <span className="text-xs font-bold text-muted-foreground">帳戶總數</span>
            </div>
            <span className="text-2xl font-extrabold text-foreground">{MOCK_STATS.totalAccounts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
