import { Link } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const ComingSoonPage = () => {
  const { language } = useLanguage();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-16">
      <Construction className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-3xl font-bold text-foreground mb-3">
        {isEn ? 'Coming Soon' : isTW ? '即將推出' : '即将推出'}
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {isEn
          ? "We're working hard to bring this feature to you. Stay tuned!"
          : isTW
            ? '我們正在努力開發此功能，敬請期待！'
            : '我们正在努力开发此功能，敬请期待！'}
      </p>
      <Link to="/">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {isEn ? 'Back to Home' : isTW ? '返回首頁' : '返回首页'}
        </Button>
      </Link>
    </div>
  );
};

export default ComingSoonPage;
