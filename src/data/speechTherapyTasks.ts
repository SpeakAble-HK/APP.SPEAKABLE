export interface Challenge {
  word: string;
  audioText: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

export interface TaskDef {
  id: string;
  title: string;
  subtitle: string;
  story: string;
  badge: string;
  targetPhoneme: string;
  challenges: Challenge[];
}

/* ─── Task 1: 聲母精靈歸位戰 (/n/ vs /l/) ─── */
const task1Challenges: Challenge[] = [
  { word: "你", audioText: "你", options: ["你", "里"], correctIndex: 0, hint: "/n/ 聲母 — 舌尖頂住上齦" },
  { word: "里", audioText: "里", options: ["你", "里"], correctIndex: 1, hint: "/l/ 聲母 — 舌尖放鬆" },
  { word: "男", audioText: "男", options: ["男", "藍"], correctIndex: 0, hint: "/n/ 聲母 — 鼻音" },
  { word: "藍", audioText: "藍", options: ["男", "藍"], correctIndex: 1, hint: "/l/ 聲母 — 邊音" },
  { word: "年", audioText: "年", options: ["年", "連"], correctIndex: 0, hint: "/n/ 聲母" },
  { word: "連", audioText: "連", options: ["年", "連"], correctIndex: 1, hint: "/l/ 聲母" },
  { word: "女", audioText: "女", options: ["女", "呂"], correctIndex: 0, hint: "/n/ 聲母" },
  { word: "呂", audioText: "呂", options: ["女", "呂"], correctIndex: 1, hint: "/l/ 聲母" },
  { word: "惱", audioText: "惱", options: ["惱", "老"], correctIndex: 0, hint: "/n/ 聲母" },
  { word: "老", audioText: "老", options: ["惱", "老"], correctIndex: 1, hint: "/l/ 聲母" },
  { word: "暖", audioText: "暖", options: ["暖", "卵"], correctIndex: 0, hint: "/n/ 聲母" },
  { word: "難", audioText: "難", options: ["難", "蘭"], correctIndex: 0, hint: "/n/ 聲母" },
  { word: "蘭", audioText: "蘭", options: ["難", "蘭"], correctIndex: 1, hint: "/l/ 聲母" },
  { word: "檸檬", audioText: "檸檬", options: ["檸檬", "尼龍"], correctIndex: 0, hint: "檸 → /n/ 聲母" },
  { word: "懶惰", audioText: "懶惰", options: ["懶惰", "男度"], correctIndex: 0, hint: "懶 → /l/ 聲母" },
  { word: "牛奶", audioText: "牛奶", options: ["牛奶", "流奶"], correctIndex: 0, hint: "牛 → /n/" },
];

/* ─── Task 2: 韻尾寶寶回家路 (/ng/ vs /n/) ─── */
const task2Challenges: Challenge[] = [
  { word: "聽", audioText: "聽", options: ["聽", "天"], correctIndex: 0, hint: "-ng 韻尾" },
  { word: "天", audioText: "天", options: ["聽", "天"], correctIndex: 1, hint: "-n 韻尾" },
  { word: "行", audioText: "行", options: ["行", "寒"], correctIndex: 0, hint: "-ng 韻尾" },
  { word: "寒", audioText: "寒", options: ["行", "寒"], correctIndex: 1, hint: "-n 韻尾" },
  { word: "冰", audioText: "冰", options: ["冰", "邊"], correctIndex: 0, hint: "-ng 韻尾" },
  { word: "邊", audioText: "邊", options: ["冰", "邊"], correctIndex: 1, hint: "-n 韻尾" },
  { word: "星", audioText: "星", options: ["星", "先"], correctIndex: 0, hint: "-ng 韻尾" },
  { word: "先", audioText: "先", options: ["星", "先"], correctIndex: 1, hint: "-n 韻尾" },
  { word: "鏡", audioText: "鏡", options: ["鏡", "劍"], correctIndex: 0, hint: "-ng 韻尾" },
  { word: "劍", audioText: "劍", options: ["鏡", "劍"], correctIndex: 1, hint: "-n 韻尾" },
  { word: "等", audioText: "等", options: ["等", "旦"], correctIndex: 0, hint: "-ng 韻尾" },
  { word: "能", audioText: "能", options: ["能", "男"], correctIndex: 0, hint: "-ng 韻尾" },
  { word: "男", audioText: "男", options: ["能", "男"], correctIndex: 1, hint: "-n 韻尾" },
  { word: "唱歌", audioText: "唱歌", options: ["唱歌", "三餐"], correctIndex: 0, hint: "唱 → -ng 韻尾" },
  { word: "公園", audioText: "公園", options: ["公園", "公煙"], correctIndex: 0, hint: "園 → -n 韻尾" },
  { word: "朋友", audioText: "朋友", options: ["朋友", "貧友"], correctIndex: 0, hint: "朋 → -ng 韻尾" },
];

/* ─── Task 3: 圓唇音的秘密 (/gw/ vs /kw/) ─── */
const task3Challenges: Challenge[] = [
  { word: "廣東", audioText: "廣東", options: ["廣東", "港東"], correctIndex: 0, hint: "/gw/ 圓唇 — 嘟起嘴巴" },
  { word: "港", audioText: "港", options: ["港", "廣"], correctIndex: 0, hint: "/g/ 不圓唇" },
  { word: "瓜子", audioText: "瓜子", options: ["瓜子", "加子"], correctIndex: 0, hint: "/gw/ 圓唇" },
  { word: "誇張", audioText: "誇張", options: ["誇張", "卡張"], correctIndex: 0, hint: "/kw/ 圓唇" },
  { word: "國", audioText: "國", options: ["國", "各"], correctIndex: 0, hint: "/gw/ 圓唇" },
  { word: "各", audioText: "各", options: ["國", "各"], correctIndex: 1, hint: "/g/ 不圓唇" },
  { word: "光", audioText: "光", options: ["光", "江"], correctIndex: 0, hint: "/gw/ 圓唇" },
  { word: "江", audioText: "江", options: ["光", "江"], correctIndex: 1, hint: "/g/ 不圓唇" },
  { word: "裙", audioText: "裙", options: ["裙", "勤"], correctIndex: 0, hint: "/kw/ 圓唇" },
  { word: "筷子", audioText: "筷子", options: ["筷子", "蓋子"], correctIndex: 0, hint: "/kw/ 圓唇" },
  { word: "關", audioText: "關", options: ["關", "間"], correctIndex: 0, hint: "/gw/ 圓唇" },
  { word: "間", audioText: "間", options: ["關", "間"], correctIndex: 1, hint: "/g/ 不圓唇" },
  { word: "擴", audioText: "擴", options: ["擴", "各"], correctIndex: 0, hint: "/kw/ 圓唇" },
  { word: "果", audioText: "果", options: ["果", "個"], correctIndex: 0, hint: "/gw/ 圓唇 — 嘟嘴" },
  { word: "個", audioText: "個", options: ["果", "個"], correctIndex: 1, hint: "/g/ 不圓唇" },
];

/* ─── Task 4: 聲調魔法師的考驗 (6 tones) ─── */
const task4Challenges: Challenge[] = [
  { word: "詩", audioText: "詩", options: ["詩 (1聲)", "史 (2聲)", "市 (5聲)", "試 (3聲)"], correctIndex: 0, hint: "第一聲 高平 ↓" },
  { word: "史", audioText: "史", options: ["詩 (1聲)", "史 (2聲)", "市 (5聲)", "試 (3聲)"], correctIndex: 1, hint: "第二聲 高升 ↑" },
  { word: "試", audioText: "試", options: ["詩 (1聲)", "史 (2聲)", "時 (4聲)", "試 (3聲)"], correctIndex: 3, hint: "第三聲 中平 →" },
  { word: "時", audioText: "時", options: ["詩 (1聲)", "史 (2聲)", "時 (4聲)", "事 (6聲)"], correctIndex: 2, hint: "第四聲 低平 _ (陽平)" },
  { word: "市", audioText: "市", options: ["詩 (1聲)", "市 (5聲)", "試 (3聲)", "事 (6聲)"], correctIndex: 1, hint: "第五聲 低升 (陽上)" },
  { word: "事", audioText: "事", options: ["時 (4聲)", "市 (5聲)", "事 (6聲)", "試 (3聲)"], correctIndex: 2, hint: "第六聲 低平 (陽去)" },
  { word: "夫", audioText: "夫", options: ["夫 (1聲)", "苦 (2聲)", "庫 (3聲)", "扶 (4聲)"], correctIndex: 0, hint: "第一聲" },
  { word: "苦", audioText: "苦", options: ["夫 (1聲)", "苦 (2聲)", "庫 (3聲)", "扶 (4聲)"], correctIndex: 1, hint: "第二聲" },
  { word: "庫", audioText: "庫", options: ["夫 (1聲)", "苦 (2聲)", "庫 (3聲)", "扶 (4聲)"], correctIndex: 2, hint: "第三聲" },
  { word: "扶", audioText: "扶", options: ["苦 (2聲)", "庫 (3聲)", "扶 (4聲)", "負 (6聲)"], correctIndex: 2, hint: "第四聲" },
  { word: "負", audioText: "負", options: ["婦 (5聲)", "扶 (4聲)", "負 (6聲)", "夫 (1聲)"], correctIndex: 2, hint: "第六聲" },
  { word: "分", audioText: "分", options: ["分 (1聲)", "粉 (2聲)", "訓 (3聲)", "焚 (4聲)"], correctIndex: 0, hint: "第一聲" },
  { word: "粉", audioText: "粉", options: ["分 (1聲)", "粉 (2聲)", "訓 (3聲)", "焚 (4聲)"], correctIndex: 1, hint: "第二聲" },
  { word: "訓", audioText: "訓", options: ["分 (1聲)", "奮 (5聲)", "訓 (3聲)", "焚 (4聲)"], correctIndex: 2, hint: "第三聲" },
  { word: "焚", audioText: "焚", options: ["粉 (2聲)", "奮 (5聲)", "焚 (4聲)", "份 (6聲)"], correctIndex: 2, hint: "第四聲" },
];

export const SPEECH_THERAPY_TASKS: Record<string, TaskDef> = {
  "water-park": {
    id: "water-park",
    title: "聲母精靈歸位戰",
    subtitle: "/n/ 和 /l/ 聲母",
    story: "調皮的聲母精靈 /n/ 和 /l/ 又在玩捉迷藏了！它們常常跑錯地方，把「你」說成「里」，把「藍」說成「男」。你能幫它們回到正確的發音家園嗎？",
    badge: "聲母小幫手",
    targetPhoneme: "/n/ vs /l/",
    challenges: task1Challenges,
  },
  maze: {
    id: "maze",
    title: "韻尾寶寶回家路",
    subtitle: "/ng/ 和 /n/ 韻尾",
    story: "可愛的韻尾寶寶 /ng/ 和 /n/ 迷路了！它們的聲音很相似，常常讓大家分不清「聽」和「天」，「行」和「寒」。快來幫它們找到回家的路吧！",
    badge: "韻尾守護者",
    targetPhoneme: "/ng/ vs /n/",
    challenges: task2Challenges,
  },
  "fruit-ninja": {
    id: "fruit-ninja",
    title: "圓唇音的秘密",
    subtitle: "/gw/ 和 /kw/ 圓唇音",
    story: "圓唇音精靈們藏在嘴巴的深處，它們喜歡把嘴巴嘟起來發音。但有時候它們會偷懶，讓「廣」聽起來像「港」。你能幫助它們找回圓圓的嘴巴嗎？",
    badge: "圓唇音小專家",
    targetPhoneme: "/gw/ vs /kw/",
    challenges: task3Challenges,
  },
  "catch-fly": {
    id: "catch-fly",
    title: "聲調魔法師的考驗",
    subtitle: "粵語六聲",
    story: "聲調魔法師需要你的幫助！每個字都有自己的魔法聲調，你能正確地念出它們，讓魔法生效嗎？記住，聲調變了，意思也會變哦！",
    badge: "聲調魔法師",
    targetPhoneme: "六聲",
    challenges: task4Challenges,
  },
};

export function pickChallenges(taskId: string, count = 8): Challenge[] {
  const task = SPEECH_THERAPY_TASKS[taskId];
  if (!task) return [];
  const shuffled = [...task.challenges].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
