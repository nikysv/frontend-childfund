import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Diagnostic from "./pages/Diagnostic";
import Dashboard from "./pages/Dashboard";
import Learning from "./pages/Learning";
import CourseDetail from "./pages/CourseDetail";
import Business from "./pages/Business";
import KPIs from "./pages/KPIs";
import Mentor from "./pages/Mentor";
import Community from "./pages/Community";
import Courses from "./pages/Courses";
import Achievements from "./pages/Achievements";
import CalendarView from "./pages/Calendar";
import SoftSkills from "./pages/SoftSkills";
import Profile from "./pages/Profile";
import Certifications from "./pages/Certifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/diagnostic" element={<Diagnostic />} />

          {/* Protected routes with layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/learning/:courseId" element={<CourseDetail />} />
            <Route path="/business" element={<Business />} />
            <Route path="/kpis" element={<KPIs />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/community" element={<Community />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/soft-skills" element={<SoftSkills />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
