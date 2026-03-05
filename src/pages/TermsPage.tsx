import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
  const { language } = useLanguage();
  const isEn = language === "en-GB";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{isEn ? "Terms and Conditions" : "條款與條件"}</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>{isEn ? "Last updated: March 2026" : "最後更新：2026年3月"}</p>
        <p>{isEn
          ? "By accessing and using SpeakAble HK, you agree to be bound by these terms and conditions. If you do not agree, please do not use this service."
          : "使用 SpeakAble HK 即表示您同意受這些條款與條件的約束。如果您不同意，請勿使用此服務。"}</p>
        <h2 className="text-xl font-semibold text-foreground">{isEn ? "1. Use of Service" : "1. 服務使用"}</h2>
        <p>{isEn
          ? "SpeakAble HK provides speech therapy and pronunciation tools for educational purposes. The service is not a substitute for professional medical advice."
          : "SpeakAble HK 提供言語治療和發音工具，僅供教育用途。本服務並非專業醫療建議的替代品。"}</p>
        <h2 className="text-xl font-semibold text-foreground">{isEn ? "2. User Accounts" : "2. 用戶帳號"}</h2>
        <p>{isEn
          ? "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
          : "您有責任維護帳號憑證的機密性，並對您帳號下的所有活動負責。"}</p>
        <h2 className="text-xl font-semibold text-foreground">{isEn ? "3. Contact" : "3. 聯絡"}</h2>
        <p>{isEn ? "For questions about these terms, please contact us at support@speakable.hk." : "如有關於這些條款的問題，請聯絡 support@speakable.hk。"}</p>
      </div>
    </div>
  );
}
