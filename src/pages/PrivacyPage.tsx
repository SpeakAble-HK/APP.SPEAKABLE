import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <Home className="h-3.5 w-3.5" />
        返回首頁
      </Link>
      <h1 className="text-3xl font-bold mb-6">私隱政策</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>最後更新：2026年3月</p>
        <p>SpeakAble HK 致力於保護你的私隱。本政策說明我哋如何收集、使用同保護你的資訊。</p>
        <h2 className="text-xl font-semibold text-foreground">1. 資料收集</h2>
        <p>我哋會收集你註冊時提供嘅個人資訊（姓名、電郵、出生日期），以及使用數據，例如發音錄音同練習記錄。</p>
        <h2 className="text-xl font-semibold text-foreground">2. 資料安全</h2>
        <p>我哋採用業界標準安全措施保護你的數據。所有數據喺傳輸同儲存期間都會加密。</p>
        <h2 className="text-xl font-semibold text-foreground">3. 聯絡</h2>
        <p>如有私隱相關疑問，請聯絡 privacy@speakable.hk。</p>
      </div>
    </div>
  );
}
