import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', "sans-serif"],
        body: ['"Be Vietnam Pro"', "sans-serif"],
        label: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
          dim: "#00576A",
          container: "#40CEF3",
          fixed: "#40CEF3",
          "fixed-dim": "#28C0E4",
        },
        "on-primary": {
          DEFAULT: "#E0F6FF",
          container: "#00414F",
          fixed: "#002A34",
          "fixed-variant": "#004A5A",
        },
        "inverse-primary": "#40CEF3",

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          dim: "#843A00",
          container: "#FFC5A6",
          fixed: "#FFC5A6",
          "fixed-dim": "#FFB287",
        },
        "on-secondary": {
          DEFAULT: "#FFF0E9",
          container: "#773400",
          fixed: "#592500",
          "fixed-variant": "#853B00",
        },

        tertiary: {
          DEFAULT: "#745700",
          dim: "#654C00",
          container: "#FFC300",
          fixed: "#FFC300",
          "fixed-dim": "#EEB600",
        },
        "on-tertiary": {
          DEFAULT: "#FFF1DA",
          container: "#574000",
          fixed: "#3F2E00",
          "fixed-variant": "#624900",
        },

        surface: {
          DEFAULT: "#F3F7FB",
          bright: "#F3F7FB",
          dim: "#CED5DB",
          tint: "#006479",
          variant: "#D7DEE3",
          container: {
            DEFAULT: "#E3E9EE",
            low: "#ECF1F6",
            high: "#DDE3E8",
            highest: "#D7DEE3",
            lowest: "#FFFFFF",
          },
        },
        "on-surface": {
          DEFAULT: "#2A2F32",
          variant: "#575C60",
        },
        outline: {
          DEFAULT: "#73777B",
          variant: "#A9AEB1",
        },
        "inverse-surface": "#0A0F12",
        "inverse-on-surface": "#999DA1",

        error: {
          DEFAULT: "#B31B25",
          dim: "#9F0519",
          container: "#FB5151",
        },
        "on-error": {
          DEFAULT: "#FFEFEE",
          container: "#570008",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      borderRadius: {
        DEFAULT: "1rem",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },

      boxShadow: {
        card: "0 10px 40px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 30px -8px rgba(0,100,121,0.15)",
        nav: "0 -10px 40px rgba(0,0,0,0.04)",
        header: "0 20px 50px rgba(0,180,216,0.05)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "pulse-height": {
          "0%, 100%": { height: "20%" },
          "50%": { height: "80%" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pipi-bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        slideLeft: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "match-glow": {
          "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.5)" },
          "50%": { boxShadow: "0 0 20px 8px rgba(34,197,94,0.3)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        waveBar: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        specBar: {
          "0%, 100%": { transform: "scaleY(0.2)" },
          "50%": { transform: "scaleY(1)" },
        },
        floatBlob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(10px,-10px) scale(1.05)" },
          "66%": { transform: "translate(-5px,5px) scale(0.95)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": {
            transform: "translateY(100vh) rotate(720deg)",
            opacity: "0",
          },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-ring":
          "pulse-ring 1.2s cubic-bezier(0.4,0,0.6,1) infinite",
        "pulse-height": "pulse-height 2s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "float-y": "float-y 3s ease-in-out infinite",
        "pipi-bob": "pipi-bob 3.2s ease-in-out infinite",
        slideLeft:
          "slideLeft 2s cubic-bezier(0.4,0,0.2,1) forwards",
        slideRight:
          "slideRight 2s cubic-bezier(0.4,0,0.2,1) forwards",
        fadeIn: "fadeIn 0.45s ease-out",
        fadeUp: "fadeUp 0.45s ease-out",
        "pop-in":
          "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        "match-glow": "match-glow 0.85s ease-out",
        shimmer: "shimmer 1.4s ease-in-out infinite",
        waveBar: "waveBar 0.8s ease-in-out infinite",
        specBar: "specBar 1.2s ease-in-out infinite",
        floatBlob: "floatBlob 18s ease-in-out infinite",
        "confetti-fall": "confetti-fall 1.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
