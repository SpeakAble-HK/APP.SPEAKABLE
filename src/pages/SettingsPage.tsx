import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mic, Bell, Volume2, ChevronRight } from "lucide-react";
import pipiRoom from "@/assets/pipi-room.png";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("探險家");
  const [soundOn, setSoundOn] = useState(true);
  const [reminderOn, setReminderOn] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("explorer_nickname");
    if (stored) setNickname(stored);
  }, []);

  return (
    <div className="min-h-full bg-[hsl(200,30%,96%)]">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-[hsl(200,15%,20%)] flex items-center gap-2">
            ⚙️ 設定
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[hsl(200,20%,90%)] flex items-center gap-4">
          <img src={pipiRoom} alt="皮皮" className="h-16 w-16 object-contain rounded-xl bg-[hsl(200,30%,95%)]" loading="lazy" width={1024} height={1024} />
          <div className="flex-1">
            <p className="text-base font-extrabold text-[hsl(200,15%,20%)]">{nickname}</p>
            <p className="text-xs text-[hsl(200,10%,50%)]">語音探險家</p>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-[hsl(152,50%,92%)] flex items-center justify-center"
            onClick={() => {
              const name = prompt("輸入新暱稱：", nickname);
              if (name) {
                setNickname(name);
                sessionStorage.setItem("explorer_nickname", name);
              }
            }}
          >
            ✏️
          </button>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-[hsl(200,20%,90%)] overflow-hidden divide-y divide-[hsl(200,20%,92%)]">
          {/* Edit Profile */}
          <button
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[hsl(200,30%,97%)] transition-colors text-left"
            onClick={() => {
              const name = prompt("輸入新暱稱：", nickname);
              if (name) {
                setNickname(name);
                sessionStorage.setItem("explorer_nickname", name);
              }
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-[hsl(210,80%,92%)] flex items-center justify-center">
              <User className="h-4.5 w-4.5 text-[hsl(210,70%,50%)]" />
            </div>
            <span className="flex-1 text-sm font-bold text-[hsl(200,15%,25%)]">編輯個人資料</span>
            <ChevronRight className="h-4 w-4 text-[hsl(200,10%,65%)]" />
          </button>

          {/* Re-record */}
          <button
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[hsl(200,30%,97%)] transition-colors text-left"
            onClick={() => navigate("/explorer/onboarding")}
          >
            <div className="w-9 h-9 rounded-xl bg-[hsl(15,80%,92%)] flex items-center justify-center">
              <Mic className="h-4.5 w-4.5 text-[hsl(15,70%,50%)]" />
            </div>
            <span className="flex-1 text-sm font-bold text-[hsl(200,15%,25%)]">重新錄音</span>
            <ChevronRight className="h-4 w-4 text-[hsl(200,10%,65%)]" />
          </button>

          {/* Reminder */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-[hsl(45,80%,90%)] flex items-center justify-center">
              <Bell className="h-4.5 w-4.5 text-[hsl(45,70%,45%)]" />
            </div>
            <span className="flex-1 text-sm font-bold text-[hsl(200,15%,25%)]">提醒設定</span>
            <button
              onClick={() => setReminderOn(!reminderOn)}
              className={`w-12 h-7 rounded-full transition-colors ${
                reminderOn ? "bg-[hsl(152,60%,45%)]" : "bg-[hsl(200,20%,85%)]"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-1 ${
                reminderOn ? "translate-x-5" : ""
              }`} />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-[hsl(270,60%,92%)] flex items-center justify-center">
              <Volume2 className="h-4.5 w-4.5 text-[hsl(270,50%,55%)]" />
            </div>
            <span className="flex-1 text-sm font-bold text-[hsl(200,15%,25%)]">音效開關</span>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className={`w-12 h-7 rounded-full transition-colors ${
                soundOn ? "bg-[hsl(152,60%,45%)]" : "bg-[hsl(200,20%,85%)]"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-1 ${
                soundOn ? "translate-x-5" : ""
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
