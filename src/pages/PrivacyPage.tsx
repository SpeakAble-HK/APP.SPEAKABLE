import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
  const { language } = useLanguage();
  const isEn = language === "en-GB";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{isEn ? "Privacy Policy" : "私隱政策"}</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>{isEn ? "Last updated: March 2026" : "最後更新：2026年3月"}</p>
        <p>{isEn
          ? "SpeakAble HK is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information."
          : "SpeakAble HK 致力於保護您的私隱。本政策說明我們如何收集、使用和保護您的資訊。"}</p>
        <h2 className="text-xl font-semibold text-foreground">{isEn ? "1. Data Collection" : "1. 資料收集"}</h2>
        <p>{isEn
          ? "We collect personal information you provide during registration (name, email, date of birth) and usage data such as pronunciation recordings and practice history."
          : "我們收集您在註冊時提供的個人資訊（姓名、電郵、出生日期）以及使用數據，如發音錄音和練習記錄。"}</p>
        <h2 className="text-xl font-semibold text-foreground">{isEn ? "2. Data Security" : "2. 資料安全"}</h2>
        <p>{isEn
          ? "We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest."
          : "我們採用行業標準的安全措施來保護您的數據。所有數據在傳輸和存儲過程中均加密。"}</p>
        <h2 className="text-xl font-semibold text-foreground">{isEn ? "3. Contact" : "3. 聯絡"}</h2>
        <p>{isEn ? "For privacy concerns, contact us at privacy@speakable.hk." : "如有私隱方面的疑慮，請聯絡 privacy@speakable.hk。"}</p>
      </div>
    </div>
  );
}
