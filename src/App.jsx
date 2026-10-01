import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Home from './pages/Home';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AskHelpPage from './pages/AskHelpPage';
import AdminDashboard from './pages/AdminDashboard';
import ClassroomPage from './pages/ClassroomPage';
import AssignmentsPage from './pages/AssignmentsPage';
import MessagesPage from './pages/MessagesPage';
import FeesPage from './pages/FeesPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentPortal from './pages/StudentPortal';
import StudentLogin from './pages/StudentLogin';
import InstructorDashboard from './pages/InstructorDashboard';
import Library from './pages/Library';
import AITeachers from './pages/AITeachers';
import Certificates from './pages/Certificates';
import LiveClasses from './pages/LiveClasses';
import ClassDashboard from './pages/ClassDashboard';
import NovdecPage from './pages/NovdecPage';
import CodeboxPage from './pages/CodeboxPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/course/:id" element={<CourseDetailPage />} />
      <Route path="/classroom/:id" element={<ClassroomPage />} />
      <Route path="/assignments/:courseId" element={<AssignmentsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/fees" element={<FeesPage />} />
      <Route path="/library" element={<Library />} />
      <Route path="/ai-teachers" element={<AITeachers />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/live-classes" element={<LiveClasses />} />
      <Route path="/class-dashboard" element={<ClassDashboard />} />
      <Route path="/novdec" element={<NovdecPage />} />
      <Route path="/codebox" element={<CodeboxPage />} />
      <Route path="/ask" element={<AskHelpPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/instructor" element={<InstructorDashboard />} />
      <Route path="/student-portal" element={<StudentPortal />} />
      <Route path="/student-login" element={<StudentLogin />} />
      {/* Add your page Route elements here */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App