import { useState } from "react";
import { Users, BookOpen, BarChart3, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { phonemeCategories } from "@/data/lessons";
import { toast } from "sonner";

interface MockStudent {
  id: string;
  nickname: string;
  age: number;
  completed_lessons: number;
  accuracy_avg: number;
  total_xp: number;
  usage_minutes: number;
}

const MOCK_STUDENTS: MockStudent[] = [
  { id: '1', nickname: '小明', age: 6, completed_lessons: 3, accuracy_avg: 78, total_xp: 150, usage_minutes: 45 },
  { id: '2', nickname: '小芳', age: 5, completed_lessons: 1, accuracy_avg: 62, total_xp: 50, usage_minutes: 20 },
  { id: '3', nickname: '阿俊', age: 7, completed_lessons: 5, accuracy_avg: 85, total_xp: 300, usage_minutes: 90 },
];

export default function STDashboardPage() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const handleAssign = (studentId: string, categoryLabel: string) => {
    toast.success(`已指定 ${categoryLabel} 練習`);
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <section className="px-4 pt-8 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">言語治療師控制台</h1>
              <p className="text-sm text-muted-foreground">管理學生進度及指定練習</p>
            </div>
          </div>
        </div>
      </section>

      {/* Student List */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-extrabold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            學生列表 ({MOCK_STUDENTS.length})
          </h2>

          <div className="space-y-4">
            {MOCK_STUDENTS.map((student) => (
              <Card key={student.id} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                      <span className="text-lg font-extrabold text-accent">{student.nickname[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{student.nickname}</p>
                      <p className="text-xs text-muted-foreground">{student.age} 歲</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <Clock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-sm font-extrabold text-foreground">{student.usage_minutes}分鐘</p>
                      <p className="text-[10px] text-muted-foreground">使用時間</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <Target className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-sm font-extrabold text-foreground">{student.accuracy_avg}%</p>
                      <p className="text-[10px] text-muted-foreground">準確率</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <BookOpen className="h-4 w-4 text-success mx-auto mb-1" />
                      <p className="text-sm font-extrabold text-foreground">{student.completed_lessons}</p>
                      <p className="text-[10px] text-muted-foreground">已完成</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <BarChart3 className="h-4 w-4 text-accent mx-auto mb-1" />
                      <p className="text-sm font-extrabold text-foreground">{student.total_xp}</p>
                      <p className="text-[10px] text-muted-foreground">XP</p>
                    </div>
                  </div>
                </div>

                {/* Expanded: Assign modules */}
                {selectedStudent === student.id && (
                  <div className="border-t border-border p-4 bg-muted/20">
                    <p className="text-sm font-bold text-foreground mb-3">指定練習模組</p>
                    <div className="flex flex-wrap gap-2">
                      {phonemeCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleAssign(student.id, cat.labelZh)}
                          className="px-3 py-2 rounded-xl bg-card border border-border text-xs font-bold hover:border-primary/30 hover:bg-primary/5 transition-colors"
                        >
                          {cat.emoji} {cat.labelZh}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
