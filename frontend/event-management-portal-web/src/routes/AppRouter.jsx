import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";

// Public Pages
import VangLaiPage from "../pages/public/VangLaiPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/public/NotFoundPage";
import EventDetail from "../pages/public/EventDetailPage";
import EventsPage from "../pages/public/EventsPage";
import InvitationAcceptancePage from "../pages/public/InvitationAcceptancePage";
import AttendancePage from "../pages/public/AttendancePage";
import NewsPage from "../pages/public/NewsPage";
import EventPostList from "../pages/public/EventPostList";
import CalendarPage from "../pages/public/CalendarPage";
import ResetPassword from "../pages/auth/ResetPassword";
import ForgotPassword from "../pages/auth/ForgotPassword";
import PublicProfilePage from "../pages/public/PublicProfilePage";
import PostDetailPage from "../pages/public/PostDetailPage";
import GuestEventsPage from "../pages/public/GuestEventsPage";

// Layouts
import DashboardLayout from "../components/layout/DashboardLayout";

// Student Pages
import StudentEventsPage from "../pages/user/StudentEventsPage";
import StudentEventDetailPage from "../pages/user/StudentEventDetailPage";
import StudentNotificationsPage from "../pages/user/StudentNotificationsPage";
import StudentPostManagement from "../pages/user/StudentPostManagement";
import StudentPostDetailPage from "../pages/user/StudentPostDetailPage";
import StudentTemplatesPage from "../pages/user/StudentTemplatesPage";
import StudentLuckyDrawManagement from "../pages/user/StudentLuckyDrawManagement";

// Common Pages
import Dashboard from "../pages/common/Dashboard";
import LuckyDrawConfigPage from "../pages/common/LuckyDrawConfigPage";

// Lecturer Pages
import LecturerEventsPage from "../pages/lecturer/LecturerEventsPage";
import LecturerPlansPage from "../pages/lecturer/LecturerPlansPage";
import LecturerEventDetailPage from "../pages/lecturer/LecturerEventDetailPage";
import LecturerPostManagement from "../pages/lecturer/LecturerPostManagement";
import LecturerPostDetailPage from "../pages/lecturer/LecturerPostDetailPage";
import LecturerNotificationsPage from "../pages/lecturer/LecturerNotificationsPage";
import LecturerProfilePage from "../pages/lecturer/LecturerProfilePage";
import LecturerLuckyDrawManagement from "../pages/lecturer/LecturerLuckyDrawManagement";

// Admin Pages
import AdminEventsPage from "../pages/admin/AdminEventsPage";
import AdminPlansPage from "../pages/admin/AdminPlansPage";
import AdminEventDetailPage from "../pages/admin/AdminEventDetailPage";
import AdminEventCreatorPage from "../pages/admin/AdminEventCreatorPage";
import AdminPostManagement from "../pages/admin/AdminPostManagement";
import AdminPostDetailPage from "../pages/admin/AdminPostDetailPage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage";
import AdminLuckyDrawManagement from "../pages/admin/AdminLuckyDrawManagement";
import AdminTemplatesPage from "../pages/admin/AdminTemplatesPage";
import AdminDepartmentsRolesPage from "../pages/admin/AdminDepartmentsRolesPage";
import AdminAccountsPage from "../pages/admin/AdminAccountsPage";

// Role-Based Management Pages
import LeaderDashboard from "../pages/event-management/LeaderDashboard";
import CoordinatorPage from "../pages/event-management/CoordinatorPage";
import MemberScanPage from "../pages/event-management/MemberScanPage";
import AdvisorPage from "../pages/event-management/AdvisorPage";
import ProfileManagement from "../pages/common/ProfileManagement";
import LecturerTemplatesPage from "../pages/lecturer/LecturerTemplatesPage";

// Scroll To Top Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppRouter = () => {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  const isEventStaff = user?.eventRoles && user.eventRoles.length > 0;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <AnimatePresence mode="wait">
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<VangLaiPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/invitation/accept" element={<InvitationAcceptancePage />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:eventId" element={<EventPostList />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/profile" element={<PublicProfilePage />} />
        <Route path="/guest-events" element={<GuestEventsPage />} />

        {/* --- ROLE BASED DASHBOARD ROUTES --- */}

        {/* Student Routes - Restricted to BTC students only */}
        <Route path="/student" element={
          isAuthenticated && (isAdmin || isEventStaff) 
            ? <DashboardLayout /> 
            : <Navigate to="/profile" replace />
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events">
            <Route index element={<StudentEventsPage />} />
            <Route path=":id" element={<StudentEventDetailPage />} />
          </Route>
          <Route path="posts" element={<StudentPostManagement />} />
          <Route path="posts/:id" element={<StudentPostDetailPage />} />
          <Route path="templates" element={<StudentTemplatesPage />} />
          <Route path="notifications" element={<StudentNotificationsPage />} />
          <Route path="spinner" element={<StudentLuckyDrawManagement />} />
          <Route path="profile" element={<ProfileManagement />} />
        </Route>

        {/* Lecturer Routes */}
        <Route path="/lecturer" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="plans" element={<LecturerPlansPage />} />
          <Route path="events">
            <Route index element={<LecturerEventsPage />} />
            <Route path=":id" element={<LecturerEventDetailPage />} />
          </Route>
          <Route path="posts" element={<LecturerPostManagement />} />
          <Route path="posts/:id" element={<LecturerPostDetailPage />} />
          <Route path="templates" element={<LecturerTemplatesPage />} />
          <Route path="notifications" element={<LecturerNotificationsPage />} />
          <Route path="spinner" element={<LecturerLuckyDrawManagement />} />
          <Route path="profile" element={<ProfileManagement />} />
        </Route>

        {/* Admin/Super Admin Routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="plans" element={<AdminPlansPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="events/create" element={<AdminEventCreatorPage onBack={() => window.history.back()} />} />
          <Route path="events/edit/:id" element={<AdminEventCreatorPage onBack={() => window.history.back()} />} />
          <Route path="events/:id" element={<AdminEventDetailPage />} />
          <Route path="posts" element={<AdminPostManagement />} />
          <Route path="posts/:id" element={<AdminPostDetailPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="spinner" element={<AdminLuckyDrawManagement />} />
          <Route path="events/:id/lucky-draw/setup" element={<LuckyDrawConfigPage userType="admin" />} />
          <Route path="templates" element={<AdminTemplatesPage />} />
          <Route path="departments" element={<AdminDepartmentsRolesPage />} />
          <Route path="roles" element={<AdminDepartmentsRolesPage />} />
          <Route path="accounts" element={<AdminAccountsPage />} />
          <Route path="profile" element={<ProfileManagement />} />
        </Route>

        {/* Role-Based Management Routes (Special Operations) */}
        <Route path="/events/:eventId/v3">
          <Route path="leader" element={<LeaderDashboard />} />
          <Route path="coordinator" element={<CoordinatorPage />} />
          <Route path="member" element={<MemberScanPage />} />
          <Route path="advisor" element={<AdvisorPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
