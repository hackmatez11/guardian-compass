import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";

// Counselor pages
import CounselorDashboard from "./pages/counselor/CounselorDashboard";
import CounselorAtRisk from "./pages/counselor/CounselorAtRisk";
import CounselorSessions from "./pages/counselor/CounselorSessions";
import CounselorRecommendations from "./pages/counselor/CounselorRecommendations";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAcademics from "./pages/student/StudentAcademics";
import StudentCounseling from "./pages/student/StudentCounseling";
import StudentSurvey from "./pages/student/StudentSurvey";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

            {/* Counselor Routes */}
            <Route path="/counselor" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorDashboard /></ProtectedRoute>} />
            <Route path="/counselor/at-risk" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorAtRisk /></ProtectedRoute>} />
            <Route path="/counselor/sessions" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorSessions /></ProtectedRoute>} />
            <Route path="/counselor/recommendations" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorRecommendations /></ProtectedRoute>} />

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/academics" element={<ProtectedRoute allowedRoles={['student']}><StudentAcademics /></ProtectedRoute>} />
            <Route path="/student/counseling" element={<ProtectedRoute allowedRoles={['student']}><StudentCounseling /></ProtectedRoute>} />
            <Route path="/student/survey" element={<ProtectedRoute allowedRoles={['student']}><StudentSurvey /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;