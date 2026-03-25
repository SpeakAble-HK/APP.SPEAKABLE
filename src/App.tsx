import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AppLayout } from "./components/AppLayout";
import { STLayout } from "./components/STLayout";
import { lazy, Suspense } from "react";

import Index from "./pages/Index";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import ExplorerOnboardingPage from "./pages/ExplorerOnboardingPage";
import ExplorerDashboardPage from "./pages/ExplorerDashboardPage";
import EchoSpeechPage from "./pages/EchoSpeechPage";
import PronunciationResultsPage from "./pages/PronunciationResultsPage";
import SpeechQuestPage from "./pages/SpeechQuestPage";
import LessonPage from "./pages/LessonPage";
import STDashboardPage from "./pages/STDashboardPage";
import STAccountsPage from "./pages/STAccountsPage";
import STSettingsPage from "./pages/STSettingsPage";
import PiPiPage from "./pages/PiPiPage";
import SettingsPage from "./pages/SettingsPage";
import ResourcesPage from "./pages/ResourcesPage";
import SpeechTherapyInfoPage from "./pages/SpeechTherapyInfoPage";
import AboutSpeechTherapyPage from "./pages/AboutSpeechTherapyPage";
import IPALibraryPage from "./pages/IPALibraryPage";
import IPAPage from "./pages/IPAPage";
import VisualizationPage from "./pages/VisualizationPage";
import NotFound from "./pages/NotFound";
import ComingSoonPage from "./pages/ComingSoonPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

const AdventureStartPage = lazy(() => import("./pages/AdventureStartPage"));
const SemanticIslandPage = lazy(() => import("./pages/SemanticIslandPage"));
const RedFlagsPage = lazy(() => import("./pages/RedFlagsPage"));

const queryClient = new QueryClient();

function LazyFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="shimmer-skeleton w-12 h-12 rounded-full" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AccessibilityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LazyFallback />}>
              <Routes>
                {/* Standalone pages (no bottom nav) */}
                <Route path="/" element={<Index />} />
                <Route path="/role-select" element={<RoleSelectionPage />} />
                <Route path="/explorer/onboarding" element={<ExplorerOnboardingPage />} />
                <Route path="/adventure-start" element={<AdventureStartPage />} />
                <Route path="/ngo" element={<ResourcesPage />} />

                {/* ST pages with therapist nav */}
                <Route element={<STLayout />}>
                  <Route path="/st-dashboard" element={<STDashboardPage />} />
                  <Route path="/st-accounts" element={<STAccountsPage />} />
                  <Route path="/st-settings" element={<STSettingsPage />} />
                </Route>

                {/* Explorer pages with learner bottom nav */}
                <Route element={<AppLayout />}>
                  <Route path="/explorer" element={<ExplorerDashboardPage />} />
                  <Route path="/echo-speech" element={<EchoSpeechPage />} />
                  <Route path="/pronunciation/results" element={<PronunciationResultsPage />} />
                  <Route path="/speech-quest" element={<SpeechQuestPage />} />
                  <Route path="/lesson/:lessonId" element={<LessonPage />} />
                  <Route path="/semantic-island" element={<SemanticIslandPage />} />
                  <Route path="/pipi" element={<PiPiPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/resources/find-provider" element={<SpeechTherapyInfoPage />} />
                  <Route path="/resources/speech-therapy-info" element={<AboutSpeechTherapyPage />} />
                  <Route path="/red-flags" element={<RedFlagsPage />} />
                  <Route path="/ipa" element={<IPAPage />} />
                  <Route path="/learning/library" element={<IPALibraryPage />} />
                  <Route path="/learning/progress" element={<VisualizationPage />} />
                  <Route path="/ipa-transcription" element={<ComingSoonPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
