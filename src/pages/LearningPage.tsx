import { Link } from "react-router-dom";
import { BookOpen, BarChart3, Sparkles, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const LearningPage = () => {
  const { t } = useLanguage();

  return (
    <div className="hero-gradient min-h-full">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("nav.backToHome")}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("learning.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("learning.subtitle")}
          </p>
        </div>

        {/* Two Main Sections */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {/* IPA Library Card */}
          <Link to="/learning/library" className="group">
            <div className="bg-card border border-border rounded-2xl p-8 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 hover:border-primary/30 h-full flex flex-col">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("learning.libraryTitle")}
              </h2>
              
              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("learning.libraryDesc")}
              </p>
              
              <div className="inline-flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all text-sm">
                {t("learning.startLearning")}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>

          {/* Progress Analytics Card */}
          <Link to="/learning/progress" className="group">
            <div className="bg-card border border-border rounded-2xl p-8 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 hover:border-accent/30 h-full flex flex-col">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6 group-hover:bg-accent/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
              
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("learning.progressTitle")}
              </h2>
              
              <p className="text-muted-foreground text-sm mb-6 flex-grow">
                {t("learning.progressDesc")}
              </p>
              
              <div className="inline-flex items-center text-accent font-medium group-hover:gap-3 gap-2 transition-all text-sm">
                {t("learning.testProgress")}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mt-8 max-w-4xl">
          <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t("learning.tipTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("learning.tipText")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
