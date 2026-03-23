import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import ExplorerOnboardingPage from "./pages/ExplorerOnboardingPage";
import ExplorerDashboardPage from "./pages/ExplorerDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";
import EchoSpeechPage from "./pages/EchoSpeechPage";
import PronunciationResultsPage from "./pages/PronunciationResultsPage";
import SpeechQuestPage from "./pages/SpeechQuestPage";
import LessonPage from "./pages/LessonPage";
import STDashboardPage from "./pages/STDashboardPage";
import AboutPage from "./pages/AboutPage";
import SpeechTherapyInfoPage from "./pages/SpeechTherapyInfoPage";
import AboutSpeechTherapyPage from "./pages/AboutSpeechTherapyPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import IPALibraryPage from "./pages/IPALibraryPage";
import IPAPage from "./pages/IPAPage";
import ResourcesPage from "./pages/ResourcesPage";
import VisualizationPage from "./pages/VisualizationPage";
import NotFound from "./pages/NotFound";
import ComingSoonPage from "./pages/ComingSoonPage";
import PricingPage from "./pages/PricingPage";
import InstitutionPlansPage from "./pages/InstitutionPlansPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmSignupPage from "./pages/ConfirmSignupPage";
import InvitePage from "./pages/InvitePage";
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
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/confirm" element={<ConfirmSignupPage />} />
              <Route path="/auth/invite" element={<InvitePage />} />
              <Route path="/role-select" element={<RoleSelectionPage />} />
              <Route path="/explorer/onboarding" element={<ExplorerOnboardingPage />} />
              <Route path="/" element={<Index />} />
              <Route element={<AppLayout />}>
                <Route path="/explorer" element={<ExplorerDashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />
                <Route path="/echo-speech" element={<EchoSpeechPage />} />
                <Route path="/pronunciation/results" element={<PronunciationResultsPage />} />
                <Route path="/speech-quest" element={<SpeechQuestPage />} />
                <Route path="/lesson/:lessonId" element={<LessonPage />} />
                <Route path="/st-dashboard" element={<STDashboardPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/resources/find-provider" element={<SpeechTherapyInfoPage />} />
                <Route path="/resources/speech-therapy-info" element={<AboutSpeechTherapyPage />} />
                <Route path="/speech-therapy-info" element={<SpeechTherapyInfoPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/ipa" element={<IPAPage />} />
                <Route path="/learning/library" element={<IPALibraryPage />} />
                <Route path="/learning/progress" element={<VisualizationPage />} />
                <Route path="/ipa-transcription" element={<ComingSoonPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/pricing/institutions" element={<InstitutionPlansPage />} />
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
