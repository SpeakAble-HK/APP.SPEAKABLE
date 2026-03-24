import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AppLayout } from "./components/AppLayout";
import { STLayout } from "./components/STLayout";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AccessibilityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Standalone pages (no bottom nav) */}
              <Route path="/" element={<Index />} />
              <Route path="/role-select" element={<RoleSelectionPage />} />
              <Route path="/explorer/onboarding" element={<ExplorerOnboardingPage />} />

              {/* ST pages with ST bottom nav */}
              <Route element={<STLayout />}>
                <Route path="/st-dashboard" element={<STDashboardPage />} />
                <Route path="/st-accounts" element={<STAccountsPage />} />
                <Route path="/st-settings" element={<STSettingsPage />} />
              </Route>

              {/* Explorer pages with bottom nav */}
              <Route element={<AppLayout />}>
                <Route path="/explorer" element={<ExplorerDashboardPage />} />
                <Route path="/echo-speech" element={<EchoSpeechPage />} />
                <Route path="/pronunciation/results" element={<PronunciationResultsPage />} />
                <Route path="/speech-quest" element={<SpeechQuestPage />} />
                <Route path="/lesson/:lessonId" element={<LessonPage />} />
                <Route path="/pipi" element={<PiPiPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/resources/find-provider" element={<SpeechTherapyInfoPage />} />
                <Route path="/resources/speech-therapy-info" element={<AboutSpeechTherapyPage />} />
                <Route path="/ipa" element={<IPAPage />} />
                <Route path="/learning/library" element={<IPALibraryPage />} />
                <Route path="/learning/progress" element={<VisualizationPage />} />
                <Route path="/ipa-transcription" element={<ComingSoonPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
