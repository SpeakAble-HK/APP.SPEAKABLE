import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Clock, Target, BookOpen, Star } from "lucide-react";
import { phonemeCategories } from "@/data/lessons";
import { toast } from "sonner";

interface MockAccount {
  userId: string;
  username: string;
  chineseName: string;
  phone: string;
  usageMinutes: number;
  accuracy: number;
  completions: number;
  totalPoints: number;
}

const MOCK_ACCOUNTS: MockAccount[] = [
  { userId: "SHK-001", username: "leo_chan", chineseName: "陳小明", phone: "9123-4567", usageMinutes: 90, accuracy: 85, completions: 12, totalPoints: 450 },
  { userId: "SHK-002", username: "mei_wong", chineseName: "黃美芳", phone: "9234-5678", usageMinutes: 45, accuracy: 72, completions: 6, totalPoints: 200 },
  { userId: "SHK-003", username: "jun_li", chineseName: "李俊傑", phone: "9345-6789", usageMinutes: 120, accuracy: 91, completions: 18, totalPoints: 680 },
  { userId: "SHK-004", username: "ying_lam", chineseName: "林嘉瑩", phone: "9456-7890", usageMinutes: 30, accuracy: 58, completions: 3, totalPoints: 90 },
  { userId: "SHK-005", username: "hei_cheung", chineseName: "張曉希", phone: "9567-8901", usageMinutes: 60, accuracy: 79, completions: 8, totalPoints: 310 },
];

export default function STAccountsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = MOCK_ACCOUNTS.filter(
    (a) =>
      a.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.chineseName.includes(searchQuery)
  );

  const handleAssign = (userId: string, categoryLabel: string) => {
    toast.success(`已為 ${userId} 指定「${categoryLabel}」練習`);
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-extrabold text-foreground">帳戶管理</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋帳戶編號或用戶名稱..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Account List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              找不到相關帳戶
            </div>
          )}

          {filtered.map((account) => {
            const isExpanded = expandedId === account.userId;
            return (
              <div key={account.userId} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Account Summary Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : account.userId)}
                  className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-base font-extrabold text-primary">{account.chineseName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-foreground">{account.chineseName}</p>
                        <p className="text-[11px] text-muted-foreground">@{account.username} · {account.userId}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div className="bg-muted/50 rounded-xl p-2 text-center">
                      <Clock className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                      <p className="text-xs font-extrabold text-foreground">{account.usageMinutes}分鐘</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-2 text-center">
                      <Target className="h-3 w-3 text-primary mx-auto mb-0.5" />
                      <p className="text-xs font-extrabold text-foreground">{account.accuracy}%</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-2 text-center">
                      <BookOpen className="h-3 w-3 text-success mx-auto mb-0.5" />
                      <p className="text-xs font-extrabold text-foreground">{account.completions}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-2 text-center">
                      <Star className="h-3 w-3 text-accent mx-auto mb-0.5" />
                      <p className="text-xs font-extrabold text-foreground">{account.totalPoints}</p>
                    </div>
                  </div>
                </button>

                {/* Expanded: Details + Assign */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">電話號碼</span>
                        <p className="font-bold text-foreground">{account.phone}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">帳戶編號</span>
                        <p className="font-bold text-foreground">{account.userId}</p>
                      </div>
                    </div>

                    {/* Assign Exercises */}
                    <div>
                      <p className="text-sm font-bold text-foreground mb-2">指定練習主題</p>
                      <div className="flex flex-wrap gap-2">
                        {phonemeCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleAssign(account.userId, cat.labelZh)}
                            className="px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold hover:border-primary/40 hover:bg-primary/5 transition-colors"
                          >
                            {cat.emoji} {cat.labelZh}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
