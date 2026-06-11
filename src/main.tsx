import "./shared/i18n/config";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource-variable/noto-sans-hk/index.css";
import "./shared/styles/cross-browser.css";
import "./shared/styles/portal-design-system.css";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ── iOS Safari 100vh fix ────────────────────────────────────────
// iOS Safari's viewport height includes the browser chrome, so
// `100vh` overshoots the visible area. We compute the real value
// and expose it as --vh so components can use calc(var(--vh)*100).
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

setVH();
window.addEventListener("resize", setVH, { passive: true });
window.addEventListener("orientationchange", setVH, { passive: true });
// ───────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")!).render(<App />);
