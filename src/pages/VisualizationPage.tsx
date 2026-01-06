import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Vowel positions mapped to approximate tongue positions in the mouth
// x: front (0) to back (100), y: high (0) to low (100)
const vowelPositions: Record<string, { x: number; y: number; label: string }> = {
  "i": { x: 15, y: 10, label: "i" },
  "ɪ": { x: 25, y: 18, label: "ɪ" },
  "e": { x: 20, y: 30, label: "e" },
  "ɛ": { x: 30, y: 42, label: "ɛ" },
  "æ": { x: 35, y: 55, label: "æ" },
  "a": { x: 50, y: 70, label: "a" },
  "ɑ": { x: 70, y: 75, label: "ɑ" },
  "ɔ": { x: 75, y: 55, label: "ɔ" },
  "o": { x: 80, y: 35, label: "o" },
  "ʊ": { x: 75, y: 22, label: "ʊ" },
  "u": { x: 85, y: 12, label: "u" },
  "ʌ": { x: 60, y: 50, label: "ʌ" },
  "ə": { x: 50, y: 45, label: "ə" },
  "ɜ": { x: 45, y: 40, label: "ɜ" },
};

const VisualizationPage = () => {
  const [selectedVowel, setSelectedVowel] = useState<string | null>("ɛ");
  const [userVowel, setUserVowel] = useState<{ x: number; y: number } | null>({ x: 38, y: 48 });

  // Convert vowel chart coordinates to SVG coordinates within the mouth cavity
  const toSvgCoords = (x: number, y: number) => {
    // Map to the mouth cavity area (roughly 120-220 x, 80-180 y in SVG space)
    const svgX = 120 + (x / 100) * 100;
    const svgY = 80 + (y / 100) * 100;
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
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            Vowel Position Visualization
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            See where vowels are produced in the vocal tract
          </p>
          
          <div className="grid md:grid-cols-[1fr,auto] gap-8 items-start">
            {/* Sagittal Diagram */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <svg
                viewBox="0 0 350 320"
                className="w-full max-w-md mx-auto"
                style={{ background: "hsl(var(--muted))" }}
              >
                {/* Head outline - sagittal cross-section */}
                <path
                  d="M 280 20 
                     C 320 20, 340 60, 340 100
                     L 340 280
                     C 340 300, 320 310, 300 310
                     L 100 310
                     C 80 310, 60 300, 60 280
                     L 60 240
                     C 60 220, 80 200, 100 200
                     L 100 180
                     C 80 180, 60 160, 60 140
                     L 60 100
                     C 60 60, 100 20, 140 20
                     Z"
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Nasal cavity */}
                <path
                  d="M 140 20
                     C 140 40, 120 60, 100 60
                     L 80 60
                     C 60 60, 60 80, 80 80
                     L 220 80
                     C 240 80, 240 60, 220 60
                     L 180 60
                     C 160 60, 140 40, 140 20"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Palate (roof of mouth) */}
                <path
                  d="M 100 80
                     C 120 85, 180 90, 220 80"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Velum (soft palate) */}
                <path
                  d="M 220 80
                     C 240 90, 250 110, 240 130
                     C 235 140, 225 145, 215 140"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Uvula */}
                <ellipse
                  cx="218"
                  cy="148"
                  rx="8"
                  ry="12"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Tongue body */}
                <path
                  d="M 80 200
                     C 100 180, 140 160, 180 170
                     C 200 175, 210 190, 200 210
                     C 180 240, 120 240, 80 220
                     Z"
                  fill="hsl(var(--accent) / 0.3)"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Lips */}
                <path
                  d="M 60 140
                     C 40 140, 30 150, 30 160
                     C 30 170, 40 180, 60 180"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Lower lip */}
                <path
                  d="M 60 180
                     C 50 185, 45 195, 60 200"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Teeth (upper) */}
                <rect
                  x="58"
                  y="130"
                  width="8"
                  height="15"
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1"
                />

                {/* Teeth (lower) */}
                <rect
                  x="58"
                  y="185"
                  width="8"
                  height="12"
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1"
                />

                {/* Pharynx/throat area */}
                <path
                  d="M 240 160
                     L 250 200
                     L 250 280
                     C 250 300, 230 310, 200 310"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />

                {/* Epiglottis */}
                <path
                  d="M 215 200
                     C 225 190, 235 195, 230 210
                     C 228 220, 220 225, 215 220"
                  fill="hsl(var(--accent) / 0.3)"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                />

                {/* Larynx outline */}
                <path
                  d="M 200 250
                     L 180 270
                     L 180 290
                     L 220 290
                     L 220 270
                     L 200 250"
                  fill="none"
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
                        r={isSelected ? 14 : 10}
                        fill={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
                        stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
                        strokeWidth={isSelected ? 2 : 1}
                        className="transition-all duration-200"
                      />
                      <text
                        x={svgX}
                        y={svgY + 4}
                        textAnchor="middle"
                        fontSize={isSelected ? 14 : 11}
                        fontWeight={isSelected ? "bold" : "normal"}
                        fill={isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"}
                        className="pointer-events-none select-none"
                      >
                        {pos.label}
                      </text>
                    </g>
                  );
                })}

                {/* User's vowel position (highlighted) */}
                {userVowel && (
                  <g>
                    <circle
                      cx={120 + (userVowel.x / 100) * 100}
                      cy={80 + (userVowel.y / 100) * 100}
                      r={18}
                      fill="hsl(var(--destructive) / 0.2)"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={3}
                      className="animate-pulse"
                    />
                    <circle
                      cx={120 + (userVowel.x / 100) * 100}
                      cy={80 + (userVowel.y / 100) * 100}
                      r={6}
                      fill="hsl(var(--destructive))"
                    />
                    <text
                      x={120 + (userVowel.x / 100) * 100}
                      y={80 + (userVowel.y / 100) * 100 - 25}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight="bold"
                      fill="hsl(var(--destructive))"
                    >
                      Your vowel
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Vowel selector panel */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Select Vowel</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(vowelPositions).map(([key, pos]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedVowel(key)}
                    className={`w-10 h-10 rounded-lg text-lg font-medium transition-all ${
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
                <h4 className="text-sm font-medium text-foreground mb-2">Legend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary"></span>
                    <span className="text-muted-foreground">Target vowel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-destructive"></span>
                    <span className="text-muted-foreground">Your pronunciation</span>
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
