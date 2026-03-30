import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en-GB" | "zh-TW" | "zh-CN";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  t3: (en: string, tw: string, cn: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  "en-GB": {
    // Navigation
    "nav.dashboard": "Home",
    "nav.voiceLab": "Echo Speech",
    "nav.practice": "Practice",
    "nav.learning": "Learning & Progress",
    "nav.results": "Results",
    "nav.signIn": "Sign In",
    "nav.signOut": "Sign Out",
    "nav.backToHome": "Back to Home",

    // Dashboard
    "dashboard.hello": "Hello",
    "dashboard.subtitle": "Your AI speech coach powered by the Golden Theory.",
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
    "dashboard.voiceLabTitle": "Echo Speech",
    "dashboard.voiceLabDesc": "Calibrate your \"Golden Self\" AI model using the Golden Theory.",
    "dashboard.startNow": "Start now",
    "dashboard.learningProgress": "Learning & Progress",
    "dashboard.learningProgressDesc": "Learn IPA sounds and test your pronunciation progress.",
    "dashboard.viewLearning": "Start learning",

    // Guest Banner
    "guest.banner": "You're using SpeakAble HK as a guest.",
    "guest.signUp": "Sign up",
    "guest.saveProgress": "to save your records!",
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

    // Voice Lab (now Echo Speech)
    "voiceLab.title": "Echo Speech",
    "voiceLab.subtitle": "Practice your pronunciation with real-time feedback using the Golden Theory.",
    "voiceLab.step1Title": "Enter Your Target Sentence",
    "voiceLab.step1Desc": "Type the sentence or word you want to practice pronouncing.",
    "voiceLab.step2Title": "Record or Upload Your Voice",
    "voiceLab.step2Desc": "Record yourself saying the sentence above, or upload an existing audio file.",
    "voiceLab.record": "Record",
    "voiceLab.upload": "Upload",
    "voiceLab.startRecording": "Start Recording",
    "voiceLab.stopRecording": "Stop Recording",
    "voiceLab.dragDrop": "Drag and drop an audio file, or click to browse",
    "voiceLab.chooseFile": "Choose File",
    "voiceLab.supportedFormats": "Supported: MP3, WAV, WebM, OGG, M4A (max 10MB)",
    "voiceLab.recordingReady": "Recording ready",
    "voiceLab.step3Title": "Analyze Your Pronunciation",
    "voiceLab.step3Desc": "Click below to process your recording and see detailed feedback on your pronunciation.",
    "voiceLab.processing": "Processing...",
    "voiceLab.processGenerate": "Process & Generate",

    // Results Page
    "results.title": "Pronunciation Results",
    "results.noResultsTitle": "No Results Yet",
    "results.noResultsAuth": "You haven't analyzed any pronunciations yet. Use Echo Speech to get started!",
    "results.noResultsGuest": "Sign in to save and view your pronunciation history.",
    "results.goToVoiceLab": "Go to Echo Speech",
    "results.history": "History",
    "results.signInToSave": "Sign in to save your results",
    "results.loading": "Loading...",
    "results.noSavedResults": "No saved results",
    "results.newAnalysis": "New Analysis",
    "results.saveToHistory": "Save to History",
    "results.overallAccuracy": "Overall Accuracy",
    "results.vowels": "Vowels",
    "results.consonants": "Consonants",
    "results.tones": "Tones",
    "results.yourRecording": "Your Recording",
    "results.playYourRecording": "Play Your Recording",
    "results.correctPronunciation": "Correct Pronunciation",
    "results.playCorrectVersion": "Play Correct Version",
    "results.detailedBreakdown": "Detailed Breakdown",
    "results.character": "Character",
    "results.vowel": "Vowel",
    "results.consonant": "Consonant",
    "results.tone": "Tone",
    "results.status": "Status",
    "results.expected": "Expected",
    "results.yours": "Yours",
    "results.toneLegend": "Tone Legend",
    "results.backToDashboard": "Back to Home",

    // Toast messages
    "toast.languageUpdated": "Language preference updated",
    "toast.languageError": "Failed to update language preference",
    "toast.signOutSuccess": "Signed out successfully",
    "toast.signOutError": "Failed to sign out",
  },
  "zh-TW": {
    // Navigation
    "nav.dashboard": "首頁",
    "nav.voiceLab": "迴聲語音",
    "nav.practice": "練習",
    "nav.learning": "學習與進度",
    "nav.results": "分析結果",
    "nav.signIn": "登入",
    "nav.signOut": "登出",
    "nav.backToHome": "返回首頁",

    // Dashboard
    "dashboard.hello": "你好",
    "dashboard.subtitle": "基於黃金理論的AI語音教練已準備就緒。",
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
    "dashboard.voiceLabTitle": "迴聲語音",
    "dashboard.voiceLabDesc": "使用黃金理論校準您的AI模型。",
    "dashboard.startNow": "立即開始",
    "dashboard.learningProgress": "學習與進度",
    "dashboard.learningProgressDesc": "學習國際音標並測試您的發音進度。",
    "dashboard.viewLearning": "開始學習",

    // Guest Banner
    "guest.banner": "您正在以訪客身份使用 SpeakAble HK。",
    "guest.signUp": "註冊",
    "guest.saveProgress": "以保存您的記錄！",
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

    // Voice Lab (now Echo Speech)
    "voiceLab.title": "迴聲語音",
    "voiceLab.subtitle": "使用黃金理論通過即時反饋來練習您的發音。",
    "voiceLab.step1Title": "輸入目標句子",
    "voiceLab.step1Desc": "輸入您想練習發音的句子或詞語。",
    "voiceLab.step2Title": "錄製或上傳您的語音",
    "voiceLab.step2Desc": "錄製自己說上面的句子，或上傳現有的音頻文件。",
    "voiceLab.record": "錄音",
    "voiceLab.upload": "上傳",
    "voiceLab.startRecording": "開始錄音",
    "voiceLab.stopRecording": "停止錄音",
    "voiceLab.dragDrop": "拖放音頻文件，或點擊瀏覽",
    "voiceLab.chooseFile": "選擇文件",
    "voiceLab.supportedFormats": "支持：MP3、WAV、WebM、OGG、M4A（最大10MB）",
    "voiceLab.recordingReady": "錄音準備就緒",
    "voiceLab.step3Title": "分析您的發音",
    "voiceLab.step3Desc": "點擊下方處理您的錄音並查看詳細的發音反饋。",
    "voiceLab.processing": "處理中...",
    "voiceLab.processGenerate": "處理並生成",

    // Results Page
    "results.title": "發音結果",
    "results.noResultsTitle": "暫無結果",
    "results.noResultsAuth": "您還沒有分析過任何發音。前往迴聲語音開始吧！",
    "results.noResultsGuest": "登入以保存和查看您的發音歷史。",
    "results.goToVoiceLab": "前往迴聲語音",
    "results.history": "歷史記錄",
    "results.signInToSave": "登入以保存您的結果",
    "results.loading": "載入中...",
    "results.noSavedResults": "沒有保存的結果",
    "results.newAnalysis": "新分析",
    "results.saveToHistory": "保存到歷史",
    "results.overallAccuracy": "整體準確率",
    "results.vowels": "母音",
    "results.consonants": "子音",
    "results.tones": "聲調",
    "results.yourRecording": "您的錄音",
    "results.playYourRecording": "播放您的錄音",
    "results.correctPronunciation": "正確發音",
    "results.playCorrectVersion": "播放正確版本",
    "results.detailedBreakdown": "詳細分析",
    "results.character": "字符",
    "results.vowel": "母音",
    "results.consonant": "子音",
    "results.tone": "聲調",
    "results.status": "狀態",
    "results.expected": "預期",
    "results.yours": "您的",
    "results.toneLegend": "聲調圖例",
    "results.backToDashboard": "返回首頁",

    // Toast messages
    "toast.languageUpdated": "語言偏好已更新",
    "toast.languageError": "更新語言偏好失敗",
    "toast.signOutSuccess": "已成功登出",
    "toast.signOutError": "登出失敗",
  },
  "zh-CN": {
    // Navigation
    "nav.dashboard": "首页",
    "nav.voiceLab": "回声语音",
    "nav.practice": "练习",
    "nav.learning": "学习与进度",
    "nav.results": "分析结果",
    "nav.signIn": "登录",
    "nav.signOut": "退出",
    "nav.backToHome": "返回首页",

    // Dashboard
    "dashboard.hello": "你好",
    "dashboard.subtitle": "基于黄金理论的AI语音教练已准备就绪。",
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
    "dashboard.voiceLabTitle": "回声语音",
    "dashboard.voiceLabDesc": "使用黄金理论校准您的AI模型。",
    "dashboard.startNow": "立即开始",
    "dashboard.learningProgress": "学习与进度",
    "dashboard.learningProgressDesc": "学习国际音标并测试您的发音进度。",
    "dashboard.viewLearning": "开始学习",

    // Guest Banner
    "guest.banner": "您正在以访客身份使用 SpeakAble HK。",
    "guest.signUp": "注册",
    "guest.saveProgress": "以保存您的记录！",
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

    // Voice Lab (now Echo Speech)
    "voiceLab.title": "回声语音",
    "voiceLab.subtitle": "使用黄金理论通过即时反馈来练习您的发音。",
    "voiceLab.step1Title": "输入目标句子",
    "voiceLab.step1Desc": "输入您想练习发音的句子或词语。",
    "voiceLab.step2Title": "录制或上传您的语音",
    "voiceLab.step2Desc": "录制自己说上面的句子，或上传现有的音频文件。",
    "voiceLab.record": "录音",
    "voiceLab.upload": "上传",
    "voiceLab.startRecording": "开始录音",
    "voiceLab.stopRecording": "停止录音",
    "voiceLab.dragDrop": "拖放音频文件，或点击浏览",
    "voiceLab.chooseFile": "选择文件",
    "voiceLab.supportedFormats": "支持：MP3、WAV、WebM、OGG、M4A（最大10MB）",
    "voiceLab.recordingReady": "录音准备就绪",
    "voiceLab.step3Title": "分析您的发音",
    "voiceLab.step3Desc": "点击下方处理您的录音并查看详细的发音反馈。",
    "voiceLab.processing": "处理中...",
    "voiceLab.processGenerate": "处理并生成",

    // Results Page
    "results.title": "发音结果",
    "results.noResultsTitle": "暂无结果",
    "results.noResultsAuth": "您还没有分析过任何发音。前往回声语音开始吧！",
    "results.noResultsGuest": "登录以保存和查看您的发音历史。",
    "results.goToVoiceLab": "前往回声语音",
    "results.history": "历史记录",
    "results.signInToSave": "登录以保存您的结果",
    "results.loading": "加载中...",
    "results.noSavedResults": "没有保存的结果",
    "results.newAnalysis": "新分析",
    "results.saveToHistory": "保存到历史",
    "results.overallAccuracy": "整体准确率",
    "results.vowels": "元音",
    "results.consonants": "辅音",
    "results.tones": "声调",
    "results.yourRecording": "您的录音",
    "results.playYourRecording": "播放您的录音",
    "results.correctPronunciation": "正确发音",
    "results.playCorrectVersion": "播放正确版本",
    "results.detailedBreakdown": "详细分析",
    "results.character": "字符",
    "results.vowel": "元音",
    "results.consonant": "辅音",
    "results.tone": "声调",
    "results.status": "状态",
    "results.expected": "预期",
    "results.yours": "您的",
    "results.toneLegend": "声调图例",
    "results.backToDashboard": "返回首页",

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

const VALID_LANGUAGES: Language[] = ["en-GB", "zh-TW", "zh-CN"];

function readStoredLanguage(initialLanguage: Language): Language {
  const pref = localStorage.getItem("preferred_language");
  if (pref && VALID_LANGUAGES.includes(pref as Language)) return pref as Language;
  const app = localStorage.getItem("app_language");
  if (app && VALID_LANGUAGES.includes(app as Language)) return app as Language;
  return initialLanguage;
}

export function LanguageProvider({ children, initialLanguage = "zh-TW" }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() =>
    readStoredLanguage(initialLanguage)
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
    localStorage.setItem("app_language", lang);
  };

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
