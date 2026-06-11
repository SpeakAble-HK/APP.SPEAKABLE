# Aura Journey — 10 New Interactive Stories (P1–P3)

Cantonese cinematic story prompts for the SpeakAble **Enhancement** portal, designed to drop straight into `src/enhancement/aura-journey/components/auraJourney/auraJourneyScenes.ts` and to feed the narrative-assessment rubric in `src/data/narrativeAssessment.ts`.

These continue **皮皮 (Pipi)**'s world and reuse the established cinematic look from the existing 12 chapters: warm Pixar/Disney-style 3D, soft volumetric light, shallow depth of field, gentle camera moves, child-safe palette, no on-screen text. Every story is a single self-contained chapter with one clear speech-therapy target and one Cantonese `voiceText` line the child clones.

---

## Visual style bible (use in every video prompt)

> **Global style suffix** — append to every cinematic prompt:
> *"Pixar/Disney-style 3D animated short, cinematic lighting, soft volumetric god-rays, shallow depth of field, warm child-friendly colour palette, gentle slow camera push-in, rounded friendly character designs, expressive large eyes, 4K, high detail, no text, no captions, no watermark, calm wholesome mood, 16:9."*

**Returning cast**
- **皮皮 (Pipi)** — the hero. A round cyan-and-yellow baby bird: bright yellow body and face, cyan/turquoise wings and head-crest, small orange beak, big brown expressive eyes, wears chunky cyan headphones and a small red superhero cape. Cheerful, brave, curious.
- **奧拉 (Aura)** — the gentle glowing guide. A soft luminous blue light-spirit / wisp with a calm motherly presence; bathes scenes in soft blue light. Represents listening, calm, and pacing.
- **字寶 (ZiBo)** — the "word-treasure" friend. A small living glowing Chinese-character/syllable sprite made of warm amber light blocks; helps build sounds and syllables.

---

## 5 NEW avatars (designed for this expansion)

All drawn in the same rounded Pixar style and palette family as Pipi, so they read as one world.

### 1. 嘟嘟 (DouDou) — the rhythm turtle
*Avatar reference-image prompt:* "A small round baby turtle, soft moss-green shell with glowing amber rhythm-rings, big friendly eyes, tiny drum-like patterns on its shell, wears a little conductor's bow-tie; Pixar/Disney 3D style, warm lighting, white background, character turnaround sheet."
- **Role:** keeps the beat; slow, steady, patient. **ST function:** pacing, syllable timing, turn-taking rhythm, fluency.

### 2. 露露 (LuLu) — the question fox
*Avatar reference-image prompt:* "A small fluffy fox cub, warm orange fur with cream chest, oversized curious eyes, one ear tipped with a tiny glowing question-mark spark, holding a little magnifying glass; Pixar/Disney 3D style, soft lighting, white background, character turnaround sheet."
- **Role:** always asking "邊個/做乜/點解" (who/what/why). **ST function:** WH-questions, comprehension, sequencing, narrative cause-and-effect.

### 3. 波波 (BoBo) — the feelings jellyfish
*Avatar reference-image prompt:* "A small translucent jellyfish that gently changes colour with mood (soft pink, blue, gold), gentle floating tendrils, kind smiling face, soft inner glow; Pixar/Disney 3D style, dreamy underwater lighting, white background, character turnaround sheet."
- **Role:** colour shifts with emotion. **ST function:** emotion vocabulary, internal-response / character-feeling narrative element, self-regulation.

### 4. 山山 (SaanSaan) — the echo mountain-goat kid
*Avatar reference-image prompt:* "A tiny baby mountain goat with fluffy white wool, small curly horns, rosy cheeks, wearing a little explorer's scarf, perched on a glowing rock ledge; Pixar/Disney 3D style, crisp mountain light, white background, character turnaround sheet."
- **Role:** lives on echo peaks; loves repeating sounds back. **ST function:** auditory discrimination, minimal-pair contrast, tone accuracy, repair attempts.

### 5. 圓圓 (YuenYuen) — the storyteller owl
*Avatar reference-image prompt:* "A small wise baby owl, soft lavender-grey feathers, huge gentle round glasses, holding a glowing story-scroll, tiny star-patterned wing-tips; Pixar/Disney 3D style, cosy library lighting, white background, character turnaround sheet."
- **Role:** keeper of stories; helps put events in order. **ST function:** macrostructure (story grammar: setting → event → plan → consequence → resolution), connectives, retell.

---

## How the 10 stories are tiered (P1 = build first)

