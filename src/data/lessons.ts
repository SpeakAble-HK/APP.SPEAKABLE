export interface LessonData {
  id: string;
  island: 'phonetic' | 'semantic';
  category: string;
  categoryLabel: string;
  categoryLabelZh: string;
  title: string;
  titleZh: string;
  targetPhoneme: string;
  articulationInstruction: string;
  articulationInstructionZh: string;
  exampleWord: string;
  exampleWordEn: string;
  perceptionOptions: { text: string; correct: boolean }[];
  productionText: string;
  xpReward: number;
  sortOrder: number;
}

export const phonemeCategories = [
  { id: 'bilabial', label: 'Bilabial', labelZh: '雙唇音', emoji: '👄', color: 'bg-pink-500' },
  { id: 'alveolar', label: 'Alveolar', labelZh: '齒齦音', emoji: '👅', color: 'bg-blue-500' },
  { id: 'nasal', label: 'Nasal', labelZh: '鼻音', emoji: '👃', color: 'bg-green-500' },
  { id: 'velar', label: 'Velar', labelZh: '軟齶音', emoji: '🗣️', color: 'bg-purple-500' },
];

export const semanticCategories = [
  { id: 'greetings', label: 'Greetings', labelZh: '問候語', emoji: '👋', color: 'bg-amber-500' },
  { id: 'food', label: 'Food & Drink', labelZh: '飲食', emoji: '🍜', color: 'bg-orange-500' },
  { id: 'family', label: 'Family', labelZh: '家庭', emoji: '👨‍👩‍👧', color: 'bg-rose-500' },
  { id: 'daily', label: 'Daily Life', labelZh: '日常生活', emoji: '🏠', color: 'bg-teal-500' },
];

