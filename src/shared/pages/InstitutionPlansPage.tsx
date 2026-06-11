import { Link } from "react-router-dom";
import { ArrowLeft, Check, Building2, GraduationCap, Globe } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { useCurrency, type Currency } from "@/shared/hooks/useCurrency";

// Base prices in USD
const BASE_PRICES_USD = {
  basic: 450,
  professional: 785,
  enterprise: 1600,
};

const InstitutionPlansPage = () => {
  const { language } = useLanguage();
  const { currency, setCurrency, convert } = useCurrency();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const t = (en: string, tw: string, cn: string) =>
    isEn ? en : isTW ? tw : cn;

  const plans = [
    {
      name: t("Basic Plan", "基本方案", "基本方案"),
      priceUSD: BASE_PRICES_USD.basic,
      target: t(
        "Small centres / NGOs / Schools with fewer than 300 students",
        "小型中心 / 非政府組織 / 學生少於 300 人的學校",
        "小型中心 / 非政府组织 / 学生少于 300 人的学校"
      ),
      icon: GraduationCap,
      features: [
        t("Pronunciation error detection", "發音錯誤檢測", "发音错误检测"),
        t("30 monitor accounts", "30 個監控帳戶", "30 个监控账户"),
        t("Online support", "線上支援", "在线支持"),
      ],
    },
    {
      name: t("Professional Plan", "專業方案", "专业方案"),
      priceUSD: BASE_PRICES_USD.professional,
      target: t(
        "Mid-size centres / NGOs / Schools with 300–1,000 users",
        "中型中心 / 非政府組織 / 300–1,000 用戶的學校",
        "中型中心 / 非政府组织 / 300–1,000 用户的学校"
      ),
      icon: Building2,
      highlighted: true,
      features: [
        t("Full AI suite", "完整 AI 套件", "完整 AI 套件"),
        t("Unlimited accounts", "無限帳戶", "无限账户"),
        t("LMS integration", "LMS 整合", "LMS 集成"),
        t("2 training sessions/year", "每年 2 次培訓", "每年 2 次培训"),
      ],
    },
    {
      name: t("Enterprise Plan", "企業方案", "企业方案"),
      priceUSD: BASE_PRICES_USD.enterprise,
      target: t(
        "Large networks with over 1,000 users",
        "超過 1,000 用戶的大型網絡",
        "超过 1,000 用户的大型网络"
      ),
      icon: Globe,
      features: [
        t("Custom branding", "客製品牌", "定制品牌"),
        t("Advanced analytics", "進階分析", "高级分析"),
        t("Priority support", "優先支援", "优先支持"),
        t("API integration", "API 整合", "API 集成"),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/pricing">
            <Button variant="ghost" size="sm" className="gap-1.5 min-h-[48px]">
              <ArrowLeft className="h-4 w-4" />
              {t("Back to Pricing", "返回定價", "返回定价")}
            </Button>
          </Link>
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger className="w-[110px] min-h-[48px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="HKD">HKD (HK$)</SelectItem>
              <SelectItem value="RMB">RMB (¥)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("Institution & Enterprise Plans", "機構和企業方案", "机构和企业方案")}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t(
              "Flexible plans designed for schools, NGOs, and organisations of all sizes.",
              "為各類規模的學校、非政府組織和機構設計的靈活方案。",
              "为各类规模的学校、非政府组织和机构设计的灵活方案。"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`flex flex-col relative ${
                  plan.highlighted
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-bold shadow-md">
                      {t("Most Popular", "最受歡迎", "最受欢迎")}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.target}</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-5">
                  <div>
                    <span className="text-4xl font-extrabold text-foreground">
                      {convert(plan.priceUSD)}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      / {t("year", "年", "年")}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <a href="mailto:contact@speakablehk.com" className="w-full">
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className={`w-full min-h-[48px] font-semibold ${
                        plan.highlighted ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                      }`}
                    >
                      {t("Contact Sales", "聯繫銷售", "联系销售")}
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center pb-8">
          <p className="text-sm text-muted-foreground">
            {t(
              "All institution plans include a free onboarding consultation. Contact us for custom requirements.",
              "所有機構方案包含免費入門諮詢。如有客製需求，請聯繫我們。",
              "所有机构方案包含免费入门咨询。如有定制需求，请联系我们。"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstitutionPlansPage;
