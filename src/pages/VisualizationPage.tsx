import { Link } from "react-router-dom";
import { ArrowLeft, Mic, Square, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

// Vowel positions mapped to the vowel trapezoid
const vowelPositions: Record<string, { x: number; y: number; label: string }> = {
  "i": { x: 20, y: 15, label: "i" },
  "ɪ": { x: 30, y: 25, label: "ɪ" },
  "e": { x: 25, y: 35, label: "e" },
  "ɛ": { x: 35, y: 45, label: "ɛ" },
  "æ": { x: 40, y: 60, label: "æ" },
  "a": { x: 55, y: 75, label: "a" },
  "ɑ": { x: 70, y: 80, label: "ɑ" },
  "ɔ": { x: 75, y: 65, label: "ɔ" },
  "o": { x: 80, y: 45, label: "o" },
  "ʊ": { x: 75, y: 30, label: "ʊ" },
  "u": { x: 85, y: 18, label: "u" },
  "ʌ": { x: 65, y: 55, label: "ʌ" },
  "ə": { x: 55, y: 50, label: "ə" },
  "ɜ": { x: 50, y: 42, label: "ɜ" },
};

const VisualizationPage = () => {
  const [selectedVowel, setSelectedVowel] = useState<string | null>("æ");
  const [userVowel] = useState<{ x: number; y: number } | null>({ x: 42, y: 58 });
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecording(true);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlayRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // Convert vowel chart coordinates to SVG coordinates within the oral cavity
  const toSvgCoords = (x: number, y: number) => {
    const svgX = 130 + (x / 100) * 140;
    const svgY = 120 + (y / 100) * 100;
    return { svgX, svgY };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            Vowel Position Visualization
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            See where vowels are produced in the vocal tract
          </p>
          
          <div className="grid md:grid-cols-[1fr,280px] gap-8 items-start">
            {/* Sagittal Diagram */}
            <div className="bg-muted/50 rounded-xl p-4">
              <svg
                viewBox="0 0 450 400"
                className="w-full max-w-lg mx-auto"
              >
                {/* Background */}
                <rect x="0" y="0" width="450" height="400" fill="hsl(var(--muted) / 0.3)" />
                
                {/* Head outline - back of head and neck */}
                <path
                  d="M 380 30
                     C 420 30, 440 80, 440 130
                     L 440 380
                     L 320 380
                     L 320 340
                     C 320 300, 340 280, 340 250"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Top of head */}
                <path
                  d="M 100 30
                     C 200 10, 300 10, 380 30"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Nasal cavity - upper chamber */}
                <path
                  d="M 100 30
                     L 100 70
                     C 100 90, 120 100, 140 100
                     L 280 100
                     C 300 100, 320 90, 320 70
                     L 320 50
                     C 320 35, 300 30, 280 30"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Nose bridge and tip */}
                <path
                  d="M 100 30
                     L 80 60
                     L 60 100
                     C 50 120, 40 140, 50 160
                     L 70 170
                     L 90 165"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Nostril */}
                <ellipse
                  cx="75"
                  cy="155"
                  rx="8"
                  ry="5"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Upper lip */}
                <path
                  d="M 90 165
                     C 85 175, 75 185, 85 195
                     L 110 195"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Lower lip */}
                <path
                  d="M 110 210
                     L 85 210
                     C 70 210, 65 230, 80 245
                     L 100 255"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Upper teeth */}
                <rect
                  x="105"
                  y="190"
                  width="12"
                  height="18"
                  rx="2"
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Lower teeth */}
                <rect
                  x="105"
                  y="210"
                  width="12"
                  height="15"
                  rx="2"
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Hard palate */}
                <path
                  d="M 120 120
                     C 150 115, 220 115, 280 125"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Soft palate (velum) */}
                <path
                  d="M 280 125
                     C 310 130, 330 150, 320 180
                     C 315 200, 295 210, 280 200"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Uvula */}
                <path
                  d="M 280 200
                     C 275 210, 280 225, 290 230
                     C 295 232, 300 228, 298 220
                     C 296 212, 290 205, 285 200"
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Tongue - main body */}
                <path
                  d="M 115 230
                     C 130 210, 160 180, 220 175
                     C 280 170, 310 200, 300 240
                     C 290 280, 250 310, 180 310
                     C 130 310, 100 280, 100 260
                     L 115 230"
                  fill="hsl(172 50% 80%)"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Pharynx wall (back of throat) */}
                <path
                  d="M 340 250
                     C 340 280, 350 320, 340 360
                     L 320 380"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Epiglottis */}
                <path
                  d="M 290 265
                     C 300 250, 320 255, 315 275
                     C 312 290, 295 300, 285 290
                     C 280 285, 285 270, 290 265"
                  fill="hsl(172 50% 85%)"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Larynx / voice box */}
                <path
                  d="M 260 330
                     L 240 360
                     L 240 385
                     L 300 385
                     L 300 360
                     L 280 330
                     Z"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Larynx internal structure */}
                <path
                  d="M 255 345 L 270 355 L 285 345"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1"
                />
                <path
                  d="M 250 360 L 270 370 L 290 360"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1"
                />

                {/* Trachea hint */}
                <path
                  d="M 255 385 L 255 400"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />
                <path
                  d="M 285 385 L 285 400"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Vowel positions */}
                {Object.entries(vowelPositions).map(([key, pos]) => {
                  const { svgX, svgY } = toSvgCoords(pos.x, pos.y);
                  const isSelected = selectedVowel === key;
                  return (
                    <g key={key} className="cursor-pointer" onClick={() => setSelectedVowel(key)}>
                      <circle
                        cx={svgX}
                        cy={svgY}
                        r={12}
                        fill="hsl(var(--muted))"
                        stroke="hsl(var(--foreground))"
                        strokeWidth={1.5}
                        className="transition-all duration-200"
                      />
                      <text
                        x={svgX}
                        y={svgY + 5}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="500"
                        fill="hsl(var(--foreground))"
                        className="pointer-events-none select-none"
                      >
                        {pos.label}
                      </text>
                      {isSelected && (
                        <circle
                          cx={svgX}
                          cy={svgY}
                          r={16}
                          fill="hsl(var(--primary))"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          className="transition-all duration-200"
                        />
                      )}
                      {isSelected && (
                        <text
                          x={svgX}
                          y={svgY + 5}
                          textAnchor="middle"
                          fontSize={13}
                          fontWeight="600"
                          fill="hsl(var(--primary-foreground))"
                          className="pointer-events-none select-none"
                        >
                          {pos.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* User's vowel position (highlighted in red) */}
                {userVowel && (
                  <g>
                    {/* Outer pulsing ring */}
                    <circle
                      cx={130 + (userVowel.x / 100) * 140}
                      cy={120 + (userVowel.y / 100) * 100}
                      r={22}
                      fill="none"
                      stroke="hsl(0 70% 55%)"
                      strokeWidth={2}
                      opacity={0.5}
                      className="animate-ping"
                    />
                    {/* Main ring */}
                    <circle
                      cx={130 + (userVowel.x / 100) * 140}
                      cy={120 + (userVowel.y / 100) * 100}
                      r={18}
                      fill="hsl(0 70% 55% / 0.15)"
                      stroke="hsl(0 70% 55%)"
                      strokeWidth={2.5}
                    />
                    {/* Center dot */}
                    <circle
                      cx={130 + (userVowel.x / 100) * 140}
                      cy={120 + (userVowel.y / 100) * 100}
                      r={6}
                      fill="hsl(0 70% 55%)"
                    />
                    {/* Label */}
                    <text
                      x={130 + (userVowel.x / 100) * 140 - 45}
                      y={120 + (userVowel.y / 100) * 100 - 5}
                      fontSize={11}
                      fontWeight="600"
                      fill="hsl(0 70% 45%)"
                    >
                      Your vowel
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Control panel */}
            <div className="space-y-6">
              {/* Recording controls */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Record Your Voice</h3>
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <Button
                      onClick={handleStartRecording}
                      className="gap-2"
                      variant="default"
                    >
                      <Mic className="h-4 w-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopRecording}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  )}
                  {hasRecording && !isRecording && (
                    <Button
                      onClick={handlePlayRecording}
                      variant="outline"
                      size="icon"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {isRecording && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
                    Recording...
                  </div>
                )}
                {hasRecording && !isRecording && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Recording saved. Click play to listen.
                  </p>
                )}
              </div>

              {/* Vowel selector panel */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Select Vowel</h3>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(vowelPositions).map(([key, pos]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedVowel(key)}
                      className={`w-11 h-11 rounded-lg text-lg font-medium transition-all ${
                        selectedVowel === key
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground mb-3">Legend</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-primary"></span>
                      <span className="text-muted-foreground">Target vowel</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-[hsl(0_70%_55%)]"></span>
                      <span className="text-muted-foreground">Your pronunciation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;
