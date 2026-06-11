import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <Home className="h-3.5 w-3.5" />
        返回首頁
      </Link>
      <h1 className="text-3xl font-bold mb-6">條款與條件</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>最後更新：2026年3月</p>
        <p>使用 SpeakAble HK 即表示你同意受此條款與條件約束；如不同意，請停止使用本服務。</p>
        <h2 className="text-xl font-semibold text-foreground">1. 服務使用</h2>
        <p>SpeakAble HK 提供 AI 驅動廣東話發音工具，僅供教育用途。</p>
        <h2 className="text-xl font-semibold text-foreground">2. 用戶帳號</h2>
        <p>你有責任妥善保管帳號憑證，並對帳號下所有活動負責。</p>
        <h2 className="text-xl font-semibold text-foreground">3. 聯絡</h2>
        <p>如對本條款有任何疑問，請聯絡 support@speakable.hk。</p>
      </div>
    </div>
  );
}
