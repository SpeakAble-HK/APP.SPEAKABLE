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
import PronunciationResultsPage from "./pages/PronunciationResultsPage";
import SpeechQuestPage from "./pages/SpeechQuestPage";
import AboutPage from "./pages/AboutPage";
import IPALibraryPage from "./pages/IPALibraryPage";
import VisualizationPage from "./pages/VisualizationPage";
import NotFound from "./pages/NotFound";

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
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/pronunciation/results" element={<PronunciationResultsPage />} />
                <Route path="/speech-quest" element={<SpeechQuestPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/learning/library" element={<IPALibraryPage />} />
                <Route path="/learning/progress" element={<VisualizationPage />} />
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
