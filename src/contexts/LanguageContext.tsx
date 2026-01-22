import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en-GB" | "zh-TW" | "zh-CN";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  "en-GB": {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.voiceLab": "Voice Lab",
    "nav.practice": "Practice",
    "nav.learning": "Learning & Progress",
    "nav.signIn": "Sign In",
    "nav.signOut": "Sign Out",

    // Dashboard
    "dashboard.hello": "Hello",
    "dashboard.subtitle": "Your clinical-grade AI speech coach is ready.",
    "dashboard.aiInsight": "AI Insight",
    "dashboard.aiInsightText": "Your \"Golden Self\" model detects a 12% improvement in your /th/ vs /f/ differentiation. Keep using the biofeedback!",
    "dashboard.dailyGoal": "Daily Goal",
    "dashboard.min": "min",
    "dashboard.fluencyScore": "Fluency Score",
    "dashboard.thisWeek": "this week",
    "dashboard.streak": "Streak",
    "dashboard.days": "days",
    "dashboard.best": "Best",
    "dashboard.startTraining": "Start Training",
    "dashboard.voiceLabTitle": "Voice Lab",
    "dashboard.voiceLabDesc": "Calibrate your \"Golden Self\" AI model to fix timbre mismatch.",
    "dashboard.startNow": "Start now",
    "dashboard.learningProgress": "Learning & Progress",
    "dashboard.learningProgressDesc": "Learn IPA sounds and test your pronunciation progress.",
    "dashboard.viewLearning": "Start learning",

    // Guest Banner
    "guest.banner": "You're using SpeakRight as a guest.",
    "guest.signUp": "Sign up",
    "guest.saveProgress": "to save your progress!",
    "guest.signInToSave": "Sign in to save your language preference",

    // Learning Page
    "learning.title": "Learning & Progress",
    "learning.subtitle": "Master the International Phonetic Alphabet and track your pronunciation progress.",
    "learning.libraryTitle": "International Phonetic Alphabet (IPA) Library",
    "learning.libraryDesc": "Learn and explore all English phonemes with detailed articulatory descriptions and example words.",
    "learning.startLearning": "Start learning",
    "learning.progressTitle": "Progress Analytics",
    "learning.progressDesc": "Test your pronunciation and see how well you've mastered each IPA sound with visual feedback.",
    "learning.testProgress": "Test your progress",
    "learning.tipTitle": "Learning Tip",
    "learning.tipText": "Start by learning the IPA sounds first, then test your progress to see which sounds you've mastered!",

    // IPA Library
    "ipa.title": "International Phonetic Alphabet (IPA) Library",
    "ipa.subtitle": "A comprehensive reference of standard English sounds and their articulatory features.",
    "ipa.plosives": "Plosives (Stops)",
    "ipa.fricatives": "Fricatives",
    "ipa.vowels": "Vowels (Monophthongs)",

    // Phoneme descriptions
    "phoneme.voicelessBilabial": "voiceless bilabial",
    "phoneme.voicedBilabial": "voiced bilabial",
    "phoneme.voicelessAlveolar": "voiceless alveolar",
    "phoneme.voicedAlveolar": "voiced alveolar",
    "phoneme.voicelessVelar": "voiceless velar",
    "phoneme.voicedVelar": "voiced velar",
    "phoneme.voicelessLabiodental": "voiceless labiodental",
    "phoneme.voicedLabiodental": "voiced labiodental",
    "phoneme.voicelessDental": "voiceless dental",
    "phoneme.voicedDental": "voiced dental",
    "phoneme.voicelessPostalv": "voiceless post-alv",
    "phoneme.voicedPostalv": "voiced post-alv",

    // Toast messages
    "toast.languageUpdated": "Language preference updated",
    "toast.languageError": "Failed to update language preference",
    "toast.signOutSuccess": "Signed out successfully",
    "toast.signOutError": "Failed to sign out",
  },
  "zh-TW": {
    // Navigation
    "nav.dashboard": "儀表板",
    "nav.voiceLab": "語音實驗室",
    "nav.practice": "練習",
    "nav.learning": "學習與進度",
    "nav.signIn": "登入",
    "nav.signOut": "登出",

    // Dashboard
    "dashboard.hello": "你好",
    "dashboard.subtitle": "您的臨床級AI語音教練已準備就緒。",
    "dashboard.aiInsight": "AI 洞察",
    "dashboard.aiInsightText": "您的「黃金自我」模型檢測到您的 /th/ 與 /f/ 區分度提高了 12%。繼續使用生物反饋！",
    "dashboard.dailyGoal": "每日目標",
    "dashboard.min": "分鐘",
    "dashboard.fluencyScore": "流利度評分",
    "dashboard.thisWeek": "本週",
    "dashboard.streak": "連續天數",
    "dashboard.days": "天",
    "dashboard.best": "最佳",
    "dashboard.startTraining": "開始訓練",
    "dashboard.voiceLabTitle": "語音實驗室",
    "dashboard.voiceLabDesc": "校準您的「黃金自我」AI模型以修復音色不匹配。",
    "dashboard.startNow": "立即開始",
    "dashboard.learningProgress": "學習與進度",
    "dashboard.learningProgressDesc": "學習國際音標並測試您的發音進度。",
    "dashboard.viewLearning": "開始學習",

    // Guest Banner
    "guest.banner": "您正在以訪客身份使用 SpeakRight。",
    "guest.signUp": "註冊",
    "guest.saveProgress": "以保存您的進度！",
    "guest.signInToSave": "登入以保存您的語言偏好",

    // Learning Page
    "learning.title": "學習與進度",
    "learning.subtitle": "掌握國際音標並追蹤您的發音進度。",
    "learning.libraryTitle": "國際音標（IPA）庫",
    "learning.libraryDesc": "學習和探索所有英語音素，包含詳細的發音描述和示例詞。",
    "learning.startLearning": "開始學習",
    "learning.progressTitle": "進度分析",
    "learning.progressDesc": "測試您的發音，通過視覺反饋查看您對每個音標的掌握程度。",
    "learning.testProgress": "測試進度",
    "learning.tipTitle": "學習提示",
    "learning.tipText": "先學習國際音標，然後測試您的進度，看看您已經掌握了哪些發音！",

    // IPA Library
    "ipa.title": "國際音標（IPA）庫",
    "ipa.subtitle": "標準英語發音及其發音特徵的完整參考。",
    "ipa.plosives": "塞音（爆破音）",
    "ipa.fricatives": "擦音",
    "ipa.vowels": "元音（單元音）",

    // Phoneme descriptions
    "phoneme.voicelessBilabial": "清雙唇音",
    "phoneme.voicedBilabial": "濁雙唇音",
    "phoneme.voicelessAlveolar": "清齒齦音",
    "phoneme.voicedAlveolar": "濁齒齦音",
    "phoneme.voicelessVelar": "清軟顎音",
    "phoneme.voicedVelar": "濁軟顎音",
    "phoneme.voicelessLabiodental": "清唇齒音",
    "phoneme.voicedLabiodental": "濁唇齒音",
    "phoneme.voicelessDental": "清齒音",
    "phoneme.voicedDental": "濁齒音",
    "phoneme.voicelessPostalv": "清齦後音",
    "phoneme.voicedPostalv": "濁齦後音",

    // Toast messages
    "toast.languageUpdated": "語言偏好已更新",
    "toast.languageError": "更新語言偏好失敗",
    "toast.signOutSuccess": "已成功登出",
    "toast.signOutError": "登出失敗",
  },
  "zh-CN": {
    // Navigation
    "nav.dashboard": "仪表板",
    "nav.voiceLab": "语音实验室",
    "nav.practice": "练习",
    "nav.learning": "学习与进度",
    "nav.signIn": "登录",
    "nav.signOut": "退出",

    // Dashboard
    "dashboard.hello": "你好",
    "dashboard.subtitle": "您的临床级AI语音教练已准备就绪。",
    "dashboard.aiInsight": "AI 洞察",
    "dashboard.aiInsightText": "您的「黄金自我」模型检测到您的 /th/ 与 /f/ 区分度提高了 12%。继续使用生物反馈！",
    "dashboard.dailyGoal": "每日目标",
    "dashboard.min": "分钟",
    "dashboard.fluencyScore": "流利度评分",
    "dashboard.thisWeek": "本周",
    "dashboard.streak": "连续天数",
    "dashboard.days": "天",
    "dashboard.best": "最佳",
    "dashboard.startTraining": "开始训练",
    "dashboard.voiceLabTitle": "语音实验室",
    "dashboard.voiceLabDesc": "校准您的「黄金自我」AI模型以修复音色不匹配。",
    "dashboard.startNow": "立即开始",
    "dashboard.learningProgress": "学习与进度",
    "dashboard.learningProgressDesc": "学习国际音标并测试您的发音进度。",
    "dashboard.viewLearning": "开始学习",

    // Guest Banner
    "guest.banner": "您正在以访客身份使用 SpeakRight。",
    "guest.signUp": "注册",
    "guest.saveProgress": "以保存您的进度！",
    "guest.signInToSave": "登录以保存您的语言偏好",

    // Learning Page
    "learning.title": "学习与进度",
    "learning.subtitle": "掌握国际音标并追踪您的发音进度。",
    "learning.libraryTitle": "国际音标（IPA）库",
    "learning.libraryDesc": "学习和探索所有英语音素，包含详细的发音描述和示例词。",
    "learning.startLearning": "开始学习",
    "learning.progressTitle": "进度分析",
    "learning.progressDesc": "测试您的发音，通过视觉反馈查看您对每个音标的掌握程度。",
    "learning.testProgress": "测试进度",
    "learning.tipTitle": "学习提示",
    "learning.tipText": "先学习国际音标，然后测试您的进度，看看您已经掌握了哪些发音！",

    // IPA Library
    "ipa.title": "国际音标（IPA）库",
    "ipa.subtitle": "标准英语发音及其发音特征的完整参考。",
    "ipa.plosives": "塞音（爆破音）",
    "ipa.fricatives": "擦音",
    "ipa.vowels": "元音（单元音）",

    // Phoneme descriptions
    "phoneme.voicelessBilabial": "清双唇音",
    "phoneme.voicedBilabial": "浊双唇音",
    "phoneme.voicelessAlveolar": "清齿龈音",
    "phoneme.voicedAlveolar": "浊齿龈音",
    "phoneme.voicelessVelar": "清软腭音",
    "phoneme.voicedVelar": "浊软腭音",
    "phoneme.voicelessLabiodental": "清唇齿音",
    "phoneme.voicedLabiodental": "浊唇齿音",
    "phoneme.voicelessDental": "清齿音",
    "phoneme.voicedDental": "浊齿音",
    "phoneme.voicelessPostalv": "清龈后音",
    "phoneme.voicedPostalv": "浊龈后音",

    // Toast messages
    "toast.languageUpdated": "语言偏好已更新",
    "toast.languageError": "更新语言偏好失败",
    "toast.signOutSuccess": "已成功退出",
    "toast.signOutError": "退出失败",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage = "en-GB" }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage first (for guests)
    const saved = localStorage.getItem("preferred_language") as Language;
    return saved || initialLanguage;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || translations["en-GB"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
