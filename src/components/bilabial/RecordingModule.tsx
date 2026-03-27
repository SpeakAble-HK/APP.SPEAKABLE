import { useRef, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { toast } from "sonner";

interface RecordingModuleProps {
  disabled?: boolean;
  onRecorded: (blob: Blob, objectUrl: string) => void;
  onClear?: () => void;
  prompt?: string;
}

export function RecordingModule({
  disabled,
  onRecorded,
  onClear,
  prompt = "按住錄音，讀出目標字詞",
}: RecordingModuleProps) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        onRecorded(blob, url);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      toast.error("無法使用麥克風");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const clear = () => {
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onClear?.();
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-center text-sm font-bold text-on-surface">{prompt}</p>

      {!recording && !audioUrl && (
        <button
          type="button"
          disabled={disabled}
          onClick={startRecording}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-error text-on-error shadow-xl shadow-error/30 transition-all hover:bg-error/90 active:scale-95 disabled:opacity-40"
          aria-label="開始錄音"
        >
          <MaterialIcon icon="mic" className="text-5xl" />
        </button>
      )}

      {recording && (
        <button
          type="button"
          onClick={stopRecording}
          className="flex h-28 w-28 animate-pulse items-center justify-center rounded-full bg-error text-on-error shadow-xl shadow-error/30 active:scale-95"
          aria-label="停止錄音"
        >
          <MaterialIcon icon="stop" className="text-5xl" />
        </button>
      )}

      {!recording && audioUrl && (
        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <audio src={audioUrl} controls className="w-full" />
          <button
            type="button"
            disabled={disabled}
            onClick={clear}
            className="rounded-xl border-2 border-outline-variant px-4 py-2 text-sm font-bold text-on-surface"
          >
            重新錄製
          </button>
        </div>
      )}

      {recording && <p className="text-sm font-bold text-error">錄音中⋯ 再按停止</p>}
    </div>
  );
}