export const lessons: LessonData[] = [
  // ── Bilabial /b/ ──
  {
    id: 'bil-b1', island: 'phonetic', category: 'bilabial',
    categoryLabel: 'Bilabial', categoryLabelZh: '雙唇音',
    title: 'Sound /b/', titleZh: '聲母 /b/',
    targetPhoneme: '/b/',
    articulationInstruction: 'Close both lips together, then release with a burst of air.',
    articulationInstructionZh: '雙唇緊閉，然後釋放氣流。',
    exampleWord: '爸爸', exampleWordEn: 'Dad',
    perceptionOptions: [
      { text: '爸爸', correct: true },
      { text: '媽媽', correct: false },
      { text: '大大', correct: false },
    ],
    productionText: '爸爸', xpReward: 50, sortOrder: 1,
  },
  {
    id: 'bil-b2', island: 'phonetic', category: 'bilabial',
    categoryLabel: 'Bilabial', categoryLabelZh: '雙唇音',
    title: 'Sound /b/ — Practice', titleZh: '聲母 /b/ — 練習',
    targetPhoneme: '/b/',
    articulationInstruction: 'Close both lips together, then release with a burst of air.',
    articulationInstructionZh: '雙唇緊閉，然後釋放氣流。',
    exampleWord: '波波', exampleWordEn: 'Ball',
    perceptionOptions: [
      { text: '波波', correct: true },
      { text: '婆婆', correct: false },
      { text: '多多', correct: false },
    ],
    productionText: '波波', xpReward: 50, sortOrder: 2,
  },
  // ── Bilabial /p/ ──
  {
    id: 'bil-p1', island: 'phonetic', category: 'bilabial',
    categoryLabel: 'Bilabial', categoryLabelZh: '雙唇音',
    title: 'Sound /p/', titleZh: '聲母 /p/',
    targetPhoneme: '/p/',
    articulationInstruction: 'Close both lips, build up pressure, then release with a strong puff of air.',
    articulationInstructionZh: '雙唇緊閉，積聚氣壓，然後用力釋放。',
    exampleWord: '婆婆', exampleWordEn: 'Grandma',
    perceptionOptions: [
      { text: '婆婆', correct: true },
      { text: '爸爸', correct: false },
      { text: '哥哥', correct: false },
    ],
    productionText: '婆婆', xpReward: 50, sortOrder: 3,
  },
  // ── Bilabial /m/ ──
  {
    id: 'bil-m1', island: 'phonetic', category: 'bilabial',
    categoryLabel: 'Bilabial', categoryLabelZh: '雙唇音',
    title: 'Sound /m/', titleZh: '聲母 /m/',
    targetPhoneme: '/m/',
    articulationInstruction: 'Close both lips and hum — air flows through your nose.',
    articulationInstructionZh: '雙唇緊閉，發出嗡嗡聲 — 氣流通過鼻腔。',
    exampleWord: '媽媽', exampleWordEn: 'Mum',
    perceptionOptions: [
      { text: '媽媽', correct: true },
      { text: '爸爸', correct: false },
      { text: '奶奶', correct: false },
    ],
    productionText: '媽媽', xpReward: 50, sortOrder: 4,
  },
  // ── Alveolar /t/ ──
  {
    id: 'alv-t1', island: 'phonetic', category: 'alveolar',
    categoryLabel: 'Alveolar', categoryLabelZh: '齒齦音',
    title: 'Sound /t/', titleZh: '聲母 /t/',
    targetPhoneme: '/t/',
    articulationInstruction: 'Touch the tip of your tongue behind your upper front teeth, then release.',
    articulationInstructionZh: '舌尖觸碰上門牙後方，然後釋放。',
    exampleWord: '大', exampleWordEn: 'Big',
    perceptionOptions: [
      { text: '大', correct: true },
      { text: '爸', correct: false },
      { text: '家', correct: false },
    ],
    productionText: '大', xpReward: 75, sortOrder: 5,
  },
  {
    id: 'alv-d1', island: 'phonetic', category: 'alveolar',
    categoryLabel: 'Alveolar', categoryLabelZh: '齒齦音',
    title: 'Sound /d/', titleZh: '聲母 /d/',
    targetPhoneme: '/d/',
    articulationInstruction: 'Touch the tip of your tongue behind your upper front teeth, then release gently.',
    articulationInstructionZh: '舌尖輕觸上門牙後方，然後輕輕釋放。',
    exampleWord: '弟弟', exampleWordEn: 'Little brother',
    perceptionOptions: [
      { text: '弟弟', correct: true },
      { text: '哥哥', correct: false },
      { text: '媽媽', correct: false },
    ],
    productionText: '弟弟', xpReward: 75, sortOrder: 6,
  },
  // ── Alveolar /l/ ──
  {
    id: 'alv-l1', island: 'phonetic', category: 'alveolar',
    categoryLabel: 'Alveolar', categoryLabelZh: '齒齦音',
    title: 'Sound /l/', titleZh: '聲母 /l/',
    targetPhoneme: '/l/',
    articulationInstruction: 'Place the tip of your tongue on the ridge behind your upper teeth. Let air flow around the sides.',
    articulationInstructionZh: '舌尖放在上齒齦脊上，讓氣流從兩側通過。',
    exampleWord: '你', exampleWordEn: 'You',
    perceptionOptions: [
      { text: '你', correct: true },
      { text: '我', correct: false },
      { text: '他', correct: false },
    ],
    productionText: '你好', xpReward: 75, sortOrder: 7,
  },
  // ── Nasal /n/ ──
  {
    id: 'nas-n1', island: 'phonetic', category: 'nasal',
    categoryLabel: 'Nasal', categoryLabelZh: '鼻音',
    title: 'Sound /n/', titleZh: '聲母 /n/',
    targetPhoneme: '/n/',
    articulationInstruction: 'Touch the tip of your tongue behind upper teeth and hum through your nose.',
    articulationInstructionZh: '舌尖觸碰上門牙後方，通過鼻腔發聲。',
    exampleWord: '奶奶', exampleWordEn: 'Grandma (paternal)',
    perceptionOptions: [
      { text: '奶奶', correct: true },
      { text: '媽媽', correct: false },
      { text: '婆婆', correct: false },
    ],
    productionText: '奶奶', xpReward: 75, sortOrder: 8,
  },
  // ── Nasal /ŋ/ ──
  {
    id: 'nas-ng1', island: 'phonetic', category: 'nasal',
    categoryLabel: 'Nasal', categoryLabelZh: '鼻音',
    title: 'Sound /ŋ/', titleZh: '聲母 /ŋ/',
    targetPhoneme: '/ŋ/',
    articulationInstruction: 'Raise the back of your tongue to your soft palate and hum through your nose.',
    articulationInstructionZh: '舌根抬起觸碰軟齶，通過鼻腔發聲。',
    exampleWord: '我', exampleWordEn: 'I / me',
    perceptionOptions: [
      { text: '我', correct: true },
      { text: '你', correct: false },
      { text: '佢', correct: false },
    ],
    productionText: '我', xpReward: 75, sortOrder: 9,
  },
  // ── Velar /k/ ──
  {
    id: 'vel-k1', island: 'phonetic', category: 'velar',
    categoryLabel: 'Velar', categoryLabelZh: '軟齶音',
    title: 'Sound /k/', titleZh: '聲母 /k/',
    targetPhoneme: '/k/',
    articulationInstruction: 'Raise the back of your tongue to your soft palate, then release with a burst.',
    articulationInstructionZh: '舌根抬起觸碰軟齶，然後快速釋放。',
    exampleWord: '家', exampleWordEn: 'Home',
    perceptionOptions: [
      { text: '家', correct: true },
      { text: '大', correct: false },
      { text: '他', correct: false },
    ],
    productionText: '家', xpReward: 100, sortOrder: 10,
  },
  // ── Velar /g/ ──
  {
    id: 'vel-g1', island: 'phonetic', category: 'velar',
    categoryLabel: 'Velar', categoryLabelZh: '軟齶音',
    title: 'Sound /g/', titleZh: '聲母 /g/',
    targetPhoneme: '/g/',
    articulationInstruction: 'Raise the back of your tongue to your soft palate, then release gently.',
    articulationInstructionZh: '舌根抬起觸碰軟齶，然後輕輕釋放。',
    exampleWord: '哥哥', exampleWordEn: 'Big brother',
    perceptionOptions: [
      { text: '哥哥', correct: true },
      { text: '弟弟', correct: false },
      { text: '爸爸', correct: false },
    ],
    productionText: '哥哥', xpReward: 100, sortOrder: 11,
  },
  // ── Semantic: Greetings ──
  {
    id: 'sem-greet1', island: 'semantic', category: 'greetings',
    categoryLabel: 'Greetings', categoryLabelZh: '問候語',
    title: 'Hello', titleZh: '你好',
    targetPhoneme: 'nei5 hou2',
    articulationInstruction: 'A common greeting. Practise clear tones.',
    articulationInstructionZh: '常用問候語。注意聲調。',
    exampleWord: '你好', exampleWordEn: 'Hello',
    perceptionOptions: [
      { text: '你好', correct: true },
      { text: '再見', correct: false },
      { text: '多謝', correct: false },
    ],
    productionText: '你好', xpReward: 50, sortOrder: 1,
  },
  {
    id: 'sem-greet2', island: 'semantic', category: 'greetings',
    categoryLabel: 'Greetings', categoryLabelZh: '問候語',
    title: 'Good morning', titleZh: '早晨',
    targetPhoneme: 'zou2 san4',
    articulationInstruction: 'Used in the morning. Practise rising tone.',
    articulationInstructionZh: '早上使用的問候語。注意升調。',
    exampleWord: '早晨', exampleWordEn: 'Good morning',
    perceptionOptions: [
      { text: '早晨', correct: true },
      { text: '你好', correct: false },
      { text: '晚安', correct: false },
    ],
    productionText: '早晨', xpReward: 50, sortOrder: 2,
  },
  {
    id: 'sem-greet3', island: 'semantic', category: 'greetings',
    categoryLabel: 'Greetings', categoryLabelZh: '問候語',
    title: 'Thank you', titleZh: '多謝',
    targetPhoneme: 'do1 ze6',
    articulationInstruction: 'Express gratitude. Practise tone contrast.',
    articulationInstructionZh: '表達感謝。注意聲調對比。',
    exampleWord: '多謝', exampleWordEn: 'Thank you',
    perceptionOptions: [
      { text: '多謝', correct: true },
      { text: '唔該', correct: false },
      { text: '對唔住', correct: false },
    ],
    productionText: '多謝', xpReward: 50, sortOrder: 3,
  },
  // ── Semantic: Food ──
  {
    id: 'sem-food1', island: 'semantic', category: 'food',
    categoryLabel: 'Food & Drink', categoryLabelZh: '飲食',
    title: 'Have you eaten?', titleZh: '食咗飯未？',
    targetPhoneme: 'sik6 zo2 faan6 mei6',
    articulationInstruction: 'A classic Cantonese greeting about food.',
    articulationInstructionZh: '經典的廣東話問候語。',
    exampleWord: '食咗飯未', exampleWordEn: 'Have you eaten?',
    perceptionOptions: [
      { text: '食咗飯未', correct: true },
      { text: '飲咗水未', correct: false },
      { text: '瞓咗覺未', correct: false },
    ],
    productionText: '食咗飯未', xpReward: 75, sortOrder: 4,
  },
  {
    id: 'sem-food2', island: 'semantic', category: 'food',
    categoryLabel: 'Food & Drink', categoryLabelZh: '飲食',
    title: 'Drink tea', titleZh: '飲茶',
    targetPhoneme: 'jam2 caa4',
    articulationInstruction: 'Dim sum culture phrase. Practise the tones.',
    articulationInstructionZh: '飲茶文化用語。注意聲調。',
    exampleWord: '飲茶', exampleWordEn: 'Drink tea / Dim sum',
    perceptionOptions: [
      { text: '飲茶', correct: true },
      { text: '食飯', correct: false },
      { text: '飲水', correct: false },
    ],
    productionText: '飲茶', xpReward: 75, sortOrder: 5,
  },
  // ── Semantic: Family ──
  {
    id: 'sem-fam1', island: 'semantic', category: 'family',
    categoryLabel: 'Family', categoryLabelZh: '家庭',
    title: 'Family members', titleZh: '家人',
    targetPhoneme: 'gaa1 jan4',
    articulationInstruction: 'Practise naming family members.',
    articulationInstructionZh: '練習稱呼家庭成員。',
    exampleWord: '爸爸媽媽', exampleWordEn: 'Mum and Dad',
    perceptionOptions: [
      { text: '爸爸', correct: true },
      { text: '老師', correct: false },
      { text: '朋友', correct: false },
    ],
    productionText: '爸爸媽媽', xpReward: 75, sortOrder: 6,
  },
  // ── Semantic: Daily Life ──
  {
    id: 'sem-daily1', island: 'semantic', category: 'daily',
    categoryLabel: 'Daily Life', categoryLabelZh: '日常生活',
    title: 'Go to school', titleZh: '返學',
    targetPhoneme: 'faan1 hok6',
    articulationInstruction: 'Common daily phrase.',
    articulationInstructionZh: '日常常用短語。',
    exampleWord: '返學', exampleWordEn: 'Go to school',
    perceptionOptions: [
      { text: '返學', correct: true },
      { text: '返工', correct: false },
      { text: '放學', correct: false },
    ],
    productionText: '返學', xpReward: 75, sortOrder: 7,
  },
];

export function getLessonsByIsland(island: 'phonetic' | 'semantic') {
  return lessons.filter(l => l.island === island);
}

export function getLessonsByCategory(category: string) {
  return lessons.filter(l => l.category === category).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getLessonById(id: string) {
  return lessons.find(l => l.id === id);
}