| Tier | Why this priority | Stories |
|---|---|---|
| **P1 — build first** | Highest clinical reach + reuse existing rubric keys; broadest age range; introduce the two most useful new avatars (LuLu, YuenYuen). | #13, #14, #15, #16 |
| **P2 — build next** | Strong therapeutic value; introduce DouDou & BoBo; slightly more complex narrative. | #17, #18, #19 |
| **P3 — build later** | Advanced / generalisation & multi-character; richest narrative, best for older or graduating learners. | #20, #21, #22 |

Each story below is ready to paste as a new object in the `auraJourneyScenes` array (set `video` to the generated clip URL). New `adaptationKey` values are marked **(new)** — add matching `evidenceKeys` entries to the rubric where noted.

---

# ███ P1 — BUILD FIRST ███

## Story #13 — 皮皮歷險記：露露問題森林
**chapter:** 第 13 章
**title:** 皮皮歷險記：露露問題森林
**subtitle:** WH 問題、回答邊個同做乜
**therapistGoal:** 聽完情景後回答「邊個」同「做乜」，講完整句子。
**adaptationKey:** `wh_question_response` **(new)** — add to rubric `referencing` + `character` evidenceKeys
**voicePrompt:** 跟住講：露露問皮皮，邊個喺度。皮皮答：奧拉喺度。
**voiceText:** 露露問皮皮，邊個喺度。皮皮答：奧拉喺度。
**cinematicPrompt (zh):** 皮皮行入一個發光嘅問題森林，遇到新朋友——橙色小狐狸露露。露露耳朵閃住問號火花，舉起放大鏡四圍望，逐一指住樹後面嘅奧拉同字寶，問皮皮「邊個喺度？」皮皮一個一個答返。
**Cinematic video prompt (EN, for generation):**
> "A glowing enchanted forest at golden hour. Pipi the cyan-and-yellow superhero baby bird walks in and meets LuLu, a fluffy orange fox cub with a tiny glowing question-mark spark on one ear, holding a small magnifying glass. LuLu peeks behind glowing trees and points one by one at hidden friends — Aura the soft blue light-spirit and ZiBo the amber syllable-sprite — tilting her head as if asking a question. Pipi happily points back and answers each time. Soft fireflies, warm beams of light through leaves. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** macrostructure→character; microstructure→referencing. evidenceKeys: `["wh_question_response", "sentence_turn_taking"]`

---

## Story #14 — 皮皮歷險記：圓圓嘅故事卷軸
**chapter:** 第 14 章
**title:** 皮皮歷險記：圓圓嘅故事卷軸
**subtitle:** 故事次序、開頭中間結尾
**therapistGoal:** 用「先……跟住……最後……」講出三步故事次序。
**adaptationKey:** `story_sequencing` **(new)** — feeds rubric `initiating_event` + `consequence_resolution`
**voicePrompt:** 跟住講：先有風，跟住落雨，最後出彩虹。
**voiceText:** 先有風，跟住落雨，最後出彩虹。
**cinematicPrompt (zh):** 皮皮飛入一間溫暖嘅雲端圖書館，遇到戴住大圓眼鏡嘅貓頭鷹圓圓。圓圓打開一幅發光嘅故事卷軸，畫面分三格——先有風、跟住落雨、最後出彩虹。皮皮跟住卷軸一格一格指住講。
**Cinematic video prompt (EN, for generation):**
> "A cosy floating cloud-library bathed in warm lamplight. Pipi the cyan-and-yellow baby bird flies in to meet YuenYuen, a small wise baby owl with lavender-grey feathers and huge round glasses, holding a glowing story-scroll. The owl unfurls the scroll revealing three softly glowing panels in sequence — first wind bending trees, then gentle rain, finally a bright rainbow. Pipi points at each panel in turn as the story unfolds. Floating books, dust motes in golden light. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** macrostructure→initiating_event, consequence_resolution; microstructure→connective_use. evidenceKeys: `["story_sequencing", "descriptive_language"]`

---

