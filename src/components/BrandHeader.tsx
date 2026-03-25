import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

interface BrandHeaderProps {
  className?: string;
}

export function BrandHeader({ className = "" }: BrandHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={`fixed top-0 w-full z-50 h-14 bg-white/70 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,180,216,0.05)] flex items-center px-4 sm:px-6 ${className}`}
    >
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity active:scale-95"
        aria-label="返回首頁"
      >
        <img src={logo} alt="" className="h-8 w-8 object-contain" />
        <span className="font-headline font-bold text-primary text-lg tracking-tight">
          SpeakAble HK
        </span>
      </button>
    </header>
  );
}
