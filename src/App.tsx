import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import PronunciationPage from "./pages/PronunciationPage";
import PronunciationResultsPage from "./pages/PronunciationResultsPage";
import VisualizationPage from "./pages/VisualizationPage";
import PracticePage from "./pages/PracticePage";
import IPALibraryPage from "./pages/IPALibraryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/pronunciation" element={<PronunciationPage />} />
                    <Route path="/pronunciation/results" element={<PronunciationResultsPage />} />
                    <Route path="/visualization" element={<VisualizationPage />} />
                    <Route path="/practice" element={<PracticePage />} />
                    <Route path="/ipa-library" element={<IPALibraryPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