## Story #15 — 皮皮歷險記：山山回音谷
**chapter:** 第 15 章
**title:** 皮皮歷險記：山山回音谷
**subtitle:** 聽音分辨、最小對立詞、聲調
**therapistGoal:** 聽兩個相似嘅音，分辨佢哋唔同，再準確覆述。
**adaptationKey:** `minimal_pair_discrimination` **(new)** — feeds rubric `phoneme_accuracy` + `tone_accuracy`
**voicePrompt:** 跟住講：杯同悲唔同。山山聽得好清楚。
**voiceText:** 杯同悲唔同。山山聽得好清楚。
**cinematicPrompt (zh):** 皮皮爬上一座發光嘅回音山，遇到披住探險頸巾嘅小山羊山山。山山企喺發光石台上，每次皮皮講一個音，山頭就會傳返清晰嘅回音。皮皮要聽清楚兩個相似嘅音，分辨佢哋有咩唔同。
**Cinematic video prompt (EN, for generation):**
> "A bright echoing mountain valley at clear morning light. Pipi the cyan-and-yellow baby bird climbs up to meet SaanSaan, a tiny fluffy white baby mountain goat with small curly horns and an explorer's scarf, standing on a glowing rock ledge. Each time a sound is made, visible soft sound-ripples bounce off the glowing peaks and return. SaanSaan cups an ear and listens carefully, then nods. Crisp alpine air, drifting clouds below, sparkling light on the rocks. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** intelligibility→phoneme_accuracy, tone_accuracy. evidenceKeys: `["minimal_pair_discrimination", "vowel_imitation"]`

---

## Story #16 — 皮皮歷險記：露露點解花園
**chapter:** 第 16 章
**title:** 皮皮歷險記：露露點解花園
**subtitle:** 因果關係、回答點解
**therapistGoal:** 用「因為……所以……」解釋事情點解發生。
**adaptationKey:** `cause_effect_reasoning` **(new)** — feeds rubric `internal_response` + `plan_attempt`
**voicePrompt:** 跟住講：因為落雨，所以花開得好靚。
**voiceText:** 因為落雨，所以花開得好靚。
**cinematicPrompt (zh):** 露露帶皮皮入一個會發光嘅花園，啲花識得隨住問題開合。露露指住一朵啱啱盛開嘅花問「點解？」皮皮望住天上嘅雨雲同地下嘅花，用因果句答返。
**Cinematic video prompt (EN, for generation):**
> "A magical glowing flower garden after light rain, droplets sparkling. Pipi the cyan-and-yellow baby bird walks with LuLu the curious orange fox cub. The flowers gently bloom and glow in response to curiosity. LuLu points her magnifying glass at a freshly bloomed flower and tilts her head questioningly; Pipi looks up at a soft rain-cloud, then back at the flower, and gives a satisfied nod of understanding. Rainbow mist, dewdrops, warm soft light. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** macrostructure→internal_response, plan_attempt; microstructure→connective_use. evidenceKeys: `["cause_effect_reasoning", "story_sequencing"]`

---

# ███ P2 — BUILD NEXT ███

## Story #17 — 皮皮歷險記：嘟嘟節拍橋
**chapter:** 第 17 章
**title:** 皮皮歷險記：嘟嘟節拍橋
**subtitle:** 音節拍子、流暢度、停頓
**therapistGoal:** 跟住穩定節拍講句子，控制速度同停頓。
**adaptationKey:** `pacing_fluency` **(new)** — feeds rubric `fluency_pacing`
**voicePrompt:** 跟住嘟嘟嘅節拍講：皮 — 皮 — 慢 — 慢 — 行。
**voiceText:** 皮皮慢慢行，一步一步過橋。
**cinematicPrompt (zh):** 皮皮要過一條會隨節拍發光嘅木橋，遇到綠色小烏龜嘟嘟。嘟嘟殼上嘅琥珀色節拍環一閃一閃打住拍子，皮皮要跟住穩定節拍，一個音一步咁過橋。
**Cinematic video prompt (EN, for generation):**
> "A glowing wooden rope-bridge over a soft misty canyon. Pipi the cyan-and-yellow baby bird meets DouDou, a small round baby turtle with a moss-green shell ringed with glowing amber rhythm-bands and a tiny conductor's bow-tie. The amber rings pulse a steady gentle beat, and each plank of the bridge lights up in time. Pipi steps forward one beat at a time, balanced and calm. Fireflies, warm dusk light, gentle sway of the bridge. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** intelligibility→fluency_pacing. evidenceKeys: `["pacing_fluency", "syllable_segmentation"]`

---

