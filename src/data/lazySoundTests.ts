export interface LazySoundWord {
  character: string;
  jyutping: string;
}

export interface LazySoundCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  confusionPair: string;
  words: LazySoundWord[];
}

export const lazySoundCategories: LazySoundCategory[] = [
  {
    id: "n-l",
    label: "n/l 不分",
    description: "混淆鼻音 /n/ 與邊音 /l/",
    icon: "swap_horiz",
    confusionPair: "/n/ vs /l/",
    words: [
      { character: "你", jyutping: "nei5" },
      { character: "李", jyutping: "lei5" },
      { character: "男", jyutping: "naam4" },
      { character: "藍", jyutping: "laam4" },
      { character: "年", jyutping: "nin4" },
      { character: "連", jyutping: "lin4" },
      { character: "腦", jyutping: "nou5" },
      { character: "老", jyutping: "lou5" },
      { character: "暖", jyutping: "nyun5" },
      { character: "卵", jyutping: "leon5" },
    ],
  },
  {
    id: "ng-drop",
    label: "ng 脫落",
    description: "漏讀 /ng/ 聲母",
    icon: "volume_off",
    confusionPair: "/ng/ vs /∅/",
    words: [
      { character: "我", jyutping: "ngo5" },
      { character: "哦", jyutping: "o4" },
      { character: "牙", jyutping: "ngaa4" },
      { character: "啊", jyutping: "aa1" },
      { character: "岸", jyutping: "ngon6" },
      { character: "按", jyutping: "on3" },
      { character: "咬", jyutping: "ngaau5" },
      { character: "拗", jyutping: "aau2" },
    ],
  },
  {
    id: "gw-g",
    label: "gw/g 混淆",
    description: "混淆圓唇音 /gw/ 與 /g/",
    icon: "compare_arrows",
    confusionPair: "/gw/ vs /g/",
    words: [
      { character: "國", jyutping: "gwok3" },
      { character: "各", jyutping: "gok3" },
      { character: "廣", jyutping: "gwong2" },
      { character: "港", jyutping: "gong2" },
      { character: "光", jyutping: "gwong1" },
      { character: "剛", jyutping: "gong1" },
      { character: "瓜", jyutping: "gwaa1" },
      { character: "家", jyutping: "gaa1" },
    ],
  },
];
