// Daily practice topics for Cantonese pronunciation
// Each topic focuses on commonly confused phoneme pairs

export interface PracticeWord {
  character: string;
  jyutping: string;
  meaning: string;
}

export interface PracticeTopic {
  id: string;
  titleEn: string;
  titleZhTW: string;
  titleZhCN: string;
  focusPhonemes: string[];
  descriptionEn: string;
  descriptionZhTW: string;
  descriptionZhCN: string;
  words: PracticeWord[];
}

// Topics rotate daily based on date
export const practiceTopics: PracticeTopic[] = [
  {
    id: "n-l",
    titleEn: "/n/ vs /l/",
    titleZhTW: "/n/ 與 /l/",
    titleZhCN: "/n/ 与 /l/",
    focusPhonemes: ["n", "l"],
    descriptionEn: "Distinguish between nasal /n/ and lateral /l/ sounds",
    descriptionZhTW: "區分鼻音 /n/ 和邊音 /l/",
    descriptionZhCN: "区分鼻音 /n/ 和边音 /l/",
    words: [
      { character: "你", jyutping: "nei5", meaning: "you" },
      { character: "呢", jyutping: "ni1", meaning: "this" },
      { character: "南", jyutping: "naam4", meaning: "south" },
      { character: "男", jyutping: "naam4", meaning: "male" },
      { character: "年", jyutping: "nin4", meaning: "year" },
      { character: "離", jyutping: "lei4", meaning: "leave" },
      { character: "來", jyutping: "loi4", meaning: "come" },
      { character: "冷", jyutping: "laang5", meaning: "cold" },
      { character: "老", jyutping: "lou5", meaning: "old" },
      { character: "藍", jyutping: "laam4", meaning: "blue" },
    ],
  },
  {
    id: "ng-m",
    titleEn: "/ng/ vs /m/",
    titleZhTW: "/ng/ 與 /m/",
    titleZhCN: "/ng/ 与 /m/",
    focusPhonemes: ["ng", "m"],
    descriptionEn: "Master the velar nasal /ng/ and bilabial /m/ endings",
    descriptionZhTW: "掌握軟顎鼻音 /ng/ 和雙唇音 /m/ 尾音",
    descriptionZhCN: "掌握软腭鼻音 /ng/ 和双唇音 /m/ 尾音",
    words: [
      { character: "我", jyutping: "ngo5", meaning: "I/me" },
      { character: "五", jyutping: "ng5", meaning: "five" },
      { character: "唔", jyutping: "m4", meaning: "not" },
      { character: "媽", jyutping: "maa1", meaning: "mother" },
      { character: "明", jyutping: "ming4", meaning: "bright" },
      { character: "名", jyutping: "meng2", meaning: "name" },
      { character: "行", jyutping: "haang4", meaning: "walk" },
      { character: "心", jyutping: "sam1", meaning: "heart" },
      { character: "生", jyutping: "saang1", meaning: "born" },
      { character: "音", jyutping: "jam1", meaning: "sound" },
    ],
  },
  {
    id: "tones-1-4",
    titleEn: "Tone 1 vs Tone 4",
    titleZhTW: "第一聲 與 第四聲",
    titleZhCN: "第一声 与 第四声",
    focusPhonemes: ["1", "4"],
    descriptionEn: "Distinguish high-level tone (1) from low-falling tone (4)",
    descriptionZhTW: "區分高平調（1）和低降調（4）",
    descriptionZhCN: "区分高平调（1）和低降调（4）",
    words: [
      { character: "詩", jyutping: "si1", meaning: "poem" },
      { character: "時", jyutping: "si4", meaning: "time" },
      { character: "三", jyutping: "saam1", meaning: "three" },
      { character: "蟬", jyutping: "sim4", meaning: "cicada" },
      { character: "天", jyutping: "tin1", meaning: "sky" },
      { character: "田", jyutping: "tin4", meaning: "field" },
      { character: "風", jyutping: "fung1", meaning: "wind" },
      { character: "紅", jyutping: "hung4", meaning: "red" },
      { character: "書", jyutping: "syu1", meaning: "book" },
      { character: "樹", jyutping: "syu6", meaning: "tree" },
    ],
  },
  {
    id: "tones-2-5",
    titleEn: "Tone 2 vs Tone 5",
    titleZhTW: "第二聲 與 第五聲",
    titleZhCN: "第二声 与 第五声",
    focusPhonemes: ["2", "5"],
    descriptionEn: "Distinguish high-rising tone (2) from low-rising tone (5)",
    descriptionZhTW: "區分高升調（2）和低升調（5）",
    descriptionZhCN: "区分高升调（2）和低升调（5）",
    words: [
      { character: "史", jyutping: "si2", meaning: "history" },
      { character: "市", jyutping: "si5", meaning: "city" },
      { character: "手", jyutping: "sau2", meaning: "hand" },
      { character: "守", jyutping: "sau2", meaning: "guard" },
      { character: "水", jyutping: "seoi2", meaning: "water" },
      { character: "社", jyutping: "se5", meaning: "society" },
      { character: "走", jyutping: "zau2", meaning: "run" },
      { character: "早", jyutping: "zou2", meaning: "early" },
      { character: "買", jyutping: "maai5", meaning: "buy" },
      { character: "米", jyutping: "mai5", meaning: "rice" },
    ],
  },
  {
    id: "aa-a",
    titleEn: "/aa/ vs /a/",
    titleZhTW: "/aa/ 與 /a/",
    titleZhCN: "/aa/ 与 /a/",
    focusPhonemes: ["aa", "a"],
    descriptionEn: "Distinguish long /aa/ from short /a/ vowels",
    descriptionZhTW: "區分長元音 /aa/ 和短元音 /a/",
    descriptionZhCN: "区分长元音 /aa/ 和短元音 /a/",
    words: [
      { character: "三", jyutping: "saam1", meaning: "three" },
      { character: "心", jyutping: "sam1", meaning: "heart" },
      { character: "山", jyutping: "saan1", meaning: "mountain" },
      { character: "新", jyutping: "san1", meaning: "new" },
      { character: "八", jyutping: "baat3", meaning: "eight" },
      { character: "筆", jyutping: "bat1", meaning: "pen" },
      { character: "班", jyutping: "baan1", meaning: "class" },
      { character: "賓", jyutping: "ban1", meaning: "guest" },
      { character: "甘", jyutping: "gam1", meaning: "sweet" },
      { character: "今", jyutping: "gam1", meaning: "today" },
    ],
  },
  {
    id: "eo-oe",
    titleEn: "/eo/ vs /oe/",
    titleZhTW: "/eo/ 與 /oe/",
    titleZhCN: "/eo/ 与 /oe/",
    focusPhonemes: ["eo", "oe"],
    descriptionEn: "Master the rounded vowel sounds /eo/ and /oe/",
    descriptionZhTW: "掌握圓唇元音 /eo/ 和 /oe/",
    descriptionZhCN: "掌握圆唇元音 /eo/ 和 /oe/",
    words: [
      { character: "水", jyutping: "seoi2", meaning: "water" },
      { character: "睡", jyutping: "seoi6", meaning: "sleep" },
      { character: "去", jyutping: "heoi3", meaning: "go" },
      { character: "居", jyutping: "geoi1", meaning: "live" },
      { character: "香", jyutping: "hoeng1", meaning: "fragrant" },
      { character: "想", jyutping: "soeng2", meaning: "think" },
      { character: "靴", jyutping: "hoe1", meaning: "boot" },
      { character: "鍋", jyutping: "wo1", meaning: "pot" },
      { character: "雪", jyutping: "syut3", meaning: "snow" },
      { character: "說", jyutping: "syut3", meaning: "speak" },
    ],
  },
  {
    id: "z-c",
    titleEn: "/z/ vs /c/",
    titleZhTW: "/z/ 與 /c/",
    titleZhCN: "/z/ 与 /c/",
    focusPhonemes: ["z", "c"],
    descriptionEn: "Distinguish unaspirated /z/ from aspirated /c/",
    descriptionZhTW: "區分不送氣音 /z/ 和送氣音 /c/",
    descriptionZhCN: "区分不送气音 /z/ 和送气音 /c/",
    words: [
      { character: "知", jyutping: "zi1", meaning: "know" },
      { character: "字", jyutping: "zi6", meaning: "character" },
      { character: "做", jyutping: "zou6", meaning: "do" },
      { character: "早", jyutping: "zou2", meaning: "early" },
      { character: "坐", jyutping: "zo6", meaning: "sit" },
      { character: "七", jyutping: "cat1", meaning: "seven" },
      { character: "車", jyutping: "ce1", meaning: "car" },
      { character: "錯", jyutping: "co3", meaning: "wrong" },
      { character: "次", jyutping: "ci3", meaning: "time" },
      { character: "差", jyutping: "caa1", meaning: "differ" },
    ],
  },
];

// Get today's topic based on date
export function getTodaysTopic(): PracticeTopic {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const topicIndex = dayOfYear % practiceTopics.length;
  return practiceTopics[topicIndex];
}

// Get topic title based on language
export function getTopicTitle(topic: PracticeTopic, language: string): string {
  switch (language) {
    case "zh-TW":
      return topic.titleZhTW;
    case "zh-CN":
      return topic.titleZhCN;
    default:
      return topic.titleEn;
  }
}

// Get topic description based on language
export function getTopicDescription(topic: PracticeTopic, language: string): string {
  switch (language) {
    case "zh-TW":
      return topic.descriptionZhTW;
    case "zh-CN":
      return topic.descriptionZhCN;
    default:
      return topic.descriptionEn;
  }
}