## Story #18 — 皮皮歷險記：波波心情海
**chapter:** 第 18 章
**title:** 皮皮歷險記：波波心情海
**subtitle:** 情緒詞彙、角色感受
**therapistGoal:** 講出角色嘅感受，用「皮皮覺得……」表達情緒。
**adaptationKey:** `emotion_vocabulary` **(new)** — feeds rubric `internal_response` + `semantic_vocabulary`
**voicePrompt:** 跟住講：皮皮覺得開心。波波變咗金色。
**voiceText:** 皮皮覺得開心。波波變咗金色。
**cinematicPrompt (zh):** 皮皮潛入一個夢幻嘅心情海，遇到會隨情緒變色嘅水母波波。波波開心會變金色、平靜變藍色。皮皮望住波波變色，講出唔同嘅感受。
**Cinematic video prompt (EN, for generation):**
> "A dreamy glowing underwater sea, soft beams of light from the surface. Pipi the cyan-and-yellow baby bird (in a cute bubble helmet) floats beside BoBo, a small translucent jellyfish whose soft glow shifts colour with mood — gentle gold for happy, calm blue for peaceful, soft pink for shy. As BoBo changes colour, Pipi reacts with matching expressions. Drifting bubbles, gentle currents, bioluminescent plants, dreamy calm mood. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** macrostructure→internal_response; microstructure→semantic_vocabulary. evidenceKeys: `["emotion_vocabulary", "descriptive_language"]`

---

## Story #19 — 皮皮歷險記：圓圓接龍洞
**chapter:** 第 19 章
**title:** 皮皮歷險記：圓圓接龍洞
**subtitle:** 連接詞、句子擴展
**therapistGoal:** 用連接詞「同埋／但係／然後」將兩個諗法接埋一齊。
**adaptationKey:** `connective_expansion` **(new)** — feeds rubric `connective_use` + `syntactic_complexity`
**voicePrompt:** 跟住講：皮皮見到星，然後星星眨吓眼。
**voiceText:** 皮皮見到星，然後星星眨吓眼。
**cinematicPrompt (zh):** 皮皮同圓圓行入一個發光嘅水晶洞，洞入面啲句子石頭要用連接詞先砌得埋一齊。圓圓每讀一句，兩舊發光石就會接埋變成更長嘅句子。
**Cinematic video prompt (EN, for generation):**
> "A glowing crystal cave with floating luminous sentence-stones. Pipi the cyan-and-yellow baby bird walks with YuenYuen the lavender-grey owl in round glasses, holding a glowing scroll. Two softly glowing stones drift together and magically link into a longer connected stone whenever a phrase is spoken. Soft prism light refracting through crystals, warm magical glow, gentle floating motion. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** microstructure→connective_use, syntactic_complexity. evidenceKeys: `["connective_expansion", "story_sequencing"]`

---

# ███ P3 — BUILD LATER ███

## Story #20 — 皮皮歷險記：山山修正瀑布
**chapter:** 第 20 章
**title:** 皮皮歷險記：山山修正瀑布
**subtitle:** 自我修正、再試一次、聲調準確
**therapistGoal:** 聽到自己講錯，主動停低再講一次正確嘅音同聲調。
**adaptationKey:** `self_repair_tone` **(new)** — feeds rubric `tone_accuracy` + reuse `repair_attempts`
**voicePrompt:** 跟住講：我講錯咗聲調，停一停，再講啱一次。
**voiceText:** 我講錯咗聲調，停一停，再講啱一次。
**cinematicPrompt (zh):** 皮皮同山山去到一條會聽聲嘅發光瀑布，講啱音瀑布就會變清亮，講錯就會閃黃燈提醒。皮皮學識聽到提醒就停低，慢慢再講一次。
**Cinematic video prompt (EN, for generation):**
> "A luminous waterfall in a lush green gorge, mist catching rainbow light. Pipi the cyan-and-yellow baby bird stands with SaanSaan the fluffy white baby goat on a glowing ledge beside the falls. When sounds are correct the waterfall glows bright and clear; when there's a slip, a gentle amber shimmer signals to pause. Pipi pauses thoughtfully, takes a breath, and the water clears to bright cyan. Spray, ferns, dappled sunlight, encouraging hopeful mood. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** intelligibility→tone_accuracy; macrostructure→repair (self-monitoring). evidenceKeys: `["self_repair_tone", "repair_attempts"]`

---

