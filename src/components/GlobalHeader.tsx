import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import logo from "@/assets/logo.png";

export function GlobalHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const showBack = !isHomePage;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors mr-1"
              aria-label="返回"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <img src={logo} alt="SpeakAble HK" className="h-7 w-7 object-contain" />
          <span className="text-sm font-extrabold text-foreground tracking-tight">SpeakAble HK</span>
        </div>
      </div>
    </header>
  );
}
