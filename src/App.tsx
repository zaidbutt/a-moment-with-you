import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StoryCreator from "./pages/StoryCreator";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import StoryDetail from "./pages/StoryDetail";
import ChapterView from "./pages/ChapterView";
import MomentCreate from "./pages/MomentCreate";
import UserProfile from "./pages/UserProfile";
import StoryManagement from "./pages/StoryManagement";
import QuestionsPage from "./pages/QuestionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<StoryCreator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/story/:id" element={<StoryDetail />} />
          <Route path="/story/:id/manage" element={<StoryManagement />} />
          <Route path="/chapter/:id" element={<ChapterView />} />
          <Route path="/moment/create" element={<MomentCreate />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/questions" element={<QuestionsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