## Story #21 — 皮皮歷險記：大家嘅故事劇場
**chapter:** 第 21 章
**title:** 皮皮歷險記：大家嘅故事劇場
**subtitle:** 完整故事複述、多角色、泛化
**therapistGoal:** 用設定→事件→計劃→結果四步，複述一個完整短故事。
**adaptationKey:** `full_narrative_retell` **(new)** — feeds rubric ALL macrostructure elements
**voicePrompt:** 跟住講：皮皮想過河，搵到一條船，最後安全到對面。
**voiceText:** 皮皮想過河，搵到一條船，最後安全到對面。
**cinematicPrompt (zh):** 所有朋友——奧拉、字寶、露露、嘟嘟、波波、山山、圓圓——一齊喺一個發光小劇場，皮皮企喺舞台中央，用完整故事四步講返成個歷險。每講一步，背景就變出對應嘅佈景。
**Cinematic video prompt (EN, for generation):**
> "A warm glowing little theatre with a soft-lit stage. Pipi the cyan-and-yellow superhero baby bird stands centre-stage. In the audience and around the stage are all the friends together — Aura the blue light-spirit, ZiBo the amber syllable-sprite, LuLu the orange fox, DouDou the green turtle, BoBo the colour-shifting jellyfish, SaanSaan the white goat, and YuenYuen the lavender owl. As the story is told, the stage backdrop magically transforms scene by scene — a river, a little boat, the far bank. Curtain glow, spotlights, confetti sparkles, joyful proud mood. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** macrostructure→ALL (character, setting, initiating_event, plan_attempt, consequence_resolution). evidenceKeys: `["full_narrative_retell", "story_sequencing", "connective_expansion"]`

---

## Story #22 — 皮皮歷險記：星空畢業夜
**chapter:** 第 22 章
**title:** 皮皮歷險記：星空畢業夜
**subtitle:** 總複習、自信表達、家居泛化
**therapistGoal:** 自信咁用自己嘅說話，分享學到嘅技巧，帶返屋企練。
**adaptationKey:** `confident_generalisation` **(new)** — reuse rubric `home_practice_transfer`
**voicePrompt:** 跟住講：我學識咗聽、講、等同再試一次。我會帶返屋企練。
**voiceText:** 我學識咗聽、講、等同再試一次。我會帶返屋企練。
**cinematicPrompt (zh):** 喺一個滿天星嘅夜晚，皮皮同所有朋友坐喺發光山頂。奧拉用藍光喺天上畫出皮皮成個旅程嘅星座，皮皮自信咁同大家分享自己學到嘅嘢，然後一齊望向屋企方向嘅燈火。
**Cinematic video prompt (EN, for generation):**
> "A breathtaking starry night on a glowing hilltop. Pipi the cyan-and-yellow superhero baby bird sits with all the friends — Aura, ZiBo, LuLu, DouDou, BoBo, SaanSaan and YuenYuen. Aura paints soft blue constellations across the sky retracing Pipi's whole journey. Pipi stands proudly and gestures to the stars, then everyone looks toward distant warm home-lights twinkling in a valley below. Shooting stars, gentle aurora, fireflies, heartfelt hopeful graduation mood. [GLOBAL STYLE SUFFIX]"

**Rubric mapping:** macrostructure→consequence_resolution; intelligibility→fluency_pacing; transfer. evidenceKeys: `["confident_generalisation", "home_practice_transfer"]`

---

## New `adaptationKey` values to register

Add these to the rubric's `evidenceKeys` arrays in `src/data/narrativeAssessment.ts` so the new stories auto-suggest scores:

| adaptationKey | Suggested rubric element(s) |
|---|---|
| `wh_question_response` | referencing, character |
| `story_sequencing` | initiating_event, consequence_resolution, connective_use |
| `minimal_pair_discrimination` | phoneme_accuracy, tone_accuracy |
| `cause_effect_reasoning` | internal_response, plan_attempt |
| `pacing_fluency` | fluency_pacing |
| `emotion_vocabulary` | internal_response, semantic_vocabulary |
| `connective_expansion` | connective_use, syntactic_complexity |
| `self_repair_tone` | tone_accuracy (+ existing repair_attempts) |
| `full_narrative_retell` | all macrostructure elements |
| `confident_generalisation` | (reuse home_practice_transfer) |

---

## Build order summary

- **P1 (first):** #13 露露問題森林 · #14 圓圓嘅故事卷軸 · #15 山山回音谷 · #16 露露點解花園
- **P2 (next):** #17 嘟嘟節拍橋 · #18 波波心情海 · #19 圓圓接龍洞
- **P3 (later):** #20 山山修正瀑布 · #21 大家嘅故事劇場 · #22 星空畢業夜

All 10 chapters extend the existing `AuraJourneyScene` schema exactly (chapter, title, subtitle, therapistGoal, cinematicPrompt, voicePrompt, adaptationKey, voiceText, video), so they paste directly after 第 12 章 once each video is generated.
