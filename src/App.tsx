import AuthPage from "./pages/AuthPage";
import React from "react";
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const TreasureMapPage = React.lazy(() => import("./pages/TreasureMapPage"));
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import AppLayout from "./components/AppLayout";
import { STLayout } from "./components/STLayout";
import { lazy, Suspense } from "react";
import LandingNoVideoPage from "./pages/LandingNoVideoPage";
import SignInFlowPage from "./pages/SignInFlowPage";

const TherapistPortalPage = lazy(() => import("./pages/TherapistPortalPage"));
const Index = lazy(() => import("./pages/Index"));
const RoleSelectionPage = lazy(() => import("./pages/RoleSelectionPage"));
const ExplorerOnboardingPage = lazy(() => import("./pages/ExplorerOnboardingPage"));
const ExplorerDashboardPage = lazy(() => import("./pages/ExplorerDashboardPage"));
const EchoSpeechPage = lazy(() => import("./pages/EchoSpeechPage"));
const PronunciationResultsPage = lazy(() => import("./pages/PronunciationResultsPage"));
const SpeechQuestPage = lazy(() => import("./pages/SpeechQuestPage"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const STDashboardPage = lazy(() => import("./pages/STDashboardPage"));
const NEPADashboardPage = lazy(() => import("./pages/NEPADashboardPage"));
const STAccountsPage = lazy(() => import("./pages/STAccountsPage"));
const STSettingsPage = lazy(() => import("./pages/STSettingsPage"));
const PiPiPage = lazy(() => import("./pages/PiPiPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const SpeechTherapyInfoPage = lazy(() => import("./pages/SpeechTherapyInfoPage"));
const AboutSpeechTherapyPage = lazy(() => import("./pages/AboutSpeechTherapyPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuraStoryPage = lazy(() => import("./pages/AuraStoryPage"));
const EnchantedForestPage = lazy(() => import("./pages/EnchantedForestPage"));
const AuraJourneyPage = lazy(() => import("./pages/AuraJourneyPage"));
const MiniGameBuilderPage = lazy(() => import("./pages/MiniGameBuilderPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const ParentDashboardPage = lazy(() => import("./pages/ParentDashboardPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));

const AdventureStartPage = lazy(() => import("./pages/AdventureStartPage"));
const ExercisePage = lazy(() => import("./pages/ExercisePage"));
const SemanticIslandPage = lazy(() => import("./pages/SemanticIslandPage"));
const RedFlagsPage = lazy(() => import("./pages/RedFlagsPage"));
const LazySoundPage = lazy(() => import("./pages/LazySoundPage"));

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
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<LazyFallback />}>
              <Routes>
                {/* Standalone pages (no bottom nav) */}
                <Route path="/" element={<LandingNoVideoPage />} />
                <Route path="/legacy-home" element={<Index />} />
                <Route path="/auth" element={<SignInFlowPage />} />
                <Route path="/auth-legacy" element={<AuthPage />} />
                <Route path="/role-select" element={<RoleSelectionPage />} />
                <Route path="/explorer/onboarding/*" element={<ExplorerOnboardingPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/adventure-start" element={<AdventureStartPage />} />
                <Route path="/ngo" element={<ResourcesPage />} />
                <Route path="/resources/find-provider" element={<SpeechTherapyInfoPage />} />
                <Route path="/lazy-sound" element={<LazySoundPage />} />
                <Route path="/aura-story" element={<AuraStoryPage />} />
                <Route path="/enchanted-forest" element={<EnchantedForestPage />} />
                <Route path="/aura-journey" element={<AuraJourneyPage />} />

                {/* ST pages with therapist nav */}
                <Route element={<STLayout />}>
                  <Route path="/st-dashboard" element={<STDashboardPage />} />
                  <Route path="/st-nepa" element={<NEPADashboardPage />} />
                  <Route path="/st-game-builder" element={<MiniGameBuilderPage />} />
                  <Route path="/st-accounts" element={<STAccountsPage />} />
                  <Route path="/st-settings" element={<STSettingsPage />} />
                </Route>

                {/* Explorer pages with learner bottom nav, protected by auth */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/explorer" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/practice/:exerciseId" element={<ExercisePage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/echo-speech" element={<EchoSpeechPage />} />
                    <Route path="/pronunciation/results" element={<PronunciationResultsPage />} />
                    <Route path="/speech-quest" element={<SpeechQuestPage />} />
                    <Route path="/lesson/:lessonId" element={<LessonPage />} />
                    <Route path="/semantic-island" element={<SemanticIslandPage />} />
                    <Route path="/pipi" element={<PiPiPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/resources/speech-therapy-info" element={<AboutSpeechTherapyPage />} />
                    <Route path="/red-flags" element={<RedFlagsPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/treasure-map" element={<TreasureMapPage />} />
                    <Route path="/therapist-portal" element={<TherapistPortalPage />} />
                  </Route>
                  <Route path="/parent-dashboard" element={<ParentDashboardPage />} />
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
