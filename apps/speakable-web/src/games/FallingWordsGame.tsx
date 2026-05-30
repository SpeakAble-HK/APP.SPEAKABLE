import React, { useState, useRef, useEffect } from "react";
import { useCantoneseAsr } from "@speakable/voice";
import { ttsPlay, ttsCancel } from "@speakable/voice/tts";

const TARGET_WORD = "部苜";
const SPAWN_INTERVAL = 2000; // ms
const FALL_SPEED = 2; // px per frame
const WORD_SIZE = 60; // px

function getRandomX() {
  return Math.random() * 80 + 10; // 10% to 90% of width
}

export default function FallingWordsGame() {
  const [words, setWords] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [slicedWordId, setSlicedWordId] = useState(null);
  const gameRef = useRef();
  const swipePath = useRef([]);
  const asr = useCantoneseAsr({
    locale: "yue-Hant-HK",
    asrProfile: "cantonese-hk",
    grammarHints: [TARGET_WORD],
    returnJyutping: true,
  });

  // Spawn new words
  useEffect(() => {
    const interval = setInterval(() => {
      setWords(ws => [
        ...ws,
        { id: Date.now(), x: getRandomX(), y: 0, text: TARGET_WORD }
      ]);
    }, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Animate falling
  useEffect(() => {
    let frame;
    function animate() {
      setWords(ws =>
        ws
          .map(w => ({ ...w, y: w.y + FALL_SPEED }))
          .filter(w => w.y < 90) // Remove if off screen (90% height)
      );
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Play TTS when a new word appears
  useEffect(() => {
    if (words.length > 0) {
      ttsPlay(TARGET_WORD);
    }
    return () => ttsCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.length]);

  // ASR: check if user said 部苜
  useEffect(() => {
    if (asr.final) {
      if (asr.final.hanzi === TARGET_WORD) {
        setFeedback("正確！你斬中咗部苜！");
        ttsPlay("正確！你斬中咗部苜！");
        // Remove the lowest word (simulate slicing by voice)
        setWords(ws => ws.length > 0 ? ws.slice(1) : ws);
        setScore(s => s + 1);
      } else {
        setFeedback("唔係部苜，再試一次！");
        ttsPlay("唔係部苜，再試一次！");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asr.final]);

  // Swipe detection
  function onPointerDown(e) {
    swipePath.current = [{ x: e.clientX, y: e.clientY }];
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }
  function onPointerMove(e) {
    swipePath.current.push({ x: e.clientX, y: e.clientY });
  }
  function onPointerUp() {
    // Check collision with any word
    setWords(ws => {
      let hitId = null;
      const newWords = ws.filter(w => {
        const wordBox = {
          left: (w.x / 100) * gameRef.current.offsetWidth,
          top: (w.y / 100) * gameRef.current.offsetHeight,
          right: (w.x / 100) * gameRef.current.offsetWidth + WORD_SIZE,
          bottom: (w.y / 100) * gameRef.current.offsetHeight + WORD_SIZE
        };
        for (const p of swipePath.current) {
          if (
            p.x >= wordBox.left &&
            p.x <= wordBox.right &&
            p.y >= wordBox.top &&
            p.y <= wordBox.bottom
          ) {
            hitId = w.id;
            return false; // Remove word
          }
        }
        return true;
      });
      if (hitId) {
        setScore(s => s + 1);
        setFeedback("斬中咗部苜！");
        ttsPlay("斬中咗部苜！");
        setSlicedWordId(hitId);
        setTimeout(() => setSlicedWordId(null), 400);
      }
      return newWords;
    });
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }

  // CSS for animation and slice effect
  // You can move this to a CSS/SCSS file if preferred
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .falling-word {
        transition: box-shadow 0.2s, transform 0.2s;
        box-shadow: 0 2px 8px #bbb;
        background: #ffe066;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        user-select: none;
        width: ${WORD_SIZE}px;
        height: ${WORD_SIZE}px;
        position: absolute;
        will-change: transform;
      }
      .falling-word.sliced {
        background: #ff7675;
        box-shadow: 0 0 24px #ff7675;
        transform: scale(1.2) rotate(-20deg);
        opacity: 0.7;
        transition: all 0.3s;
      }
      .falling-word.animate {
        animation: bounce 0.5s;
      }
      @keyframes bounce {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div
      ref={gameRef}
      style={{ width: 400, height: 600, border: "1px solid #ccc", position: "relative", overflow: "hidden", background: "#f8f9fa" }}
      onPointerDown={onPointerDown}
    >
      {words.map(w => (
        <div
          key={w.id}
          className={
            "falling-word" +
            (slicedWordId === w.id ? " sliced" : "")
          }
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            zIndex: slicedWordId === w.id ? 2 : 1
          }}
        >
          {w.text}
        </div>
      ))}
      <div style={{ position: "absolute", top: 10, left: 10, fontWeight: 600 }}>Score: {score}</div>
      <div style={{ position: "absolute", bottom: 10, left: 10, color: "#333", fontWeight: 500 }}>{feedback}</div>
    </div>
  );
}
