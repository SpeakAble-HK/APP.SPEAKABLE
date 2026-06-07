/**
 * 小熊歷險記 — Bear Adventure
 *
 * Story World 1: A young bear cub explores the forest, meeting friends
 * and learning to speak clearly to solve problems.
 *
 * Focus: Bilabial phonemes (/b/, /p/, /m/) + Tones 1, 4
 * Age: 4-6 years
 * Chapters: 3 (demo) / 10 (full)
 */

import type { StoryWorld } from "@/types/storyverse";

export const bearAdventureWorld: StoryWorld = {
  id: "bear-adventure",
  title: "Bear Adventure",
  titleZh: "小熊歷險記",
  emoji: "🐻",

  description: "Join Benny the Bear cub as he explores the magical forest, makes new friends, and learns to speak clearly!",
  descriptionZh: "同小熊班班一齊探索魔法森林，認識新朋友，學習講清楚每個音！",

  cover_image_url: "/stories/bear-adventure/cover.jpg",
  theme_color: "#8B4513",

  characters: [
    {
      id: "benny",
      name: "Benny Bear",
      nameZh: "班班熊",
      avatar_url: "/stories/bear-adventure/benny.png",
      emotion: "happy",
    },
    {
      id: "mama",
      name: "Mama Bear",
      nameZh: "熊媽媽",
      avatar_url: "/stories/bear-adventure/mama.png",
      emotion: "happy",
    },
    {
      id: "pipi",
      name: "PiPi Parrot",
      nameZh: "皮皮鸚鵡",
      avatar_url: "/stories/bear-adventure/pipi.png",
      emotion: "excited",
    },
    {
      id: "monkey",
      name: "Monkey Friend",
      nameZh: "猴子朋友",
      avatar_url: "/stories/bear-adventure/monkey.png",
      emotion: "happy",
    },
  ],

  age_range: { min: 4, max: 6 },
  phoneme_focus: ["/b/", "/p/", "/m/"],
  tone_focus: ["tone_1", "tone_4"],

  chapters: [
    // ─── CHAPTER 1: Benny Wakes Up ─────────────────────────────────────────
    {
      id: "bear-ch1",
      world_id: "bear-adventure",
      chapter_number: 1,
      title: "Benny Wakes Up",
      titleZh: "班班起床",
      subtitle: "Morning greetings with Mama Bear",
      subtitleZh: "同熊媽媽講早晨",

      description: "Benny wakes up on a sunny morning. Mama Bear is waiting with a warm hug. Can you say good morning to her?",
      descriptionZh: "陽光明媚嘅早晨，班班醒咗。熊媽媽等緊俾個溫暖嘅擁抱佢。你可唔可以向佢講早晨？",

      therapist_goal: "Practice bilabial initials /b/, /p/ in greeting context",
      therapist_goal_zh: "練習問候語境中嘅雙唇音 /b/, /p/",

      target_phonemes: ["/b/", "/p/"],
      target_tones: ["tone_1", "tone_4"],
      target_words: ["爸", "波", "抱", "八"],

      difficulty: "easy",
      estimated_minutes: 5,

      entry_scene_id: "bear-ch1-s1",

      scenes: [
        // Scene 1: Introduction
        {
          id: "bear-ch1-s1",
          chapter_id: "bear-ch1",
          type: "intro",
          title: "A New Day",
          titleZh: "新的一天",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch1/scene1-bg.jpg",
            overlay_color: "rgba(255, 200, 100, 0.2)",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "happy" },
            { id: "mama", name: "Mama Bear", nameZh: "熊媽媽", emotion: "happy" },
          ],

          dialogue: [
            {
              character_id: "mama",
              text: "Good morning, Benny! Time to wake up!",
              textZh: "早晨呀，班班！起身喇！",
              emotion: "happy",
            },
            {
              character_id: "benny",
              text: "Good morning, Mama!",
              textZh: "早晨，媽媽！",
              emotion: "happy",
            },
            {
              character_id: "pipi",
              text: "Can you help Benny say good morning to Mama?",
              textZh: "你可唔可以幫班班向媽媽講早晨？",
              emotion: "excited",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch1-s2" },
          ],

          therapist_note: "Introduction scene — no speech mission, sets context",
        },

        // Scene 2: Speech Mission — "baa1" (爸 dad)
        {
          id: "bear-ch1-s2",
          chapter_id: "bear-ch1",
          type: "mission",
          title: "Say 'Dad'",
          titleZh: "講「爸」",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch1/scene2-bg.jpg",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "thinking" },
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "encouraging" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "Benny wants to call his dad. Can you say 'baa1' for him?",
              textZh: "班班想叫佢爸爸。你可唔可以幫佢講「baa1」？",
              emotion: "encouraging",
            },
          ],

          mission: {
            id: "bear-ch1-m1",
            type: "speech",
            target: {
              word: "爸",
              jyutping: "baa1",
              meaning: "dad",
              target_phonemes: ["/b/"],
              target_tone: "tone_1",
              target_phoneme_type: "initial",
            },
            success_criteria: {
              min_overall_accuracy: 0.6,
              min_tone_accuracy: 0.5,
              min_articulation_score: 0.6,
              max_timing_deviation_ms: 150,
              allow_low_confidence: true,
            },
            prompt: "Say 'baa1' like you're calling your dad!",
            promptZh: "好似叫你爸爸咁講「baa1」！",
            hint: "Start with your lips together, then open them: b-b-baa!",
            hintZh: "閉埋嘴唇，然後張開：b-b-baa！",
          },

          branches: [
            { condition: "success", next_scene_id: "bear-ch1-s3", label: "Success", labelZh: "成功" },
            { condition: "almost", next_scene_id: "bear-ch1-s2-retry", label: "Try Again", labelZh: "再試" },
            { condition: "needs_practice", next_scene_id: "bear-ch1-s2-hint", label: "Need Help", labelZh: "需要幫助" },
          ],

          adaptation_key: "bilabial_stop_tone1",
        },

        // Scene 2 Retry: Encouragement
        {
          id: "bear-ch1-s2-retry",
          chapter_id: "bear-ch1",
          type: "dialogue",
          title: "Almost There!",
          titleZh: "差啲啲！",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch1/scene2-bg.jpg",
          },

          characters: [
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "encouraging" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "Good try! Let's do it again. Close your lips tight, then say 'baa1'!",
              textZh: "試得好！我哋再試一次。閉埋嘴唇，然後講「baa1」！",
              emotion: "encouraging",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch1-s2" },
          ],
        },

        // Scene 2 Hint: Extra Help
        {
          id: "bear-ch1-s2-hint",
          chapter_id: "bear-ch1",
          type: "dialogue",
          title: "Let Me Show You",
          titleZh: "等我示範",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch1/scene2-bg.jpg",
          },

          characters: [
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "thinking" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "Watch my beak! I close my lips like this... b-b-b... then open: baa!",
              textZh: "睇住我個嘴！我咁閉埋嘴唇... b-b-b... 然後張開：baa！",
              emotion: "thinking",
            },
            {
              character_id: "pipi",
              text: "Now you try! Put your lips together and say 'baa1'!",
              textZh: "到你試！合埋嘴唇講「baa1」！",
              emotion: "encouraging",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch1-s2" },
          ],

          therapist_note: "Provides visual + verbal hint for /b/ articulation",
        },

        // Scene 3: Success — Reward
        {
          id: "bear-ch1-s3",
          chapter_id: "bear-ch1",
          type: "reward",
          title: "Well Done!",
          titleZh: "做得好！",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch1/scene3-bg.jpg",
            overlay_color: "rgba(255, 215, 0, 0.3)",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "excited" },
            { id: "mama", name: "Mama Bear", nameZh: "熊媽媽", emotion: "happy" },
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "excited" },
          ],

          dialogue: [
            {
              character_id: "benny",
              text: "Daddy is coming! You did it!",
              textZh: "爸爸嚟緊喇！你做到喇！",
              emotion: "excited",
            },
            {
              character_id: "mama",
              text: "Wonderful! You said 'baa1' so clearly!",
              textZh: "好叻呀！你講「baa1」講得好清楚！",
              emotion: "happy",
            },
            {
              character_id: "pipi",
              text: "Here's your first sticker! Let's go find Monkey friend!",
              textZh: "送你第一張貼紙！我哋去搵猴子朋友！",
              emotion: "excited",
            },
          ],

          reward: {
            type: "sticker",
            id: "bear-sticker-01",
            name: "Honey Pot Sticker",
            nameZh: "蜜糖罐貼紙",
            icon_url: "/stories/bear-adventure/rewards/honey-pot.png",
            xp_amount: 50,
          },

          branches: [
            { condition: "always", next_scene_id: "bear-ch1-s4" },
          ],
        },

        // Scene 4: Next Mission — "bo1" (波 ball)
        {
          id: "bear-ch1-s4",
          chapter_id: "bear-ch1",
          type: "mission",
          title: "Play with a Ball",
          titleZh: "玩波波",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch1/scene4-bg.jpg",
          },

          characters: [
            { id: "monkey", name: "Monkey Friend", nameZh: "猴子朋友", emotion: "happy" },
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "happy" },
          ],

          dialogue: [
            {
              character_id: "monkey",
              text: "Hi Benny! Want to play with my ball?",
              textZh: "嗨班班！想唔想玩我個波波？",
              emotion: "happy",
            },
            {
              character_id: "benny",
              text: "Yes! Can you say 'bo1' to ask for the ball?",
              textZh: "想！你可唔可以講「bo1」向佢攞個波波？",
              emotion: "happy",
            },
          ],

          mission: {
            id: "bear-ch1-m2",
            type: "speech",
            target: {
              word: "波",
              jyutping: "bo1",
              meaning: "ball",
              target_phonemes: ["/b/"],
              target_tone: "tone_1",
              target_phoneme_type: "initial",
            },
            success_criteria: {
              min_overall_accuracy: 0.6,
              min_tone_accuracy: 0.5,
              min_articulation_score: 0.6,
              max_timing_deviation_ms: 150,
              allow_low_confidence: true,
            },
            prompt: "Say 'bo1' to ask for the ball!",
            promptZh: "講「bo1」向佢攞個波波！",
            hint: "Same as 'baa1' but with rounded lips: b-bo!",
            hintZh: "同「baa1」一樣，但係嘴唇要圓啲：b-bo！",
          },

          branches: [
            { condition: "success", next_scene_id: "bear-ch1-s5" },
            { condition: "almost", next_scene_id: "bear-ch1-s4-retry" },
            { condition: "needs_practice", next_scene_id: "bear-ch1-s4-hint" },
          ],

          adaptation_key: "bilabial_stop_tone1_rounded",
        },

        // Scene 4 Retry
        {
          id: "bear-ch1-s4-retry",
          chapter_id: "bear-ch1",
          type: "dialogue",
          title: "Try Again!",
          titleZh: "再試一次！",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch1/scene4-bg.jpg",
          },

          characters: [
            { id: "monkey", name: "Monkey Friend", nameZh: "猴子朋友", emotion: "encouraging" },
          ],

          dialogue: [
            {
              character_id: "monkey",
              text: "Almost! Round your lips more: b-bo1!",
              textZh: "差啲啲！嘴唇圓啲：b-bo1！",
              emotion: "encouraging",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch1-s4" },
          ],
        },

        // Scene 4 Hint
        {
          id: "bear-ch1-s4-hint",
          chapter_id: "bear-ch1",
          type: "dialogue",
          title: "Watch My Lips",
          titleZh: "睇住我個嘴",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch1/scene4-bg.jpg",
          },

          characters: [
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "thinking" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "For 'bo1', make your lips into a circle like a ball! b-bo1!",
              textZh: "講「bo1」嘅時候，嘴唇圓啲好似個波波咁！b-bo1！",
              emotion: "thinking",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch1-s4" },
          ],
        },

        // Scene 5: Chapter Complete
        {
          id: "bear-ch1-s5",
          chapter_id: "bear-ch1",
          type: "finale",
          title: "Chapter Complete!",
          titleZh: "第一章完成！",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch1/scene5-bg.jpg",
            overlay_color: "rgba(255, 215, 0, 0.4)",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "excited" },
            { id: "monkey", name: "Monkey Friend", nameZh: "猴子朋友", emotion: "happy" },
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "excited" },
          ],

          dialogue: [
            {
              character_id: "benny",
              text: "Thanks for helping me! Now let's play with the ball!",
              textZh: "多謝你幫我！而家我哋一齊玩波波！",
              emotion: "excited",
            },
            {
              character_id: "pipi",
              text: "You learned /b/ so well! Ready for the next adventure?",
              textZh: "你學識咗 /b/ 喇！準備好進行下一個冒險未？",
              emotion: "excited",
            },
          ],

          reward: {
            type: "badge",
            id: "bear-badge-ch1",
            name: "Bilabial Beginner Badge",
            nameZh: "雙唇音初學者徽章",
            icon_url: "/stories/bear-adventure/rewards/bilabial-beginner.png",
            xp_amount: 100,
          },

          branches: [
            { condition: "always", next_scene_id: "bear-ch2-s1" },
          ],
        },
      ],
    },

    // ─── CHAPTER 2: The Ball Game ──────────────────────────────────────────
    {
      id: "bear-ch2",
      world_id: "bear-adventure",
      chapter_number: 2,
      title: "The Ball Game",
      titleZh: "波波遊戲",
      subtitle: "Playing catch with /p/ sounds",
      subtitleZh: "玩拋接遊戲，練習 /p/ 音",

      description: "Benny and Monkey are playing catch! Can you help them count the balls with /p/ sounds?",
      descriptionZh: "班班同猴子玩拋接！你可唔可以幫佢哋用 /p/ 音數波波？",

      therapist_goal: "Practice voiceless bilabial stop /p/ with tone 4",
      therapist_goal_zh: "練習送氣雙唇塞音 /p/ 配第四聲",

      target_phonemes: ["/p/"],
      target_tones: ["tone_4"],
      target_words: ["婆", "爬", "怕"],

      difficulty: "easy",
      estimated_minutes: 5,

      entry_scene_id: "bear-ch2-s1",

      unlock_condition: {
        type: "chapter_complete",
        chapter_id: "bear-ch1",
      },

      scenes: [
        // Scene 1: Introduction
        {
          id: "bear-ch2-s1",
          chapter_id: "bear-ch2",
          type: "intro",
          title: "Time to Play",
          titleZh: "玩遊戲時間",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch2/scene1-bg.jpg",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "excited" },
            { id: "monkey", name: "Monkey Friend", nameZh: "猴子朋友", emotion: "happy" },
          ],

          dialogue: [
            {
              character_id: "monkey",
              text: "Let's play catch! I'll throw, you catch!",
              textZh: "我哋玩拋接！我拋，你接！",
              emotion: "happy",
            },
            {
              character_id: "benny",
              text: "Can you help me say 'paa4' when I catch the ball?",
              textZh: "我接住個波嘅時候，你可唔可以幫我講「paa4」？",
              emotion: "excited",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch2-s2" },
          ],
        },

        // Scene 2: Mission — "paa4" (爬 climb)
        {
          id: "bear-ch2-s2",
          chapter_id: "bear-ch2",
          type: "mission",
          title: "Catch and Say",
          titleZh: "接住講",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch2/scene2-bg.jpg",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "thinking" },
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "encouraging" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "When Benny catches the ball, say 'paa4'! Remember, /p/ has a puff of air!",
              textZh: "班班接住個波嘅時候，講「paa4」！記住，/p/ 要送氣㗎！",
              emotion: "encouraging",
            },
          ],

          mission: {
            id: "bear-ch2-m1",
            type: "speech",
            target: {
              word: "爬",
              jyutping: "paa4",
              meaning: "climb",
              target_phonemes: ["/p/"],
              target_tone: "tone_4",
              target_phoneme_type: "initial",
            },
            success_criteria: {
              min_overall_accuracy: 0.6,
              min_tone_accuracy: 0.5,
              min_articulation_score: 0.6,
              max_timing_deviation_ms: 150,
              allow_low_confidence: true,
            },
            prompt: "Say 'paa4' when Benny catches the ball!",
            promptZh: "班班接住個波嘅時候講「paa4」！",
            hint: "Put your lips together, then open with a puff: p-p-paa!",
            hintZh: "閉埋嘴唇，然後送氣張開：p-p-paa！",
          },

          branches: [
            { condition: "success", next_scene_id: "bear-ch2-s3" },
            { condition: "almost", next_scene_id: "bear-ch2-s2-retry" },
            { condition: "needs_practice", next_scene_id: "bear-ch2-s2-hint" },
          ],

          adaptation_key: "bilabial_aspirated_tone4",
        },

        // Scene 2 Retry
        {
          id: "bear-ch2-s2-retry",
          chapter_id: "bear-ch2",
          type: "dialogue",
          title: "Feel the Air",
          titleZh: "感受氣流",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch2/scene2-bg.jpg",
          },

          characters: [
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "encouraging" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "Put your hand in front of your mouth. Feel the air when you say /p/? Try again!",
              textZh: "將手放喺嘴前面。講 /p/ 嘅時候感受到氣流未？再試一次！",
              emotion: "encouraging",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch2-s2" },
          ],
        },

        // Scene 2 Hint
        {
          id: "bear-ch2-s2-hint",
          chapter_id: "bear-ch2",
          type: "dialogue",
          title: "/b/ vs /p/",
          titleZh: "/b/ 同 /p/ 嘅分別",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch2/scene2-bg.jpg",
          },

          characters: [
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "thinking" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "/b/ has no air, but /p/ has a big puff! Watch: b-b-baa vs p-p-paa!",
              textZh: "/b/ 冇氣流，但 /p/ 有好大嘅送氣！睇住：b-b-baa 同 p-p-paa！",
              emotion: "thinking",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch2-s2" },
          ],

          therapist_note: "Teaches /b/ vs /p/ contrast — minimal pair awareness",
        },

        // Scene 3: Success + Reward
        {
          id: "bear-ch2-s3",
          chapter_id: "bear-ch2",
          type: "reward",
          title: "Great Catch!",
          titleZh: "接得好！",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch2/scene3-bg.jpg",
            overlay_color: "rgba(100, 200, 255, 0.2)",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "excited" },
            { id: "monkey", name: "Monkey Friend", nameZh: "猴子朋友", emotion: "happy" },
          ],

          dialogue: [
            {
              character_id: "monkey",
              text: "Wow! You caught it and said 'paa4' perfectly!",
              textZh: "嘩！你接住咗，仲講「paa4」講得好準！",
              emotion: "happy",
            },
            {
              character_id: "benny",
              text: "Let's play more! Can you say 'paa4' again?",
              textZh: "我哋再玩多啲！你可唔可以再講「paa4」？",
              emotion: "excited",
            },
          ],

          reward: {
            type: "sticker",
            id: "bear-sticker-02",
            name: "Ball Sticker",
            nameZh: "波波貼紙",
            icon_url: "/stories/bear-adventure/rewards/ball.png",
            xp_amount: 50,
          },

          branches: [
            { condition: "always", next_scene_id: "bear-ch2-s4" },
          ],
        },

        // Scene 4: Chapter Complete
        {
          id: "bear-ch2-s4",
          chapter_id: "bear-ch2",
          type: "finale",
          title: "Chapter Complete!",
          titleZh: "第二章完成！",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch2/scene4-bg.jpg",
            overlay_color: "rgba(255, 215, 0, 0.4)",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "excited" },
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "excited" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "You learned /p/ with a big puff! You're a bilabial star!",
              textZh: "你學識咗送氣嘅 /p/！你係雙唇音之星！",
              emotion: "excited",
            },
          ],

          reward: {
            type: "badge",
            id: "bear-badge-ch2",
            name: "Puff Master Badge",
            nameZh: "送氣大師徽章",
            icon_url: "/stories/bear-adventure/rewards/puff-master.png",
            xp_amount: 100,
          },

          branches: [
            { condition: "always", next_scene_id: "bear-ch3-s1" },
          ],
        },
      ],
    },

    // ─── CHAPTER 3: Mama's Hug ─────────────────────────────────────────────
    {
      id: "bear-ch3",
      world_id: "bear-adventure",
      chapter_number: 3,
      title: "Mama's Hug",
      titleZh: "媽媽嘅擁抱",
      subtitle: "Warm hugs with /m/ sounds",
      subtitleZh: "溫暖嘅擁抱，練習 /m/ 音",

      description: "It's getting late. Mama Bear is waiting for a big hug. Can you say 'mou5' to call her?",
      descriptionZh: "天黑喇。熊媽媽等緊一個大擁抱。你可唔可以講「mou5」叫佢過嚟？",

      therapist_goal: "Practice nasal bilabial /m/ with tone 5",
      therapist_goal_zh: "練習雙唇鼻音 /m/ 配第五聲",

      target_phonemes: ["/m/"],
      target_tones: ["tone_5"],
      target_words: ["媽", "毛", "貓"],

      difficulty: "easy",
      estimated_minutes: 5,

      entry_scene_id: "bear-ch3-s1",

      unlock_condition: {
        type: "chapter_complete",
        chapter_id: "bear-ch2",
      },

      scenes: [
        // Scene 1: Introduction
        {
          id: "bear-ch3-s1",
          chapter_id: "bear-ch3",
          type: "intro",
          title: "Time for a Hug",
          titleZh: "擁抱時間",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch3/scene1-bg.jpg",
            overlay_color: "rgba(255, 150, 200, 0.2)",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "happy" },
            { id: "mama", name: "Mama Bear", nameZh: "熊媽媽", emotion: "happy" },
          ],

          dialogue: [
            {
              character_id: "benny",
              text: "I want a hug from Mama! Can you help me call her?",
              textZh: "我想媽媽攬住我！你可唔可以幫我叫佢？",
              emotion: "happy",
            },
            {
              character_id: "pipi",
              text: "Say 'mou5' to call Mama! Hum with your lips closed: mmm-mou!",
              textZh: "講「mou5」叫媽媽！閉住嘴唇哼：mmm-mou！",
              emotion: "encouraging",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch3-s2" },
          ],
        },

        // Scene 2: Mission — "mou5" (毛 hair/fur)
        {
          id: "bear-ch3-s2",
          chapter_id: "bear-ch3",
          type: "mission",
          title: "Call Mama",
          titleZh: "叫媽媽",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch3/scene2-bg.jpg",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "thinking" },
          ],

          dialogue: [],

          mission: {
            id: "bear-ch3-m1",
            type: "speech",
            target: {
              word: "毛",
              jyutping: "mou5",
              meaning: "fur",
              target_phonemes: ["/m/"],
              target_tone: "tone_5",
              target_phoneme_type: "initial",
            },
            success_criteria: {
              min_overall_accuracy: 0.6,
              min_tone_accuracy: 0.5,
              min_articulation_score: 0.6,
              max_timing_deviation_ms: 150,
              allow_low_confidence: true,
            },
            prompt: "Say 'mou5' to call Mama!",
            promptZh: "講「mou5」叫媽媽！",
            hint: "Keep your lips closed and hum: mmm-mou!",
            hintZh: "閉住嘴唇哼：mmm-mou！",
          },

          branches: [
            { condition: "success", next_scene_id: "bear-ch3-s3" },
            { condition: "almost", next_scene_id: "bear-ch3-s2-retry" },
            { condition: "needs_practice", next_scene_id: "bear-ch3-s2-hint" },
          ],

          adaptation_key: "bilabial_nasal_tone5",
        },

        // Scene 2 Retry
        {
          id: "bear-ch3-s2-retry",
          chapter_id: "bear-ch3",
          type: "dialogue",
          title: "Hum Like a Bee",
          titleZh: "好似蜜蜂咁哼",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch3/scene2-bg.jpg",
          },

          characters: [
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "encouraging" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "Hum like a bee with your lips closed: mmm-mmm-mmm. Now say 'mou5'!",
              textZh: "閉住嘴唇好似蜜蜂咁哼：mmm-mmm-mmm。然後講「mou5」！",
              emotion: "encouraging",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch3-s2" },
          ],
        },

        // Scene 2 Hint
        {
          id: "bear-ch3-s2-hint",
          chapter_id: "bear-ch3",
          type: "dialogue",
          title: "/m/ is Special",
          titleZh: "/m/ 好特別",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch3/scene2-bg.jpg",
          },

          characters: [
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "thinking" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "/m/ is special — you can hum it with your mouth closed! Try: mmm... mmm... mou5!",
              textZh: "/m/ 好特別 — 你可以閉住嘴哼出嚟！試下：mmm... mmm... mou5！",
              emotion: "thinking",
            },
          ],

          branches: [
            { condition: "always", next_scene_id: "bear-ch3-s2" },
          ],

          therapist_note: "Teaches nasal /m/ — air flows through nose, not mouth",
        },

        // Scene 3: Success + Reward
        {
          id: "bear-ch3-s3",
          chapter_id: "bear-ch3",
          type: "reward",
          title: "Mama's Here!",
          titleZh: "媽媽嚟喇！",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch3/scene3-bg.jpg",
            overlay_color: "rgba(255, 180, 200, 0.3)",
          },

          characters: [
            { id: "mama", name: "Mama Bear", nameZh: "熊媽媽", emotion: "happy" },
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "excited" },
          ],

          dialogue: [
            {
              character_id: "mama",
              text: "I heard you! Come here for a big hug!",
              textZh: "我聽到喇！過嚟俾媽媽攬住！",
              emotion: "happy",
            },
            {
              character_id: "benny",
              text: "Mama! You said 'mou5' so beautifully!",
              textZh: "媽媽！你講「mou5」講得好靚！",
              emotion: "excited",
            },
          ],

          reward: {
            type: "sticker",
            id: "bear-sticker-03",
            name: "Heart Sticker",
            nameZh: "心心貼紙",
            icon_url: "/stories/bear-adventure/rewards/heart.png",
            xp_amount: 50,
          },

          branches: [
            { condition: "always", next_scene_id: "bear-ch3-s4" },
          ],
        },

        // Scene 4: World Complete
        {
          id: "bear-ch3-s4",
          chapter_id: "bear-ch3",
          type: "finale",
          title: "Story Complete!",
          titleZh: "故事完成！",

          background: {
            type: "image",
            url: "/stories/bear-adventure/ch3/scene4-bg.jpg",
            overlay_color: "rgba(255, 215, 0, 0.5)",
          },

          characters: [
            { id: "benny", name: "Benny Bear", nameZh: "班班熊", emotion: "excited" },
            { id: "mama", name: "Mama Bear", nameZh: "熊媽媽", emotion: "happy" },
            { id: "monkey", name: "Monkey Friend", nameZh: "猴子朋友", emotion: "happy" },
            { id: "pipi", name: "PiPi Parrot", nameZh: "皮皮鸚鵡", emotion: "excited" },
          ],

          dialogue: [
            {
              character_id: "pipi",
              text: "You learned /b/, /p/, and /m/! You're a bilabial master!",
              textZh: "你學識咗 /b/、/p/、/m/！你係雙唇音大師！",
              emotion: "excited",
            },
            {
              character_id: "benny",
              text: "Thank you for playing with me! See you next time!",
              textZh: "多謝你同我玩！下次再見！",
              emotion: "excited",
            },
          ],

          reward: {
            type: "badge",
            id: "bear-badge-world",
            name: "Bilabial Master Badge",
            nameZh: "雙唇音大師徽章",
            icon_url: "/stories/bear-adventure/rewards/bilabial-master.png",
            xp_amount: 200,
          },

          branches: [],

          therapist_note: "World complete — all bilabial phonemes covered",
        },
      ],
    },
  ],

  total_missions: 3,
  total_xp: 550,
};

export default bearAdventureWorld;
