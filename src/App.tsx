import React from "react";
import { lazy, Suspense } from "react";
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { LanguageProvider } from "@/shared/contexts/LanguageContext";
import { AccessibilityProvider } from "@/shared/contexts/AccessibilityContext";
import AppLayout from "@/shared/components/AppLayout";

// Shared pages
import LandingNoVideoPage from "@/shared/pages/LandingNoVideoPage";
import SignInFlowPage from "@/shared/pages/SignInFlowPage";
import PricingPage from "@/shared/pages/PricingPage";
const AuthPage = lazy(() => import("@/shared/pages/AuthPage"));
const Index = lazy(() => import("@/shared/pages/Index"));
const RoleSelectionPage = lazy(() => import("@/shared/pages/RoleSelectionPage"));
const OnboardingPage = lazy(() => import("@/shared/pages/OnboardingPage"));
const NotFound = lazy(() => import("@/shared/pages/NotFound"));
const ResourcesPage = lazy(() => import("@/shared/pages/ResourcesPage"));
const SpeechTherapyInfoPage = lazy(() => import("@/shared/pages/SpeechTherapyInfoPage"));
const AboutSpeechTherapyPage = lazy(() => import("@/shared/pages/AboutSpeechTherapyPage"));
const TermsPage = lazy(() => import("@/shared/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/shared/pages/PrivacyPage"));
const RedFlagsPage = lazy(() => import("@/shared/pages/RedFlagsPage"));
const LazySoundPage = lazy(() => import("@/shared/pages/LazySoundPage"));

// Enhancement - Student Portal
const DashboardPage = lazy(() => import("@/enhancement/student-portal/pages/DashboardPage"));
const TreasureMapPage = lazy(() => import("@/enhancement/student-portal/pages/TreasureMapPage"));
const ExplorerOnboardingPage = lazy(() => import("@/enhancement/student-portal/pages/ExplorerOnboardingPage"));
const ExplorerDashboardPage = lazy(() => import("@/enhancement/student-portal/pages/ExplorerDashboardPage"));
const EchoSpeechPage = lazy(() => import("@/enhancement/student-portal/pages/EchoSpeechPage"));
const PronunciationResultsPage = lazy(() => import("@/enhancement/student-portal/pages/PronunciationResultsPage"));
const SpeechQuestPage = lazy(() => import("@/enhancement/student-portal/pages/SpeechQuestPage"));
const LessonPage = lazy(() => import("@/enhancement/student-portal/pages/LessonPage"));
const PiPiPage = lazy(() => import("@/enhancement/student-portal/pages/PiPiPage"));
const SettingsPage = lazy(() => import("@/enhancement/student-portal/pages/SettingsPage"));
const ProgressPage = lazy(() => import("@/enhancement/student-portal/pages/ProgressPage"));
const PirateTreasureMapPage = lazy(() => import("@/enhancement/student-portal/pages/PirateTreasureMapPage"));
const AdventureStartPage = lazy(() => import("@/enhancement/student-portal/pages/AdventureStartPage"));
const ExercisePage = lazy(() => import("@/enhancement/student-portal/pages/ExercisePage"));
const SemanticIslandPage = lazy(() => import("@/enhancement/student-portal/pages/SemanticIslandPage"));

// Enhancement - Parent Portal
const ParentDashboardPage = lazy(() => import("@/enhancement/parent-portal/pages/ParentDashboardPage"));

// Enhancement - Aura Journey (Syali Studio merged)
const AuraStoryPage = lazy(() => import("@/enhancement/aura-journey/AuraStoryPage"));
const EnchantedForestPage = lazy(() => import("@/enhancement/aura-journey/EnchantedForestPage"));
const AuraJourneyPage = lazy(() => import("@/enhancement/aura-journey/AuraJourneyPage"));

// Improvement - Therapist Portal
const TherapistPortalPage = lazy(() => import("@/improvement/therapist-portal/pages/TherapistPortalPage"));
const STDashboardPage = lazy(() => import("@/improvement/therapist-portal/pages/STDashboardPage"));
const STAccountsPage = lazy(() => import("@/improvement/therapist-portal/pages/STAccountsPage"));
const STSettingsPage = lazy(() => import("@/improvement/therapist-portal/pages/STSettingsPage"));
const STLayout = lazy(() => import("@/improvement/therapist-portal/components/STLayout").then(m => ({ default: m.STLayout })));

// Improvement - NEPA Portal
const NEPADashboardPage = lazy(() => import("@/improvement/nepa-portal/pages/NEPADashboardPage"));
const MiniGameBuilderPage = lazy(() => import("@/improvement/nepa-portal/pages/MiniGameBuilderPage"));

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
                {/* ─── Public routes (no auth required) ─── */}
                <Route path="/" element={<LandingNoVideoPage />} />
                <Route path="/legacy-home" element={<Index />} />
                <Route path="/auth" element={<SignInFlowPage />} />
                <Route path="/auth-legacy" element={<AuthPage />} />
                <Route path="/role-select" element={<RoleSelectionPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/explorer/onboarding/*" element={<ExplorerOnboardingPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/adventure-start" element={<AdventureStartPage />} />
                <Route path="/ngo" element={<ResourcesPage />} />
                <Route path="/resources/find-provider" element={<SpeechTherapyInfoPage />} />
                <Route path="/lazy-sound" element={<LazySoundPage />} />
                <Route path="/aura-story" element={<AuraStoryPage />} />
                <Route path="/enchanted-forest" element={<EnchantedForestPage />} />
                <Route path="/aura-journey" element={<AuraJourneyPage />} />
                <Route path="/pirate-treasure-map" element={<PirateTreasureMapPage />} />

                {/* ─── Improvement: Therapist routes (require therapist role) ─── */}
                <Route element={<ProtectedRoute allowedRoles={['therapist']} />}>
                  <Route element={<STLayout />}>
                    <Route path="/st-dashboard" element={<STDashboardPage />} />
                    <Route path="/st-nepa" element={<NEPADashboardPage />} />
                    <Route path="/st-game-builder" element={<MiniGameBuilderPage />} />
                    <Route path="/st-accounts" element={<STAccountsPage />} />
                    <Route path="/st-settings" element={<STSettingsPage />} />
                  </Route>
                  <Route path="/therapist-portal" element={<TherapistPortalPage />} />
                </Route>

                {/* ─── Enhancement: Parent routes (require parent role) ─── */}
                <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
                  <Route path="/parent-dashboard" element={<ParentDashboardPage />} />
                </Route>

                {/* ─── Enhancement: Explorer/Student routes (require explorer role) ─── */}
                <Route element={<ProtectedRoute allowedRoles={['explorer']} />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/explorer" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/practice/:exerciseId" element={<ExercisePage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/echo-speech" element={<EchoSpeechPage />} />
                    <Route path="/pronunciation/results" element={<PronunciationResultsPage />} />
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
                  </Route>
                </Route>

                {/* ─── Premium routes (require plus or pro plan) ─── */}
                <Route element={<ProtectedRoute allowedRoles={['explorer']} requiredPlan="plus" requireSubscription />}>
                  <Route path="/speech-quest" element={<SpeechQuestPage />} />
                </Route>

                {/* ─── Pro-only routes ─── */}
                <Route element={<ProtectedRoute allowedRoles={['explorer']} requiredPlan="pro" requireSubscription />}>
                  {/* Future pro-only features can be added here */}
                </Route>

                {/* ─── Catch-all ─── */}
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
