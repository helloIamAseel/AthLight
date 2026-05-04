import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FollowingProvider } from "@/contexts/FollowingContext";
import Index from "./pages/Index";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CheckEmail from "./pages/CheckEmail";
import ResetPassword from "./pages/ResetPassword";
import PasswordChanged from "./pages/PasswordChanged";
import Login from "./pages/Login";
import Feedback from "./pages/Feedback";
import Feed from "./pages/Feed";
import CoachFeed from "./pages/CoachFeed";
import CoachFeedbackHistory from "./pages/CoachFeedbackHistory";
import ScoutFeed from "./pages/ScoutFeed";
import Explore from "./pages/Explore";
import CoachExplore from "./pages/CoachExplore";
import ScoutExplore from "./pages/ScoutExplore";
import ScoutProfile from "./pages/ScoutProfile";
import ViewReport from "./pages/ViewReport";
import ExploreSearch from "./pages/ExploreSearch";
import AthleteProfile from "./pages/AthleteProfile";
import AthleteEditProfile from "./pages/AthleteEditProfile";
import AthleteVideos from "./pages/AthleteVideos";
import CoachProfile from "./pages/CoachProfile";
import CoachEditProfile from "./pages/CoachEditProfile";
import ScoutEditProfile from "./pages/ScoutEditProfile";
import ScoutHistory from "./pages/ScoutHistory";
import ScoutSavedProfiles from "./pages/ScoutSavedProfiles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FollowingProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/password-changed" element={<PasswordChanged />} />
          <Route path="/login" element={<Login />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/feeds" element={<Feed />} />
          <Route path="/coach-feed" element={<CoachFeed />} />
          <Route path="/coach-feedback-history" element={<CoachFeedbackHistory />} />
          <Route path="/scout-feed" element={<ScoutFeed />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/coach-explore" element={<CoachExplore />} />
          <Route path="/scout-explore" element={<ScoutExplore />} />
          <Route path="/reports" element={<ViewReport />} />
          <Route path="/explore-search" element={<ExploreSearch />} />
            <Route path="/athlete-profile" element={<AthleteProfile />} />
            <Route path="/athlete-edit-profile" element={<AthleteEditProfile />} />
            <Route path="/athlete-videos" element={<AthleteVideos />} />
          <Route path="/coach-profile" element={<CoachProfile />} />
          <Route path="/coach-edit-profile" element={<CoachEditProfile />} />
          <Route path="/scout-profile" element={<ScoutProfile />} />
          <Route path="/scout-edit-profile" element={<ScoutEditProfile />} />
          <Route path="/scout-history" element={<ScoutHistory />} />
          <Route path="/scout-saved-profiles" element={<ScoutSavedProfiles />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </FollowingProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
