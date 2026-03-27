import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Play, Loader2, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BrandHeader } from "@/components/BrandHeader";
import { useLazySoundAPI } from "@/hooks/useLazySoundAPI";
import { lazySoundCategories } from "@/data/lazySoundTests";
import { parseJyutping } from "@/utils/jyutpingParser";
import mascot from "@/assets/pipi-mascot.png";

const CONFIDENCE_THRESHOLD = 0.5;

export default function LazySoundPage() {
  const navigate = useNavigate();
  const { analyze, isProcessing, intendedPhonemes, spokenPhonemes, error } = useLazySoundAPI();

  const [activeTab, setActiveTab] = useState(lazySoundCategories[0].id);
  const [customText, setCustomText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const activeCategory = lazySoundCategories.find(c => c.id === activeTab);
  const isCustom = activeTab === "custom";

  const getTestText = (): string => {
    if (isCustom) return customText.trim();
    if (!activeCategory) return "";
    return activeCategory.words.map(w => w.character).join("");
  };

  const canRecord = isCustom || !!getTestText();

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordingStartRef.current = Date.now();
      setAudioDuration(0);
      setHasResults(false);

      intervalRef.current = setInterval(() => {
        setAudioDuration((Date.now() - recordingStartRef.current) / 1000);
      }, 100);

      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        stream.getTracks().forEach(t => t.stop());
        setAudioStream(null);

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        setRecordingUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      console.error("Mic access denied");
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handlePlayback = () => {
    if (!recordingUrl) return;
    if (isPlaying) {
      audioElRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(recordingUrl);
    audioElRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    const text = getTestText();
    // For custom mode without text, pass empty string — hook will do ASR-only
    const result = await analyze(audioBlob, text || "");
    if (result) setHasResults(true);
  };

  const handleReset = () => {
    setAudioBlob(null);
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setHasResults(false);
    setAudioDuration(0);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Parse results for display
  const getResultRows = () => {
    return intendedPhonemes
      .filter(p => p.phoneme !== null)
      .map((intended, i) => {
        const spoken = spokenPhonemes[i];
        const intParsed = parseJyutping(intended.phoneme);
        const spkParsed = spoken ? parseJyutping(spoken.phoneme) : { initial: null, final: null, tone: null };

        const initialMatch = intParsed.initial === spkParsed.initial;
        const finalMatch = intParsed.final === spkParsed.final;
        const toneMatch = intParsed.tone === spkParsed.tone;

        const jyOk = (intended.jyConf ?? 1) >= CONFIDENCE_THRESHOLD;
        const toneOk = (intended.toneConf ?? 1) >= CONFIDENCE_THRESHOLD;

        return {
          character: intended.character,
          expected: intended.phoneme,
          spoken: spoken?.phoneme ?? "—",
          initialOk: initialMatch && jyOk,
          finalOk: finalMatch && jyOk,
          toneOk: toneMatch && toneOk,
          intParsed,
          spkParsed,
          confidence: intended.confidence,
        };
      });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      <BrandHeader />

      {/* Header */}
      <div className="pt-20 pb-6 px-4 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary font-medium mb-4 hover:underline">
            <MaterialIcon icon="arrow_back" className="text-lg" /> 返回
          </button>
          <div className="flex items-center gap-3 mb-2">
            <img src={mascot} alt="" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="font-headline text-2xl font-extrabold">懶音檢測</h1>
              <p className="text-sm text-on-surface-variant">錄音即測，即時分析你嘅發音</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-24 space-y-6">
        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); handleReset(); }}>
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
            {lazySoundCategories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="flex-1 min-w-[80px] text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MaterialIcon icon={cat.icon} className="text-sm mr-1" />
                {cat.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="custom" className="flex-1 min-w-[80px] text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MaterialIcon icon="edit" className="text-sm mr-1" />
              自由輸入
            </TabsTrigger>
          </TabsList>

          {/* Category content */}
          {lazySoundCategories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="mt-4">
              <div className="glass-card rounded-xl p-5 border border-white/40 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{cat.confusionPair}</span>
                  <span className="text-sm text-on-surface-variant">{cat.description}</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-3">請讀出以下所有字：</p>
                <div className="flex flex-wrap gap-2">
                  {cat.words.map((w) => (
                    <div key={w.character + w.jyutping} className="bg-primary-container/20 rounded-lg px-4 py-3 text-center min-w-[60px]">
                      <span className="text-2xl font-bold text-on-surface block">{w.character}</span>
                      <span className="text-xs text-on-surface-variant">{w.jyutping}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}

          <TabsContent value="custom" className="mt-4">
            <div className="glass-card rounded-xl p-5 border border-white/40 shadow-card">
              <p className="text-sm text-on-surface-variant mb-3">輸入你想測試的字詞或句子（可選）：</p>
              <Textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="例如：你好，我叫皮皮（留空則只顯示語音辨識結果）"
                className="min-h-[80px] text-lg"
                maxLength={50}
              />
              <p className="text-xs text-on-surface-variant mt-1 text-right">{customText.length}/50</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recording Controls */}
        <div className="glass-card rounded-xl p-6 border border-white/40 shadow-card text-center space-y-4">
          {!audioBlob ? (
            <>
              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                  <span className="font-mono text-lg">{formatDuration(audioDuration)}</span>
                </div>
              )}
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="w-20 h-20 rounded-full shadow-lg"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={!canRecord}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
              <p className="text-sm text-on-surface-variant">
                {isRecording ? "點擊停止錄音" : canRecord ? "點擊開始錄音" : "請先選擇測試內容"}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={handlePlayback}>
                  {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {isPlaying ? "暫停" : "播放"}
                </Button>
                <span className="text-sm text-on-surface-variant font-mono">{formatDuration(audioDuration)}</span>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <MaterialIcon icon="refresh" className="text-lg mr-1" /> 重錄
                </Button>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isProcessing}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 分析中...</>
                ) : (
                  <><MaterialIcon icon="analytics" className="mr-2" /> 開始分析</>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm flex items-center gap-2">
            <MaterialIcon icon="error" /> {error}
          </div>
        )}

        {/* Results */}
        {hasResults && (intendedPhonemes.length > 0 || spokenPhonemes.length > 0) && (
          <div className="glass-card rounded-xl p-5 border border-white/40 shadow-card space-y-4">
            <h2 className="font-headline text-lg font-bold flex items-center gap-2">
              <MaterialIcon icon="fact_check" filled className="text-primary" />
              分析結果
            </h2>

            {intendedPhonemes.length > 0 ? (
              <>
                {/* Summary */}
                {(() => {
                  const rows = getResultRows();
                  const total = rows.length;
                  const correct = rows.filter(r => r.initialOk && r.finalOk && r.toneOk).length;
                  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                  return (
                    <div className="flex items-center gap-4 bg-muted/30 rounded-lg p-4">
                      <div className={`text-3xl font-extrabold ${pct >= 80 ? "text-success" : pct >= 50 ? "text-accent" : "text-destructive"}`}>
                        {pct}%
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{correct}/{total} 字正確</p>
                        <p className="text-xs text-on-surface-variant">
                          {pct >= 80 ? "做得好！發音非常準確 👍" : pct >= 50 ? "唔錯，可以再加油 💪" : "繼續練習，你會進步嘅！🌟"}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Detail table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="py-2 px-2 text-left text-on-surface-variant font-medium">字</th>
                        <th className="py-2 px-2 text-center text-on-surface-variant font-medium">目標</th>
                        <th className="py-2 px-2 text-center text-on-surface-variant font-medium">聲母</th>
                        <th className="py-2 px-2 text-center text-on-surface-variant font-medium">韻母</th>
                        <th className="py-2 px-2 text-center text-on-surface-variant font-medium">聲調</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getResultRows().map((row, i) => (
                        <tr key={i} className="border-b border-outline-variant/10">
                          <td className="py-3 px-2 font-bold text-lg">{row.character}</td>
                          <td className="py-3 px-2 text-center text-on-surface-variant">{row.expected}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${row.initialOk ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                              {row.intParsed.initial ?? "∅"}
                              {!row.initialOk && row.spkParsed.initial !== null && (
                                <span className="text-[10px]">→{row.spkParsed.initial}</span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${row.finalOk ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                              {row.intParsed.final ?? "—"}
                              {!row.finalOk && row.spkParsed.final !== null && (
                                <span className="text-[10px]">→{row.spkParsed.final}</span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${row.toneOk ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                              {row.intParsed.tone ?? "—"}
                              {!row.toneOk && row.spkParsed.tone !== null && (
                                <span className="text-[10px]">→{row.spkParsed.tone}</span>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Lazy sound tips */}
                {!isCustom && activeCategory && (() => {
                  const rows = getResultRows();
                  const wrongInitials = rows.filter(r => !r.initialOk);
                  if (wrongInitials.length === 0) return null;
                  return (
                    <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                      <h3 className="font-bold text-sm text-accent-foreground mb-2 flex items-center gap-1">
                        <MaterialIcon icon="lightbulb" filled className="text-accent" />
                        懶音提示
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        你可能混淆咗 <span className="font-bold text-on-surface">{activeCategory.confusionPair}</span>。
                        留意以下字嘅聲母：
                        {wrongInitials.map(r => ` 「${r.character}」`).join("、")}。
                        試下再讀慢啲，注意嘴型同送氣嘅分別。
                      </p>
                    </div>
                  );
                })()}
              </>
            ) : (
              /* ASR-only mode: show what was recognized */
              <div className="space-y-3">
                <p className="text-sm text-on-surface-variant">語音辨識結果：</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="py-2 px-2 text-left text-on-surface-variant font-medium">字</th>
                        <th className="py-2 px-2 text-center text-on-surface-variant font-medium">粵拼</th>
                        <th className="py-2 px-2 text-center text-on-surface-variant font-medium">聲母</th>
                        <th className="py-2 px-2 text-center text-on-surface-variant font-medium">韻母</th>
                        <th className="py-2 px-2 text-center text-on-surface-variant font-medium">聲調</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spokenPhonemes.filter(p => p.phoneme !== null).map((p, i) => {
                        const parsed = parseJyutping(p.phoneme);
                        return (
                          <tr key={i} className="border-b border-outline-variant/10">
                            <td className="py-3 px-2 font-bold text-lg">{p.character}</td>
                            <td className="py-3 px-2 text-center text-on-surface-variant">{p.phoneme}</td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                {parsed.initial ?? "∅"}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                {parsed.final ?? "—"}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                {parsed.tone ?? "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-on-surface-variant">💡 輸入文字後再錄音，可以獲得更詳細嘅對比分析。</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
