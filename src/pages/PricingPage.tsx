import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, ArrowLeft, Mail, GraduationCap, Stethoscope, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency, type Currency } from "@/hooks/useCurrency";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { language } = useLanguage();
  const { currency, setCurrency, convert } = useCurrency();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const t = (en: string, tw: string, cn: string) =>
    isEn ? en : isTW ? tw : cn;

  const tiers = [
    {
      name: "Free",
      description: t("Get started with basic speech tools", "使用基本語音工具開始", "使用基本语音工具开始"),
      price: 0,
      annualPrice: 0,
      label: t("Free forever", "永久免費", "永久免费"),
      buttonText: t("Get Started", "開始使用", "开始使用"),
      buttonVariant: "outline" as const,
      href: "/auth",
      features: [
        t("5 daily credits (up to 30/month)", "每日 5 次額度（每月上限 30 次）", "每日 5 次额度（每月上限 30 次）"),
        t("Watch ads for extra quotas", "觀看廣告獲取額外額度", "观看广告获取额外额度"),
        t("Limited access to Speech Quest", "有限使用語音冒險", "有限使用语音冒险"),
      ],
      highlighted: false,
    },
    {
      name: "Plus",
      description: t("For dedicated learners who practise daily", "適合每天練習的學習者", "适合每天练习的学习者"),
      price: 15,
      annualPrice: 12,
      label: "",
      buttonText: t("Get Started", "開始使用", "开始使用"),
      buttonVariant: "default" as const,
      href: "/auth",
      features: [
        t("100 tokens per top-up", "每次充值 100 代幣", "每次充值 100 代币"),
        t("Full access to Speech Quest", "完整使用語音冒險", "完整使用语音冒险"),
        t("5 ads per day", "每日 5 個廣告", "每日 5 个广告"),
      ],
      highlighted: true,
    },
    {
      name: "Pro",
      description: t("Unlimited practice, zero distractions", "無限練習，零干擾", "无限练习，零干扰"),
      price: 99,
      annualPrice: 79,
      label: "",
      buttonText: t("Get Started", "開始使用", "开始使用"),
      buttonVariant: "outline" as const,
      href: "/auth",
      features: [
        t("999 tokens", "999 代幣", "999 代币"),
        t("No ads", "無廣告", "无广告"),
        t("24/7 customer support", "全天候客戶支援", "全天候客户支持"),
        t("Unlimited IPA Transcription", "無限 IPA 轉錄", "无限 IPA 转录"),
        t("Diagnosing symptoms", "症狀診斷", "症状诊断"),
        t("Limited parrot appearance", "限定鸚鵡造型", "限定鹦鹉造型"),
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Top bar: Back + Currency */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5 min-h-[48px]">
              <ArrowLeft className="h-4 w-4" />
              {t("Back to Home", "返回主頁", "返回主页")}
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

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("Pricing", "定價方案", "定价方案")}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t(
              "Start for free. Upgrade to unlock the full learning experience.",
              "免費開始。升級以解鎖完整學習體驗。",
              "免费开始。升级以解锁完整学习体验。"
            )}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            {t("Monthly", "月付", "月付")}
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            {t("Annual", "年付", "年付")}
          </span>
          {isAnnual && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs">
              {t("Save 20%", "節省 20%", "节省 20%")}
            </Badge>
          )}
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const displayPrice = isAnnual ? tier.annualPrice : tier.price;
            return (
              <Card
                key={tier.name}
                className={`flex flex-col relative ${
                  tier.highlighted
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {tier.highlighted && isAnnual && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-bold shadow-md">
                      {t("Save 20%", "節省 20%", "节省 20%")}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <h2 className="text-xl font-bold text-foreground">{tier.name}</h2>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-5">
                  <div>
                    <span className="text-4xl font-extrabold text-foreground">
                      {convert(displayPrice)}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      / {t("month", "月", "月")}
                    </span>
                    {isAnnual && tier.price > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 line-through">
                        {convert(tier.price)} / {t("month", "月", "月")}
                      </p>
                    )}
                  </div>
                  {tier.label && (
                    <p className="text-xs font-medium text-muted-foreground">{tier.label}</p>
                  )}
                  <ul className="space-y-2.5">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to={tier.href} className="w-full">
                    <Button
                      variant={tier.buttonVariant}
                      className={`w-full min-h-[48px] font-semibold ${
                        tier.highlighted ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                      }`}
                    >
                      {tier.buttonText}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground text-center">
            {t("Compare Plans", "方案比較", "方案比较")}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground min-w-[140px]"></th>
                  <th className="p-4 font-bold text-foreground text-center">Free</th>
                  <th className="p-4 font-bold text-center bg-primary/10 text-primary">Plus</th>
                  <th className="p-4 font-bold text-foreground text-center">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: t("Price / month", "每月價格", "每月价格"),
                    free: convert(0),
                    plus: convert(isAnnual ? 12 : 15),
                    pro: convert(isAnnual ? 79 : 99),
                  },
                  {
                    label: t("Tokens", "代幣", "代币"),
                    free: t("5/day", "5/天", "5/天"),
                    plus: "100",
                    pro: "999",
                  },
                  {
                    label: t("Speech Quest", "語音冒險", "语音冒险"),
                    free: "limited",
                    plus: true,
                    pro: true,
                  },
                  {
                    label: t("Ad-free", "無廣告", "无广告"),
                    free: false,
                    plus: false,
                    pro: true,
                  },
                  {
                    label: t("IPA Transcription", "IPA 轉錄", "IPA 转录"),
                    free: "limited",
                    plus: "limited",
                    pro: true,
                  },
                  {
                    label: t("Diagnosing Symptoms", "症狀診斷", "症状诊断"),
                    free: false,
                    plus: false,
                    pro: true,
                  },
                  {
                    label: t("Customer Support", "客戶支援", "客户支持"),
                    free: false,
                    plus: false,
                    pro: t("24/7", "全天候", "全天候"),
                  },
                  {
                    label: t("Bonus", "額外獎勵", "额外奖励"),
                    free: "—",
                    plus: t("5 ads/day", "5 廣告/天", "5 广告/天"),
                    pro: t("Limited parrot", "限定鸚鵡", "限定鹦鹉"),
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-muted-foreground">{row.label}</td>
                    {[row.free, row.plus, row.pro].map((val, j) => (
                      <td
                        key={j}
                        className={`p-4 text-center font-semibold ${
                          j === 1 ? "bg-primary/5" : ""
                        }`}
                      >
                        {val === true ? (
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        ) : val === false ? (
                          <X className="h-5 w-5 text-destructive mx-auto" />
                        ) : (
                          <span className="text-foreground">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student / Professional discount */}
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex gap-2">
                <div className="p-2.5 rounded-full bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="p-2.5 rounded-full bg-primary/10">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-foreground">
                  {t(
                    "Students & Professionals Discount",
                    "學生與專業人士折扣",
                    "学生与专业人士折扣"
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Students with valid IDs and certified educators, therapists, or doctors can apply for special pricing.",
                    "持有效學生證的學生及認證教育工作者、治療師或醫生可申請特別定價。",
                    "持有效学生证的学生及认证教育工作者、治疗师或医生可申请特别定价。"
                  )}
                </p>
              </div>
              <a href="mailto:contact@speakablehk.com?subject=Discount%20Application">
                <Button variant="outline" className="min-h-[48px] border-primary text-primary hover:bg-primary/10 font-semibold gap-2">
                  <Mail className="h-4 w-4" />
                  {t("Apply for Discount", "申請折扣", "申请折扣")}
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Institution note */}
        <div className="text-center space-y-3 pb-8">
          <p className="text-sm text-muted-foreground">
            {t(
              "Are you an institution or school? We offer flexible custom plans.",
              "您是機構或學校嗎？我們提供靈活的客製方案。",
              "您是机构或学校吗？我们提供灵活的定制方案。"
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:contact@speakablehk.com" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Mail className="h-4 w-4" />
              {t("Contact us via email", "透過電子郵件聯繫我們", "通过电子邮件联系我们")}
            </a>
            <Link to="/pricing/institutions">
              <Button variant="default" className="min-h-[48px] font-semibold gap-2">
                <ChevronDown className="h-4 w-4" />
                {t("View Institution Plans", "查看機構方案", "查看机构方案")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
