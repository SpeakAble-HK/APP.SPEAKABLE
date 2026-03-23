import { useState } from "react";
import { Users, Plus, Trash2, BookOpen, BarChart3, Clock, Target, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSTDashboard, type StudentData } from "@/hooks/useSTDashboard";
import { useAuth } from "@/hooks/useAuth";
import { phonemeCategories, semanticCategories } from "@/data/lessons";
import { toast } from "sonner";

export default function STDashboardPage() {
  const { user } = useAuth();
  const { students, loading, addStudent, removeStudent, assignCategory } = useSTDashboard();
  const [searchUsername, setSearchUsername] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  if (!user) return null;

  const handleAddStudent = async () => {
    if (!searchUsername.trim()) return;
    setIsAdding(true);
    const result = await addStudent(searchUsername.trim());
    setIsAdding(false);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success('已成功新增學生');
      setSearchUsername('');
    }
  };

  const handleAssign = async (studentId: string, category: string) => {
    await assignCategory(studentId, category);
    toast.success(`已指定 ${category} 練習`);
  };

  const allCategories = [...phonemeCategories, ...semanticCategories];

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

      {/* Add Student */}
      <section className="px-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                新增學生
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="輸入學生用戶名"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="pl-9 h-11 rounded-xl"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                  />
                </div>
                <Button onClick={handleAddStudent} disabled={isAdding} className="h-11 rounded-xl gap-2">
                  <Plus className="h-4 w-4" />
                  {isAdding ? '新增中...' : '新增'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Student List */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-extrabold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            學生列表 ({students.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : students.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">尚未新增學生</p>
                <p className="text-sm text-muted-foreground mt-1">在上方搜尋用戶名來新增學生</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <Card key={student.student_id} className="overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setSelectedStudent(selectedStudent?.student_id === student.student_id ? null : student)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                          <span className="text-lg font-extrabold text-accent">{student.nickname[0]}</span>
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{student.nickname}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.age ? `${student.age} 歲` : ''} · 最後活動: {student.last_active ? new Date(student.last_active).toLocaleDateString() : '無'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeStudent(student.student_id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <Clock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-sm font-extrabold text-foreground">-</p>
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
                  {selectedStudent?.student_id === student.student_id && (
                    <div className="border-t border-border p-4 bg-muted/20">
                      <p className="text-sm font-bold text-foreground mb-3">指定練習模組</p>
                      <div className="flex flex-wrap gap-2">
                        {allCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleAssign(student.student_id, cat.id)}
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
          )}
        </div>
      </section>
    </div>
  );
}
